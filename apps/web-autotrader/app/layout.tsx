import './globals.css';
import React from 'react';

export const metadata = { title: 'Autotrader', description: 'Autotrader app' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
