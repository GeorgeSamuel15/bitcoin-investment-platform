import type { Metadata } from 'next';
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SandboxBadge from '@/components/SandboxBadge';
import MobileNav from '@/components/MobileNav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title:
    'Bitcoin Investment — Build your Bitcoin position, one contribution at a time.',
  description:
    'A modern platform for contributing toward a Bitcoin position over time. Bitcoin is volatile and you can lose money. Past performance does not guarantee future results.',
};

// Runs before React hydrates to avoid flashing the wrong theme.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('bi-theme');
    var theme =
      stored ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body
        className="font-body antialiased"
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />

        <SandboxBadge />
        <Navbar />

        <main className="pb-16 md:pb-0">
          {children}
        </main>

        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}