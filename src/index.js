import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

// Load environment variables
const result = dotenv.config({
    path: './.env'
})

// Debug dotenv loading
console.log("🔧 Dotenv Debug:");
console.log("Dotenv result:", result.error ? `Error: ${result.error}` : "Success");
console.log("Environment loaded:", Object.keys(process.env).length, "variables");
console.log("URI_KEY loaded:", Boolean(process.env.URI_KEY));



connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
