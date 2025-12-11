import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Restaurant from '@/lib/models/restaurant';
import User from '@/lib/models/user';

export async function GET(request: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  await connect();
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: 'organizationId fehlt' }, { status: 400 });
  }

  const restaurants = await Restaurant.find({ organization: organizationId });
  return NextResponse.json(restaurants, { status: 200 });
}

export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  await connect();
  const { organizationId } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const restaurantData = await request.json();

  if (!organizationId || !userId) {
    return NextResponse.json({ error: 'organizationId oder userId fehlt' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user || !['admin', 'owner'].includes(user.role)) {
    return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
  }

  const newRestaurant = await Restaurant.create({
    ...restaurantData,
    organization: organizationId,
  });

  return NextResponse.json(newRestaurant, { status: 201 });
}