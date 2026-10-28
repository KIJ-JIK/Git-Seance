'use client';

interface Props {
  content: string;
}

export default function DiffViewer({ content }: Props) {
  const lines = content.split('\n');

  return (
    <div className="diff-viewer">
      {lines.map((line, i) => {
        let className = '';
        if (line.startsWith('+') && !line.startsWith('+++')) className = 'diff-add';
        else if (line.startsWith('-') && !line.startsWith('---')) className = 'diff-remove';
        else if (line.startsWith('##')) className = 'diff-ghost';
        else if (line.startsWith('@@')) className = 'diff-hunk';

        return (
          <div key={i} className={className} style={{ padding: '1px 4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
}
