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



// Start server regardless of MongoDB connection status
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port: ${PORT}`);
    console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
});

// Connect to MongoDB (non-blocking)
connectDB()
    .then(() => {
        console.log("✅ MongoDB connection successful");
    })
    .catch((err) => {
        console.log("❌ MongoDB connection failed:", err.message);
        console.log("⚠️ Server running without database connection");
    })
