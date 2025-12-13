import mongoose, { Schema, Document } from 'mongoose';

export interface IAbrechnung extends Document {
	restaurant: mongoose.Types.ObjectId; // Referenz zum Restaurant
	organization: mongoose.Types.ObjectId; // Referenz zur Organisation
	userId: mongoose.Types.ObjectId;             // kellner/Benutzer, der die Abrechnung erstellt hat
	date: Date;                                  // Datum der Abrechnung
	geschaefts_tag: Date;                        // Geschäftstag (berechnet: vor 06:00 = Vortag, ab 06:00 = aktueller Tag)
	totalSales: number;                          // Gesamtumsatz
	salesInCash: number;                         // Umsatz in bar
	salesByCard: number;                         // Umsatz per Karte
	salesVoucher: number;                        // Umsatz per Gutschein
	teamTips: number;                            //  Trinkgeld des Teams
	teamTipsPaid: number;                            //  Trinkgeld des Teams ausgezahlt
	totalDiscounts: number;                      // Gesamtrabatte
	totalStornos: number;                        // Gesamtstornos
	restaurantFloat: number;                     // Wechselgeld vom Restaurant
	privatTips: number;                         // Eigenes Wechselgeld
	finalAmountInCash: number;                   // endbestand der kellnergeldboitel in bar
	station?: string;                            // Station number or name for tracking effectiveness
}

const AbrechnungSchema = new Schema<IAbrechnung>(
	{
		restaurant: {
			type: Schema.Types.ObjectId,
			ref: 'Restaurant',
			required: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		organization: {
			type: Schema.Types.ObjectId,
			ref: 'Organization',
			required: true
		},
		date: {
			type: Date,
			required: false,
			default: Date.now
		},
		geschaefts_tag: {
			type: Date,
			required: false, // Set by pre-save hook, not required to pass validation
			index: true
		},
		totalSales: {
			type: Number,
			required: true,
			min: 0
		},
		salesInCash: {
			type: Number,
			required: true,
			min: -9999.0
		},
		salesByCard: {
			type: Number,
			required: false,
			min: 0
		},
		salesVoucher: {
			type: Number,
			required: false,
			min: 0
		},
		teamTips: {
			type: Number,
			required: true,
			min: 0
		},
		teamTipsPaid: {
			type: Number,
			required: true,
			min: 0
		},
		totalDiscounts: {
			type: Number,
			required: false,
			min: 0
		},
		totalStornos: {
			type: Number,
			required: false,
			min: 0
		},
		restaurantFloat: {
			type: Number,
			required: false,
			min: 0
		},
		privatTips: {
			type: Number,
			required: false,
			min: 0
		},
		finalAmountInCash: {
			type: Number,
			required: false,
			min: -9999.0
		},
		station: {
			type: String,
			required: false,
			trim: true
		}
	},
	{ timestamps: true }
);

// Pre-save hook: Calculate geschaefts_tag based on LOCAL time
// If LOCAL time is between 00:00 and 05:59, set geschaefts_tag to previous day (midnight UTC)
// If LOCAL time is 06:00 or later, set geschaefts_tag to current day (midnight UTC)
AbrechnungSchema.pre('save', function() {
	const now = this.date || new Date();
	
	// Get LOCAL hours (not UTC) for business day logic
	const localHours = now.getHours();
	
	// Get the LOCAL date components
	const localYear = now.getFullYear();
	const localMonth = now.getMonth();
	const localDate = now.getDate();
	
	// Create a date at midnight UTC for the local date
	const businessDay = new Date(Date.UTC(localYear, localMonth, localDate, 0, 0, 0, 0));
	
	// If LOCAL time is before 06:00, subtract one day
	if (localHours < 6) {
		businessDay.setUTCDate(businessDay.getUTCDate() - 1);
	}
	
	this.geschaefts_tag = businessDay;
});

// Clear cached model to ensure schema changes are applied
if (mongoose.models.Abrechnung) {
	delete mongoose.models.Abrechnung;
}

const Abrechnung = mongoose.model<IAbrechnung>('Abrechnung', AbrechnungSchema);
export default Abrechnung;