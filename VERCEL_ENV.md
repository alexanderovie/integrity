# Variables de Entorno para Vercel

## 🔴 OBLIGATORIAS (sin estas falla el build)

Configura estas en **Settings > Environment Variables** de tu proyecto en Vercel:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## ⚠️ OPCIONALES (solo necesarias para funcionalidad específica)

```
RESEND_API_KEY=re_...  # Para enviar emails de confirmación
FROM_EMAIL=Integrity Clean Solutions <info@pay.integritycleansolutions.com>  # Email remitente (usar subdominio verificado)
TO_EMAIL=info@integritycleansolutions.com  # Email para notificaciones al equipo
STRIPE_WEBHOOK_SECRET=whsec_...          # Solo para procesar webhooks de Stripe
```

## 📝 Notas

- Las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente
- Las demás son solo para el servidor
- El build funcionará solo con las **OBLIGATORIAS**
- Las opcionales se necesitan cuando uses emails o webhooks
