import './globals.css';
import React from 'react';

export const metadata = { title: 'Automart', description: 'Automart app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
