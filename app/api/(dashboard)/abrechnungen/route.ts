import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Abrechnung from '@/lib/models/abrechnung';
import Restaurant from '@/lib/models/restaurant';
import { Types } from 'mongoose';


// GET: fetch all abrechnungen with optional filtering by restaurantId and geschaefts_tag
export async function GET(request: Request) {
	await connect();
	try {
		const { searchParams } = new URL(request.url);
		const restaurantId = searchParams.get('restaurantId');
		const geschaefts_tag = searchParams.get('geschaefts_tag');
		
		// Build filter object
		const filter: any = {};
		if (restaurantId) {
			filter.restaurant = restaurantId;
		}
		if (geschaefts_tag) {
			// Parse the date - it's already at midnight UTC from the client
			const businessDay = new Date(geschaefts_tag);
			filter.geschaefts_tag = businessDay;
		}
		
		const abrechnungen = await Abrechnung.find(filter);
		return NextResponse.json(abrechnungen);
	} catch (error) {
		return NextResponse.json({ error: 'kluda iegūstot norēķinus', details: error }, { status: 500 });
	}
}

// POST: create new abrechnung
/* export async function POST(request: Request) {
	await connect();
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');
		const restaurantId = searchParams.get('restaurantId');
		const organizationId = searchParams.get('organizationId');
		if (!userId) {
			return NextResponse.json({ error: 'userId, netika atrasts' }, { status: 400 });
		}
		if ( !restaurant){
			return NextResponse.json({ error: 'restaurantId, netika atrasts' }, { status: 400 });
		}
		if (!organizationId) {
			return NextResponse.json({ error: 'organizationId, netika atrasts' }, { status: 400 });
		}
		const body = await request.json();
		const abrechnung = new Abrechnung({
			...body,
			userId,
			restaurant: restaurantId,
			organization: organizationIdj,
		});
		await abrechnung.save();
		return NextResponse.json(abrechnung, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: 'Fehler beim Erstellen der Abrechnung', details: error }, { status: 500 });
	}
} */

  export async function POST(request: Request) {
    await connect();
    try {
      // Get IDs from query params
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      const restaurantId = searchParams.get('restaurantId');
      const organizationId = searchParams.get('organizationId');

      // Get body fields
      const body = await request.json();
      const {
        totalSales,
        salesInCash,
        salesByCard,
        salesVoucher,
        teamTips,
        totalDiscounts,
        totalStornos,
        restaurantFloat,
        privatTips,
        finalAmountInCash,
        date
      } = body;

      // Debug: Log all received data
      console.log("Empfangener Abrechnungs-Body:", body);
      console.log("Empfangene Query-IDs:", { userId, restaurantId, organizationId });

      // Validate required IDs
      if (!userId || !restaurantId || !organizationId) {
        console.error("Fehlende IDs:", { userId, restaurantId, organizationId });
        return NextResponse.json({ error: 'userId, restaurantId oder organizationId fehlt', received: { userId, restaurantId, organizationId } }, { status: 400 });
      }
      if (!Types.ObjectId.isValid(restaurantId) || !Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(organizationId)) {
        console.error("Ungültige ObjectId:", { userId, restaurantId, organizationId });
        return NextResponse.json({ error: 'Ungültige ObjectId', received: { userId, restaurantId, organizationId } }, { status: 400 });
      }
      
      // Validate required body fields
      if (totalSales === undefined || totalSales === null || totalSales === "") {
        return NextResponse.json({ error: 'totalSales ist erforderlich' }, { status: 400 });
      }
      if (salesInCash === undefined || salesInCash === null || salesInCash === "") {
        return NextResponse.json({ error: 'salesInCash ist erforderlich' }, { status: 400 });
      }

      // Prepare Abrechnung data matching schema
      const newAbrechnungData = {
        userId,
        restaurant: restaurantId,
        organization: organizationId,
        totalSales,
        salesInCash,
        salesByCard: salesByCard || 0,
        salesVoucher: salesVoucher || 0,
        teamTips: teamTips || 0,
        teamTipsPaid: body.teamTipsPaid || 0,
        totalDiscounts: totalDiscounts || 0,
        totalStornos: totalStornos || 0,
        restaurantFloat: restaurantFloat || 0,
        privatTips: privatTips || 0,
        finalAmountInCash: finalAmountInCash || 0,
        date: date ? new Date(date) : new Date(),
      };

      // Save Abrechnung
      console.log("Attempting to save Abrechnung with data:", JSON.stringify(newAbrechnungData, null, 2));
      try {
        const newAbrechnung = await Abrechnung.create(newAbrechnungData);
        console.log("Abrechnung saved successfully:", newAbrechnung._id);
        return NextResponse.json(newAbrechnung, { status: 201 });
      } catch (validationError: any) {
        console.error("Validierungsfehler beim Speichern der Abrechnung:", validationError);
        console.error("Validation error details:", validationError.message);
        console.error("Validation errors:", validationError.errors);
        return NextResponse.json({ 
          error: 'Validierungsfehler', 
          message: validationError.message,
          details: validationError.errors || validationError 
        }, { status: 400 });
      }
    } catch (error: any) {
      console.error("Fehler beim Speichern der Abrechnung:", error);
      return NextResponse.json({ error: 'Fehler beim Speichern: ' + error.message, details: error }, { status: 500 });
    }
  }