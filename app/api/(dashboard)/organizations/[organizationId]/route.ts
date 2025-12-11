import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Organization from '@/lib/models/Organization';
import { Types } from 'mongoose';
import User from '@/lib/models/user';

// Get single organization by ID
interface RouteParams {
  params: Promise<{ organizationId: string }>;
} 
export async function GET(request: Request, { params }: RouteParams) {
  const { organizationId } = await params;
  await connect();
  if (!Types.ObjectId.isValid(organizationId)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
  }
  try {
    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ error: 'Organisation nicht gefunden' }, { status: 404 });
    } 
    return NextResponse.json(org, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden: ' + error.message }, { status: 500 });
  }
};

//  PATCH: Eine Organisation ändern (z.B. Name korrigieren)
export async function PATCH(request: Request, { params }: RouteParams) {
  const { organizationId } = await params;

  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ error: "Nederīgs vai trūkst userId" }),
        { status: 400 }
      );
    }
    if (!organizationId || !Types.ObjectId.isValid(organizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Nederīgs vai trūkst organizationId" }),
        { status: 400 }
      );
    }
    await connect();
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Lietotājs netika atrasts" }),
        { status: 401 }
      );
    }
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return new NextResponse(
        JSON.stringify({ message: "Organizācija netika atrasta" }),
        { status: 404 }
      );
    }

    // Merge all fields from body and always set user to userId
    const updateData = { ...body, user: userId };

    const updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      updateData,
      { new: true, runValidators: true }
    );

    return new NextResponse(
      JSON.stringify({ message: "Organizācija atjaunināta veiksmīgi", organization: updatedOrganization }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Kļūda atjauninot organizāciju: " + error.message,
      { status: 500 });
  }
};

// delete organization
export async function DELETE(request: Request, { params }: RouteParams) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ error: "Nederīgs vai trūkst userId" }),
        { status: 400 }
      );
    }
  const { organizationId } = await params;
  await connect();

  if (!Types.ObjectId.isValid(organizationId)) {
    return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
  }
  try {
    const deletedOrg = await Organization.findByIdAndDelete(organizationId);
    if (!deletedOrg) {
      return NextResponse.json({ error: 'Organisation nicht gefunden' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Organisation gelöscht', organization: deletedOrg }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Löschen: ' + error.message }, { status: 500 });
  }
};

