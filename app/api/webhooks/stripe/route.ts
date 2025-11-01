import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💳 Payment successful:', session.id);

      // Enviar email de confirmación de pago
      try {
        const customerEmail = session.customer_email;
        const customerName = session.metadata?.customerName || 'Cliente';
        const serviceId = session.metadata?.serviceId || 'servicio';
        const customPrice = session.metadata?.customPrice || '0';
        const quoteData = session.metadata?.quoteData ? JSON.parse(session.metadata.quoteData) : {};

        if (customerEmail) {
          console.log('📧 Enviando email de confirmación de pago a:', customerEmail);

          const { data: paymentEmail, error: paymentError } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'Fascinante Digital <info@fascinantedigital.com>',
            to: [customerEmail],
            subject: '✅ Pago Confirmado - Fascinante Digital',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #059669;">✅ ¡Pago Confirmado!</h2>
                <p>Hola <strong>${customerName}</strong>,</p>
                <p>¡Excelente! Hemos recibido tu pago y tu servicio ha sido confirmado.</p>

                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                  <h3 style="color: #059669; margin-top: 0;">💳 Detalles del Pago:</h3>
                  <p><strong>ID de Transacción:</strong> ${session.id}</p>
                  <p><strong>Monto Pagado:</strong> $${(parseInt(customPrice) / 100).toFixed(2)}</p>
                  <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
                  <p><strong>Estado:</strong> ✅ Confirmado</p>
                </div>

                ${quoteData.propertySize ? `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2563eb; margin-top: 0;">🏠 Detalles del Servicio:</h3>
                  <p><strong>Propiedad:</strong> ${quoteData.propertySize} sq ft, ${quoteData.bedrooms} habitaciones, ${quoteData.bathrooms} baños</p>
                  ${quoteData.frequency ? `<p><strong>Frecuencia:</strong> ${quoteData.frequency}</p>` : ''}
                  ${quoteData.extras && quoteData.extras.length > 0 ? `<p><strong>Servicios Adicionales:</strong> ${quoteData.extras.join(', ')}</p>` : ''}
                </div>
                ` : ''}

                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #f59e0b; margin-top: 0;">📞 Próximos Pasos:</h3>
                  <ul style="color: #f59e0b;">
                    <li>Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas</li>
                    <li>Coordinaremos la fecha y hora de tu servicio</li>
                    <li>Te enviaremos recordatorios antes del servicio</li>
                  </ul>
                </div>
              </div>
            `,
          });

          if (paymentError) {
            console.error('❌ Error enviando email de confirmación de pago:', paymentError);
          } else {
            console.log('✅ Email de confirmación de pago enviado:', paymentEmail?.id);
          }
        } else {
          console.log('⚠️ No se encontró email del cliente en la sesión');
        }
      } catch (emailError) {
        console.error('❌ Error en envío de email de confirmación:', emailError);
      }

      // Enviar notificación al equipo sobre el pago
      try {
        const { data: teamEmail, error: teamError } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Fascinante Digital <info@fascinantedigital.com>',
          to: [process.env.TO_EMAIL || 'info@fascinantedigital.com'],
          subject: '💰 Pago Recibido - Fascinante Digital',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #059669;">💰 ¡Nuevo Pago Recibido!</h2>
              <p>Se ha procesado un pago exitoso en el sitio web.</p>

              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="color: #059669; margin-top: 0;">💳 Información del Pago:</h3>
                <p><strong>ID de Transacción:</strong> ${session.id}</p>
                <p><strong>Cliente:</strong> ${session.metadata?.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${session.customer_email || 'N/A'}</p>
                <p><strong>Monto:</strong> $${session.metadata?.customPrice ? (parseInt(session.metadata.customPrice) / 100).toFixed(2) : 'N/A'}</p>
                <p><strong>Servicio:</strong> ${session.metadata?.serviceId || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              </div>
            </div>
          `,
        });

        if (teamError) {
          console.error('❌ Error enviando notificación de pago al equipo:', teamError);
        } else {
          console.log('✅ Notificación de pago enviada al equipo:', teamEmail?.id);
        }
      } catch (teamEmailError) {
        console.error('❌ Error en notificación de pago al equipo:', teamEmailError);
      }

      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('💳 Payment Intent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', failedPayment.id);
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      console.log('⏰ Checkout session expired:', expiredSession.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
