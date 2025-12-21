import mongoose, { Schema, Document } from 'mongoose';
import { IOrganization } from './Organization';

export interface IRestaurant extends Document {
    name: string;
    // Zugehörigkeit zur Kette/Organisation
    organization: mongoose.Types.ObjectId | IOrganization; 
    
    // Konfiguration für die Abrechnung
    teamTipPercentage: number; // Z.B. 2.5 (Prozentsatz, der in die Abrechnung übertragen wird)
    initialFloat: number;      // Standard-Wechselgeld/Startguthaben (z.B. 100.00)
	ecProofEnabled?: boolean; // Ob die EC-Belegpflicht aktiviert ist
	voucherProofEnabled?: boolean; // Ob die Gutschein-Belegpflicht aktiviert ist
	discountProofEnabled?: boolean; // Ob die Rabatt-Belegpflicht aktiviert ist
	stornoProofEnabled?: boolean; // Ob die Storno-Belegpflicht aktiviert ist
	tresorEnabled?: boolean; // Ob Tresorbestand-Eingabe aktiviert ist
	safebagEnabled?: boolean; // Ob Safebag-Nummer-Eingabe aktiviert ist
    tresorBestand?: number; // Standard Tresorbestand-Betrag in Euro
}

const RestaurantSchema: Schema<IRestaurant> = new Schema<IRestaurant>(
    {
        name: { 
            type: String, 
            required: true
        },
        organization: { 
            type: Schema.Types.ObjectId, 
            ref: 'Organization', 
            required: true 
        },
        teamTipPercentage: {
            type: Number,
            required: true,
            default: 2.0, // Standard 2.0%
            min: 0,
            max: 5
        },
        initialFloat: {
            type: Number,
            required: true,
            default: 100.00, // Standard 100€ Wechselgeld
            min: 0,
			max: 999.99
        },
		ecProofEnabled: {
			type: Boolean,
			default: false
		},
		voucherProofEnabled: {
			type: Boolean,
			default: false
		},
		discountProofEnabled: {
			type: Boolean,
			default: false
		},
		stornoProofEnabled: {
			type: Boolean,
			default: false
		},
		tresorEnabled: {
			type: Boolean,
			default: false
		},
		safebagEnabled: {
			type: Boolean,
			default: false
        },
        tresorBestand: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true, strict: true }
);

RestaurantSchema.index({ name: 1, organization: 1 }, { unique: true });

// Delete the model if it exists to force recompilation with new schema
if (mongoose.models.Restaurant) {
    delete mongoose.models.Restaurant;
}

const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export default Restaurant;