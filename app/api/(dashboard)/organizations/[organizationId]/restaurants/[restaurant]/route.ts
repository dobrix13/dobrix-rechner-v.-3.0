//  GET: Restaurant details by id from organization's restaurants list
export async function GET(request: Request, context: { params: Promise<{ organizationId: string; restaurant: string }> }) {
  const params = await context.params;
  const { organizationId, restaurant } = params;
  try {
    await connect();
    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return NextResponse.json({ error: 'Invalid restaurant ID' }, { status: 400 });
    }
    const rest = await Restaurant.findOne({ _id: restaurant, organization: organizationId });
    if (!rest) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    return NextResponse.json({
      teamTipPercentage: rest.teamTipPercentage ?? 2,
      floatAmount: rest.initialFloat ?? 0,
      name: rest.name,
      _id: rest._id,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Organization from '@/lib/models/Organization';
import Restaurant from '@/lib/models/restaurant';
import { Types } from 'mongoose';
import User from '@/lib/models/user';
import mongoose from 'mongoose';


//  PATCH: Eine restaurant ändern (z.B. Name korrigieren)
export async function PATCH(request: Request, context: { params: Promise<{ organizationId: string; restaurant: string }> }) {
  const params = await context.params;
  const { organizationId, restaurant } = params;
  const body = await request.json();
 
  try {
    await connect();
    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ message: 'Organisation not found' }, { status: 404 });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return NextResponse.json({ error: 'Invalid restaurant ID' }, { status: 400 });
    }
    const rest = await Restaurant.findOne({ _id: restaurant, organization: org._id });
    if (!rest) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    // Update all editable fields
    rest.name = body.name ?? rest.name;
    rest.teamTipPercentage = body.teamTipPercentage ?? rest.teamTipPercentage;
    rest.initialFloat = body.initialFloat ?? rest.initialFloat;
    rest.ecProofEnabled = body.ecProofEnabled ?? rest.ecProofEnabled;
    rest.voucherProofEnabled = body.voucherProofEnabled ?? rest.voucherProofEnabled;
    rest.discountProofEnabled = body.discountProofEnabled ?? rest.discountProofEnabled;
    rest.stornoProofEnabled = body.stornoProofEnabled ?? rest.stornoProofEnabled;
    await rest.save();
    return NextResponse.json({ message: 'Restaurant updated successfully', restaurant: rest }, { status: 200 });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

//  DELETE: Ein Restaurant löschen
export async function DELETE(request: Request, context: { params: Promise<{ organizationId: string; restaurant: string }> }) {
  const params = await context.params;
  const { organizationId, restaurant } = params;
  try {
    await connect();
    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ message: 'Organisation not found' }, { status: 404 });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return NextResponse.json({ error: 'Invalid restaurant ID' }, { status: 400 });
    }
    const rest = await Restaurant.findOneAndDelete({ _id: restaurant, organization: org._id });
    if (!rest) {
      return NextResponse.json({ message: 'Restaurant not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Restaurant deleted successfully', restaurant: rest }, { status: 200 });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
