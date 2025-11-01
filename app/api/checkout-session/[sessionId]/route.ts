import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Recuperar la sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.url) {
      return NextResponse.json(
        { error: 'URL de checkout no disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
