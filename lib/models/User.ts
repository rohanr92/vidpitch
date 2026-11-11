import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  firebaseUid: string
  name: string
  email: string
  plan: 'free' | 'pro' | 'agency'
  videosUsed: number
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  plan:        { type: String, enum: ['free','pro','agency'], default: 'free' },
  videosUsed:  { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)