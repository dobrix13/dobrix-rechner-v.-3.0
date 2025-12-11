import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Organization from '@/lib/models/Organization';
import { Types } from 'mongoose';


// GET: Alle Organisationen auflisten (Gut um IDs für Tests zu finden)
export async function GET() {
  await connect();
  try {
    const orgs = await Organization.find({});
    return NextResponse.json(orgs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Fehler beim Laden: " + error.message }, { status: 500 });
  }
}

// POST: Neue Organisation erstellen
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  await connect();

  try {
    const body = await request.json();
    
    // Wir erwarten zumindest einen Namen. 
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ error: "Nederīgs vai trūkst userId" }),
        { status: 400 }
      );
    }
    // owner ist optional (könnte z.B. die ID oder Name vom Besitzer sein)
    const { name, owner } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 });
    }

    // Prüfen, ob Name schon existiert (Optional, macht Mongoose auch, aber so ist die Fehlermeldung schöner)
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return NextResponse.json({ error: 'Eine Organisation mit diesem Namen existiert bereits' }, { status: 409 });
    }

    // Erstellen
    const newOrg = await Organization.create({
      name,
      owner: owner || null, // Falls keine owner gesendet wurde, ist es null
      user: userId || null, // Falls keine ID gesendet wurde, ist es null
    });

    return NextResponse.json(newOrg, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Erstellen: ' + error.message }, { status: 500 });
  }
}