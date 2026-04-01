const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const Place = require("./models/Place");

async function purge() {
  try {
    if (!process.env.MONGO_URI) {
      console.log("No MONGO_URI in .env file");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const result = await Place.deleteMany({ city: "Unknown City" });
    console.log(`Successfully purged ${result.deletedCount} documents where city = "Unknown City".`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error purging:", error);
    process.exit(1);
  }
}

purge();
