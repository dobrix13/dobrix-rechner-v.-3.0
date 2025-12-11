import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Abrechnung from '@/lib/models/abrechnung';
import { Types } from 'mongoose';



// PATCH: Update a single abrechnung by ID
export async function PATCH(request: Request, context: { params: Promise<{ abrechnungId: string;}> }) {
  const params = await context.params;
  await connect();
  const { abrechnung } = params;
  if (!Types.ObjectId.isValid(abrechnung)) {
    return NextResponse.json({ error: 'Ungültige Abrechnungs-ID' }, { status: 400 });
  }
  // Get userId and restaurantId from query param
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const restaurantId = url.searchParams.get('restaurantId');
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Ungültige oder fehlende User-ID', received: userId }, { status: 400 });
  }
  if (!restaurantId || !Types.ObjectId.isValid(restaurantId)) {
    return NextResponse.json({ error: 'Ungültige oder fehlende Restaurant-ID', received: restaurantId }, { status: 400 });
  }
  // Fetch user and check role
  const User = (await import('@/lib/models/user')).default;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden', received: userId }, { status: 404 });
  }
  const body = await request.json();
  try {
    // Fetch the abrechnung to get owner
    const existing = await Abrechnung.findById(abrechnung);
    if (!existing) {
      return NextResponse.json({ error: 'Abrechnung nicht gefunden' }, { status: 404 });
    }
    // Role logic: waiter can only edit their own abrechnung
    if (user.role === 'kellner' && String(existing.userId) !== String(user._id)) {
      return NextResponse.json({ error: 'Kellner darf nur eigene Abrechnung bearbeiten.' }, { status: 403 });
    }
    // Fetch restaurant settings for team tip using restaurantId from params
    const Restaurant = (await import('@/lib/models/restaurant')).default;
    const restaurantSettings = await Restaurant.findById(restaurantId);
    if (!restaurantSettings) {
      return NextResponse.json({ error: 'Restaurant nicht gefunden', restaurantId }, { status: 404 });
    }
    // Calculate team tip amount
    const teamTipPercentage = restaurantSettings.teamTipPercentage || 0;
    const totalSales = body.totalSales || existing.totalSales || 0;
    const teamTips = Number(((totalSales * teamTipPercentage) / 100).toFixed(2));
    const updateData = {
      ...body,
      teamTips,
    };
    const updated = await Abrechnung.findByIdAndUpdate(abrechnung, updateData, { new: true, runValidators: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren', details: error }, { status: 500 });
  }
}




// DELETE: Remove a single abrechnung by ID
export async function DELETE(request: Request, context: { params: Promise<{ abrechnungId: string;}> }) {
  const params = await context.params;
  await connect();
  const { abrechnung } = params;

  // Get userId from query param
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Ungültige oder fehlende User-ID', received: userId }, { status: 400 });
  }

  // Fetch user and check role
  const User = (await import('@/lib/models/user')).default;
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User nicht gefunden', received: userId }, { status: 404 });
  }
  if (user.role !== 'manager' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Keine Rechte zum Löschen der Abrechnung. Nur Manager oder Admin dürfen löschen.', userRole: user.role }, { status: 403 });
  }

  if (!Types.ObjectId.isValid(abrechnung)) {
    return NextResponse.json({ error: 'Ungültige Abrechnungs-ID', received: abrechnung }, { status: 400 });
  }
  try {
    const deleted = await Abrechnung.findByIdAndDelete(abrechnung);
    if (!deleted) {
      return NextResponse.json({ error: 'Abrechnung nicht gefunden', received: abrechnung }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedId: abrechnung });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen', details: error, received: abrechnung }, { status: 500 });
  }
}
