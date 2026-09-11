import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SatQuery — See Earth. Understand Change.',
  description:
    'Explore satellite imagery, monitor your regions, and take insights into the field.',
  openGraph: {
    title: 'SatQuery — See Earth. Understand Change.',
    description: 'Earth intelligence, made clear.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SatQuery — See Earth. Understand Change.',
    description: 'Earth intelligence, made clear.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
