'use client';

import { ServiceItem } from '@/lib/stripe';
import { useState } from 'react';

interface StripeCheckoutButtonProps {
  service: ServiceItem;
  className?: string;
}

export default function StripeCheckoutButton({
  service,
  className = ''
}: StripeCheckoutButtonProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [error, setError] = useState<string>('');

  const handleCheckout = async (): Promise<void> => {
    if (!customerEmail || !customerName) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setError('');

    setLoading(true);

    try {
      // Crear sesión de checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          customerEmail,
          customerName,
        }),
      });

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error('No se pudo crear la sesión de pago');
      }

      // Obtener la URL completa de la sesión de checkout
      const sessionResponse = await fetch(`/api/checkout-session/${sessionId}`);
      const { url } = await sessionResponse.json();

      // Redirigir a la URL completa de checkout de Stripe
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', error);
      setError(`Error al procesar el pago: ${errorMessage}. Por favor intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tu nombre completo"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="tu@email.com"
          required
        />
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        {loading ? 'Procesando...' : `Pagar $${(service.price / 100).toFixed(2)}`}
      </button>
    </div>
  );
}
