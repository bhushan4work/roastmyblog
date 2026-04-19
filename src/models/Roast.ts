import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRoastInput {
  url: string;
  title: string;
  roast: string;
  createdAt: number;
}

const RoastSchema: Schema = new Schema<IRoastInput>({
  url: { type: String, required: true },
  title: { type: String, required: true },
  roast: { type: String, required: true },
  createdAt: { type: Number, default: () => Date.now() },
});

const Roast: Model<IRoastInput> = mongoose.models.Roast || mongoose.model<IRoastInput>('Roast', RoastSchema);
export default Roast;
