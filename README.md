# Sistema de Pagos - Pay Integrity Cleaning

Sistema de pagos completo integrado con Stripe, incluyendo diseño y UI.

## Características

- ✅ Integración completa con Stripe
- ✅ Formulario de cotización dinámico con cálculo de precios
- ✅ Checkout seguro con Stripe Checkout
- ✅ Webhooks para procesamiento de pagos
- ✅ Emails de confirmación automáticos (Resend)
- ✅ UI moderna y responsive con Tailwind CSS
- ✅ Soporte para dark mode

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── checkout/              # API para crear sesiones de checkout
│   │   ├── checkout-session/       # API para obtener URLs de checkout
│   │   └── webhooks/stripe/        # Webhooks de Stripe
│   ├── quote/                      # Página de cotización y checkout
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Página de inicio
├── components/
│   ├── StripeServiceButton.tsx     # Botón de servicio con checkout
│   └── StripeCheckoutButton.tsx    # Botón de checkout simple
├── lib/
│   └── stripe.ts                   # Configuración de Stripe y servicios
└── ...
```

## Instalación

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales de Stripe y Resend.

3. Ejecutar en desarrollo:
```bash
pnpm dev
```

## Variables de Entorno Requeridas

- `STRIPE_SECRET_KEY`: Clave secreta de Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe
- `STRIPE_WEBHOOK_SECRET`: Secreto del webhook de Stripe
- `RESEND_API_KEY`: API key de Resend para emails
- `FROM_EMAIL`: Email remitente
- `TO_EMAIL`: Email de notificaciones

## Componentes Principales

### StripeServiceButton
Botón que muestra un formulario para capturar datos del cliente y procesar el pago.

### StripeCheckoutButton
Botón simple de checkout que redirige a Stripe Checkout.

### Página Quote (/quote)
Formulario completo de cotización con:
- Selección de tipo de servicio
- Frecuencia del servicio
- Detalles de propiedad
- Servicios adicionales (extras)
- Fecha y hora del servicio
- Propinas opcionales
- Información de contacto
- Cálculo dinámico de precios

## APIs

### POST /api/checkout
Crea una sesión de checkout de Stripe.

### GET /api/checkout-session/[sessionId]
Obtiene la URL de checkout de una sesión.

### POST /api/webhooks/stripe
Maneja eventos de webhook de Stripe (pagos exitosos, fallidos, etc.).

## Tecnologías

- Next.js 15.3.1
- React 19.2.0
- TypeScript
- Tailwind CSS
- Stripe
- Resend (para emails)
