import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user'; // Importiere IUser für Typisierung

export interface IOrganization extends Document {
    name: string;
    // Wer ist Hauptansprechpartner/Besitzer dieser Organisation?
    owner?: mongoose.Types.ObjectId | IUser; 
    // Welcher User hat diese Organisation erstellt/verwaltet
    user?: mongoose.Types.ObjectId | IUser;
}

const OrganizationSchema: Schema<IOrganization> = new Schema<IOrganization>(
    {
        name: { 
            type: String, 
            required: true, 
            unique: true 
        },
        owner: { 
            type: String, // owner is now a string
            required: false // Optional
        },
        user: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: false
        }
    },
    { timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
export default Organization;