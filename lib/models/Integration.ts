import mongoose from 'mongoose'

const IntegrationSchema = new mongoose.Schema({
  userId:       { type: String, required: true },
  provider:     { type: String, enum: ['hubspot', 'salesforce',  'saleshandy'], required: true },
  accessToken:  { type: String, default: '' },
  refreshToken: { type: String, default: '' },
  expiresAt:    { type: Date, default: null },
  portalId:     { type: String, default: '' },
  connected:    { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
})

export default mongoose.models.Integration ||
  mongoose.model('Integration', IntegrationSchema)