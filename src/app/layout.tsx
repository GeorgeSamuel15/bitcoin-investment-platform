import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SandboxBadge from '@/components/SandboxBadge';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'Bitcoin Investment — Build your Bitcoin position, one contribution at a time.',
  description:
    'A modern platform for contributing toward a Bitcoin position over time. Bitcoin is volatile and you can lose money. Past performance does not guarantee future results.',
};

// Inline script avoids a flash of the wrong theme: it runs before paint,
// before React hydrates, reading the same localStorage key ThemeToggle uses.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('bi-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="font-body antialiased"
        style={{
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <SandboxBadge />
        <Navbar />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
