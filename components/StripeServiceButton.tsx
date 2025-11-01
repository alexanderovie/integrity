'use client';

import { useState } from 'react';

interface StripeServiceButtonProps {
  service: {
    id: string;
    slug: string;
    service_title: string;
    price: string;
    description: string;
  };
  className?: string;
}

export default function StripeServiceButton({
  service,
  className = ''
}: StripeServiceButtonProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showForm, setShowForm] = useState(false);
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
          serviceId: service.slug,
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

  if (!showForm) {
    return (
      <div
        onClick={() => setShowForm(true)}
        className={`py-4 px-3 bg-primary rounded-md text-center cursor-pointer ${className}`}
      >
        <span className='font-bold dark:text-secondary'>Book a service</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <h4 className="text-white font-semibold text-lg">Reservar {service.service_title}</h4>
        <p className="text-white/80 text-sm">${service.price}.00 - {service.description.substring(0, 100)}...</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="customerName" className="block text-sm font-medium text-white/80">
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
        <label htmlFor="customerEmail" className="block text-sm font-medium text-white/80">
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

      <div className="flex gap-2">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
        >
          {loading ? 'Procesando...' : `Pagar $${service.price}.00`}
        </button>

        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
