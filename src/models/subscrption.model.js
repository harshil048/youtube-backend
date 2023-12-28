import mongoose, { Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

// for finding the number of subscriber we find it using channel
