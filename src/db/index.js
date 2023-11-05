import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connetionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\n MongoDB connected !! DB HOST: ${connetionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection error ", error);
    process.exit(1);
  }
}

export default connectDB;