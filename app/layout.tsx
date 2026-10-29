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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Freckle+Face&family=Syne:wght@400;600;700;800&family=IM+Fell+English:ital@0;1&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        {/* CRT scanline overlay */}
        <div className="crt-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
