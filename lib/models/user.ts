import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
	ADMIN = 'admin',
	ORG_ADMIN = 'org_admin',
	MANAGER = 'manager',
	KELLNER = 'kellner',
}

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	role: UserRole;
	organizationId?: mongoose.Types.ObjectId;
	restaurantId?: mongoose.Types.ObjectId;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false },
		role: { type: String, enum: Object.values(UserRole), required: true },
		organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
		restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
	},
	{ timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);