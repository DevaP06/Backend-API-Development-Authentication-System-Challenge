import dotenv from "dotenv"
import { app } from './app-minimal.js'

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

// MongoDB connection temporarily disabled to isolate route issues
console.log("⚠️ Running in minimal mode - MongoDB connection disabled");
console.log("🔧 Working to resolve path-to-regexp error in routes");
