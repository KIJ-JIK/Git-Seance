/**
 * lib/github.ts
 * GitHub REST API integration for public repository ingestion.
 * Fetches repo metadata, file tree, commit history, and README.
 */

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  archived: boolean;
  topics: string[];
  defaultBranch: string;
  owner: string;
  htmlUrl: string;
}

export interface CommitEntry {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface FileEntry {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  url: string;
}

export interface RepoIngestion {
  metadata: RepoMetadata;
  commits: CommitEntry[];
  files: FileEntry[];
  readme: string | null;
  languages: Record<string, number>;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\.git$/, '');
    const match = cleaned.match(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/?$/
    );
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

async function githubFetch(path: string): Promise<Response> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  return res;
}

export async function ingestRepository(url: string): Promise<RepoIngestion> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('Invalid GitHub URL. Please provide a URL like https://github.com/owner/repo');
  }

  const { owner, repo } = parsed;
  const base = `/repos/${owner}/${repo}`;

  // Fetch repo metadata, commits, and languages in parallel
  const [metaRes, commitsRes, langRes] = await Promise.all([
    githubFetch(base),
    githubFetch(`${base}/commits?per_page=30`),
    githubFetch(`${base}/languages`),
  ]);

  if (!metaRes.ok) {
    if (metaRes.status === 404) {
      throw new Error('Repository not found. It may be private, deleted, or the URL is wrong.');
    }
    if (metaRes.status === 403) {
      throw new Error('GitHub rate limit reached. Wait 60 seconds and try again.');
    }
    throw new Error(`GitHub API error: ${metaRes.status}`);
  }

  const [metaData, commitsData, langData] = await Promise.all([
    metaRes.json(),
    commitsRes.ok ? commitsRes.json() : [],
    langRes.ok ? langRes.json() : {},
  ]);

  // Robust git tree fetching: try HEAD, fall back to default branch or 'master'
  const defaultBranch = metaData.default_branch || 'master';
  let treeData: any = { tree: [] };
  let treeRes = await githubFetch(`${base}/git/trees/HEAD?recursive=1`);
  if (!treeRes.ok) {
    treeRes = await githubFetch(`${base}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`);
  }
  if (treeRes.ok) {
    try {
      treeData = await treeRes.json();
    } catch {
      treeData = { tree: [] };
    }
  }

  // Fetch README separately (base64 encoded)
  let readme: string | null = null;
  try {
    const readmeRes = await githubFetch(`${base}/readme`);
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8').slice(0, 3000);
    }
  } catch {
    // README is optional
  }

  const metadata: RepoMetadata = {
    name: metaData.name,
    fullName: metaData.full_name,
    description: metaData.description,
    language: metaData.language,
    stars: metaData.stargazers_count,
    forks: metaData.forks_count,
    createdAt: metaData.created_at,
    updatedAt: metaData.updated_at,
    pushedAt: metaData.pushed_at,
    archived: metaData.archived,
    topics: metaData.topics || [],
    defaultBranch: metaData.default_branch,
    owner,
    htmlUrl: metaData.html_url,
  };

  const commits: CommitEntry[] = Array.isArray(commitsData)
    ? commitsData.slice(0, 20).map((c: any) => ({
        sha: c.sha?.slice(0, 7) ?? 'unknown',
        message: c.commit?.message?.split('\n')[0] ?? '',
        author: c.commit?.author?.name ?? 'Unknown',
        date: c.commit?.author?.date ?? '',
        url: c.html_url ?? '',
      }))
    : [];

  const files: FileEntry[] = Array.isArray(treeData.tree)
    ? treeData.tree
        .filter((f: any) => f.type === 'blob')
        .slice(0, 150)
        .map((f: any) => ({
          name: f.path.split('/').pop() ?? f.path,
          path: f.path,
          type: f.type,
          size: f.size,
          url: `https://github.com/${owner}/${repo}/blob/${metaData.default_branch}/${f.path}`,
        }))
    : [];

  return { metadata, commits, files, readme, languages: langData };
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`);
  if (!res.ok) throw new Error(`Could not fetch file: ${path}`);
  const data = await res.json();
  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8').slice(0, 8000);
  }
  return data.content ?? '';
}
