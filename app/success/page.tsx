'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

function SuccessPageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      // Opcional: verificar el pago con Stripe
      // Por ahora solo mostramos la página de éxito
      setLoading(false);
    } else {
      setError('No se encontró información de la sesión de pago');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando su pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <Link
            href="/quote"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md transition-colors"
          >
            Volver a Intentar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-secondary shadow-xl rounded-lg p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Pago Confirmado!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Gracias por confiar en Integrity Clean Solutions
          </p>

          {/* Payment Confirmation */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">ID de Transacción</p>
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {sessionId || 'N/A'}
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              ¿Qué sigue?
            </h2>
            <ul className="text-left text-gray-700 dark:text-gray-300 space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Hemos recibido su pago exitosamente</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Nuestro equipo se pondrá en contacto con usted en las próximas 24 horas</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Recibirá un email de confirmación con todos los detalles de su servicio</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Volver al Inicio
            </Link>
            <Link
              href="/quote"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-md transition-colors"
            >
              Solicitar Otro Servicio
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              ¿Tiene alguna pregunta?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Contáctenos en{' '}
              <a href="mailto:info@integritycleansolutions.com" className="text-primary hover:underline">
                info@integritycleansolutions.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

