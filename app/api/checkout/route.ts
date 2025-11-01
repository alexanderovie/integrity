import { CLEANING_SERVICES, stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { serviceId, customerEmail, customerName, customPrice, quoteData } = await request.json();

    console.log('Checkout request:', { serviceId, customerEmail, customerName, customPrice, quoteData });

    // Validar que el servicio existe
    const service = CLEANING_SERVICES.find(s => s.id === serviceId);
    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 400 }
      );
    }

    // Usar precio personalizado si está disponible, sino usar precio del servicio
    const finalPrice = customPrice ? Math.round(customPrice * 100) : service.price; // Convertir a centavos
    const serviceName = customPrice ? `Custom Quote - ${service.name}` : service.name;
    const serviceDescription = customPrice
      ? `Personalized cleaning service quote based on your property details`
      : service.description;

    console.log('Using price:', finalPrice, 'cents ($' + (finalPrice / 100).toFixed(2) + ')');

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
              description: serviceDescription,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/quote`,
      customer_email: customerEmail,
      metadata: {
        serviceId,
        customerName,
        customPrice: customPrice?.toString() || '',
        quoteData: JSON.stringify(quoteData || {}),
      },
    });

    console.log('Session created:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: `Error interno del servidor: ${error.message}` },
      { status: 500 }
    );
  }
}
