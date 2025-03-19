import dotenv from "dotenv";
import app from "./app"; // Import the Express app

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
