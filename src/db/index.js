import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Debug environment variables
    console.log("🔍 Environment Debug:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("URI_KEY exists:", Boolean(process.env.URI_KEY));
    console.log("URI_KEY length:", (process.env.URI_KEY || '').length);
    console.log("All env keys:", Object.keys(process.env).filter(key => key.includes('URI') || key.includes('MONGO')));
    
    if (!process.env.URI_KEY) {
      throw new Error("URI_KEY environment variable is not defined. Check your environment configuration.");
    }
    
    const conn = await mongoose.connect(process.env.URI_KEY);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) { 
    console.log("❌ MONGODB connection error", error);
    process.exit(1);
    }
}


export default connectDB

// .then(()=> {
//     application.listen(process.env.PORT||8000, () => {
//         console.log(`Server is running on port ${process.env.PORT || 8000}`);
//         })
// })
// .catch((error) => {
//   console.error("Error connecting to MongoDB:", error);
//   process.exit(1);
    
// })
