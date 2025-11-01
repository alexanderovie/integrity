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
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  const handleCheckout = async () => {
    if (!customerEmail || !customerName) {
      alert('Por favor completa todos los campos');
      return;
    }

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
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
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
