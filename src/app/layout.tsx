import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Living City & Digital Passport Simulation',
  description: 'Autonomous AI agents with digital passports elevating their standard of living via Inception Mercury 2.5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
