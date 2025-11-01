import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Sistema de Pagos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema integrado con Stripe para procesamiento de pagos
        </p>
        <Link
          href="/quote"
          className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Ir a Cotización y Checkout
        </Link>
      </div>
    </div>
  );
}
