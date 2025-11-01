import Stripe from 'stripe';

// Configuración del cliente Stripe para el servidor
// No especificamos apiVersion para usar la versión pinneada del SDK automáticamente
// Esto garantiza compatibilidad con stripe@19.2.0
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// Configuración de Stripe para el cliente
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    const { loadStripe } = require('@stripe/stripe-js');
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return null;
};

// Tipos para los productos/servicios
export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
}

// Configuración de precios para los servicios de limpieza
export const CLEANING_SERVICES: ServiceItem[] = [
  {
    id: 'regular-cleaning',
    name: 'Limpieza Regular',
    description: 'Servicio de limpieza semanal o quincenal para hogares y oficinas',
    price: 15000, // $150.00 en centavos
    currency: 'usd',
  },
  {
    id: 'deep-cleaning',
    name: 'Limpieza Profunda',
    description: 'Limpieza exhaustiva incluyendo áreas que normalmente no se limpian',
    price: 30000, // $300.00 en centavos
    currency: 'usd',
  },
  {
    id: 'move-in-out',
    name: 'Limpieza de Mudanza',
    description: 'Limpieza completa para mudanzas (entrada o salida)',
    price: 25000, // $250.00 en centavos
    currency: 'usd',
  },
  {
    id: 'post-construction',
    name: 'Limpieza Post-Construcción',
    description: 'Limpieza especializada después de trabajos de construcción',
    price: 50000, // $500.00 en centavos
    currency: 'usd',
  },
];
