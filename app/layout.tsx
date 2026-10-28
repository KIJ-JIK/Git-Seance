import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Git Séance — Resurrect Abandoned Code',
  description:
    'A digital séance for abandoned open-source repositories. Summon the ghost of the original maintainer, perform a spectral code review, and generate haunted resurrection diffs — powered by open-weight AI.',
  keywords: ['open-source', 'AI', 'Gemma', 'Hacktoberfest', 'Halloween', 'ghost', 'git', 'code review'],
  openGraph: {
    title: 'Git Séance',
    description: 'Summon the ghost of your abandoned repository',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* CRT scanline overlay */}
        <div className="crt-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
