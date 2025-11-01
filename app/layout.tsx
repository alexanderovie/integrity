import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pay Integrity Cleaning - Sistema de Pagos',
  description: 'Sistema de pagos integrado con Stripe',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
