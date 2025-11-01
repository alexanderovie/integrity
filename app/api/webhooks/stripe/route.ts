import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import Stripe from 'stripe';

const getResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
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
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.warn('💳 Payment successful:', session.id);

      // Enviar email de confirmación de pago
      try {
        const customerEmail = session.customer_email;
        const customerName = session.metadata?.customerName || 'Cliente';
        const customPrice = session.metadata?.customPrice || '0';
        const quoteData = session.metadata?.quoteData ? JSON.parse(session.metadata.quoteData) : {};

        if (customerEmail) {
          console.warn('📧 Enviando email de confirmación de pago a:', customerEmail);
          const resend = getResend();

          const { data: paymentEmail, error: paymentError } = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'Integrity Clean Solutions <info@pay.integritycleansolutions.com>',
            to: [customerEmail],
            subject: 'Pago Confirmado - Integrity Clean Solutions',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #059669;">
                            <h1 style="margin: 0; color: #059669; font-size: 28px; font-weight: 600;">Pago Confirmado</h1>
                          </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                              Estimado/a <strong style="color: #059669;">${customerName}</strong>,
                            </p>

                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                              Gracias por confiar en Integrity Clean Solutions. Hemos recibido su pago y su servicio ha sido confirmado exitosamente.
                            </p>

                            <!-- Payment Details -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #059669;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h3 style="margin: 0 0 15px; color: #059669; font-size: 18px; font-weight: 600;">Detalles del Pago</h3>
                                  <table role="presentation" style="width: 100%;">
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID de Transacción:</td>
                                      <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px; font-family: monospace;">${session.id.substring(0, 20)}...</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Monto Pagado:</td>
                                      <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 16px; font-weight: 600;">$${(parseInt(customPrice) / 100).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Fecha de Pago:</td>
                                      <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px;">${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Estado:</td>
                                      <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 14px; font-weight: 600;">Confirmado</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            ${quoteData.propertySize ? `
                            <!-- Service Details -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #f8f9fa; border-radius: 6px;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h3 style="margin: 0 0 15px; color: #2563eb; font-size: 18px; font-weight: 600;">Detalles del Servicio</h3>
                                  <p style="margin: 0 0 10px; color: #333333; font-size: 14px; line-height: 1.6;">
                                    <strong>Propiedad:</strong> ${quoteData.propertySize} sq ft, ${quoteData.bedrooms} habitaciones, ${quoteData.bathrooms} baños
                                  </p>
                                  ${quoteData.frequency ? `<p style="margin: 0 0 10px; color: #333333; font-size: 14px; line-height: 1.6;"><strong>Frecuencia:</strong> ${quoteData.frequency}</p>` : ''}
                                  ${quoteData.extras && quoteData.extras.length > 0 ? `<p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;"><strong>Servicios Adicionales:</strong> ${quoteData.extras.join(', ')}</p>` : ''}
                                </td>
                              </tr>
                            </table>
                            ` : ''}

                            <!-- Next Steps -->
                            <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                              <tr>
                                <td style="padding: 20px;">
                                  <h3 style="margin: 0 0 15px; color: #f59e0b; font-size: 18px; font-weight: 600;">Próximos Pasos</h3>
                                  <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                                    <li style="margin-bottom: 8px;">Nuestro equipo se pondrá en contacto con usted en las próximas 24 horas para coordinar los detalles</li>
                                    <li style="margin-bottom: 8px;">Confirmaremos la fecha y hora del servicio según su preferencia</li>
                                    <li>Recibirá un recordatorio 24 horas antes de la cita programada</li>
                                  </ul>
                                </td>
                              </tr>
                            </table>

                            <!-- Professional Footer -->
                            <table role="presentation" style="width: 100%; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                              <tr>
                                <td style="text-align: center; padding-bottom: 20px;">
                                  <p style="margin: 0 0 10px; color: #059669; font-size: 20px; font-weight: 600;">Integrity Clean Solutions</p>
                                  <p style="margin: 0 0 5px; color: #666666; font-size: 14px;">Servicios de Limpieza Profesional</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="text-align: center; padding: 20px 0;">
                                  <p style="margin: 0 0 8px; color: #999999; font-size: 12px; line-height: 1.6;">
                                    Si tiene alguna pregunta sobre su servicio, no dude en contactarnos.
                                  </p>
                                  <p style="margin: 0; color: #999999; font-size: 12px;">
                                    <strong style="color: #666666;">Email:</strong> info@integritycleansolutions.com
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Bottom Spacing -->
                      <table role="presentation" style="width: 100%; margin-top: 20px;">
                        <tr>
                          <td style="text-align: center; padding: 20px;">
                            <p style="margin: 0; color: #999999; font-size: 11px;">
                              Este es un correo automático. Por favor, no responda a este mensaje.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });

          if (paymentError) {
            console.error('❌ Error enviando email de confirmación de pago:', paymentError);
          } else {
            console.warn('✅ Email de confirmación de pago enviado:', paymentEmail?.id);
          }
        } else {
          console.warn('⚠️ No se encontró email del cliente en la sesión');
        }
      } catch (emailError) {
        console.error('❌ Error en envío de email de confirmación:', emailError);
      }

      // Enviar notificación al equipo sobre el pago
      try {
        const resend = getResend();
        const { data: teamEmail, error: teamError } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'Integrity Clean Solutions <info@pay.integritycleansolutions.com>',
          to: [process.env.TO_EMAIL || 'info@integritycleansolutions.com'],
          subject: 'Nuevo Pago Recibido - Integrity Clean Solutions',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 3px solid #059669;">
                          <h1 style="margin: 0; color: #059669; font-size: 28px; font-weight: 600;">Nuevo Pago Recibido</h1>
                        </td>
                      </tr>
                      
                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                            Se ha procesado un pago exitoso en el sistema de pagos.
                          </p>

                          <!-- Payment Information -->
                          <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #059669;">
                            <tr>
                              <td style="padding: 20px;">
                                <h3 style="margin: 0 0 15px; color: #059669; font-size: 18px; font-weight: 600;">Información del Pago</h3>
                                <table role="presentation" style="width: 100%;">
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">ID de Transacción:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px; font-family: monospace;">${session.id.substring(0, 25)}...</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Cliente:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px; font-weight: 600;">${session.metadata?.customerName || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email del Cliente:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px;">${session.customer_email || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Monto:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 16px; font-weight: 600;">$${session.metadata?.customPrice ? (parseInt(session.metadata.customPrice) / 100).toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Servicio:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px;">${session.metadata?.serviceId || 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Fecha y Hora:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #333333; font-size: 14px;">${new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Action Items -->
                          <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #f0f9ff; border-radius: 6px; border-left: 4px solid #0369a1;">
                            <tr>
                              <td style="padding: 20px;">
                                <h3 style="margin: 0 0 15px; color: #0369a1; font-size: 18px; font-weight: 600;">Acciones Requeridas</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                                  <li style="margin-bottom: 8px;">Contactar al cliente para coordinar el servicio</li>
                                  <li style="margin-bottom: 8px;">Programar la fecha y hora del servicio</li>
                                  <li style="margin-bottom: 8px;">Preparar equipo y suministros necesarios</li>
                                  <li>Enviar recordatorio 24 horas antes del servicio</li>
                                </ul>
                              </td>
                            </tr>
                          </table>

                          <!-- Professional Footer -->
                          <table role="presentation" style="width: 100%; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                            <tr>
                              <td style="text-align: center; padding-bottom: 20px;">
                                <p style="margin: 0 0 10px; color: #059669; font-size: 20px; font-weight: 600;">Integrity Clean Solutions</p>
                                <p style="margin: 0 0 5px; color: #666666; font-size: 14px;">Sistema de Notificaciones Automáticas</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align: center; padding: 20px 0;">
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                  Este es un correo automático generado por el sistema de pagos.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        if (teamError) {
          console.error('❌ Error enviando notificación de pago al equipo:', teamError);
        } else {
          console.warn('✅ Notificación de pago enviada al equipo:', teamEmail?.id);
        }
      } catch (teamEmailError) {
        console.error('❌ Error en notificación de pago al equipo:', teamEmailError);
      }

      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.warn('💳 Payment Intent succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.warn('❌ Payment failed:', failedPayment.id);
      break;
    }

    case 'checkout.session.expired': {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      console.warn('⏰ Checkout session expired:', expiredSession.id);
      break;
    }

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
