import { CLEANING_SERVICES, stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { serviceId, customerEmail, customerName, customPrice, quoteData } = await request.json();

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

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: `Error interno del servidor: ${errorMessage}` },
      { status: 500 }
    );
  }
}
