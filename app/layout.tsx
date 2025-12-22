import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AeroPerk MCP Server',
  description: 'ChatGPT integration for AeroPerk - Peer-to-peer package delivery via traveling drivers',
  keywords: ['delivery', 'package', 'travel', 'ChatGPT', 'MCP'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
