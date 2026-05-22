import type { Metadata } from 'next';
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { LangProvider } from '@/context/LangContext';
import { AuthProvider } from '@/context/AuthContext';
import { EngineProvider } from '@/context/EngineContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Speedy OHADA — États financiers SYSCOHADA',
  description:
    'Générez vos états financiers OHADA/SYSCOHADA en quelques minutes. Import de balance, validation, génération et export PDF/Excel.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full`}>
      <body className="min-h-full bg-bg text-ink antialiased">
        <LangProvider><AuthProvider><EngineProvider>{children}</EngineProvider></AuthProvider></LangProvider>
      </body>
    </html>
  );
}
