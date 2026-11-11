import mongoose, { Schema, Document } from 'mongoose'

export interface ICampaign extends Document {
  userId: string
  name: string
  videoUrl: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  urls: string[]
  totalVideos: number
  completedVideos: number
  createdAt: Date
}

const CampaignSchema = new Schema<ICampaign>({
  userId:          { type: String, required: true },
  name:            { type: String, required: true },
  videoUrl:        { type: String, default: '' },
  status:          { type: String, enum: ['queued','processing','completed','failed'], default: 'queued' },
  urls:            { type: [String], default: [] },
  totalVideos:     { type: Number, default: 0 },
  completedVideos: { type: Number, default: 0 },
  createdAt:       { type: Date, default: Date.now },
})

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema)