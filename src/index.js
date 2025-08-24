import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app, setupAuthentication } from './app.js'

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

app.listen(PORT, async () => {
    console.log(`⚙️ Server is running at port: ${PORT}`);
    console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
    
    // Setup authentication after server starts
    await setupAuthentication(app);
});

// Connect to MongoDB (non-blocking)
connectDB()
    .then(() => {
        console.log("✅ MongoDB connection successful - Enhanced functionality available");
    })
    .catch((err) => {
        console.log("❌ MongoDB connection failed:", err.message);
        console.log("⚠️ Server running with mock responses only");
    });
