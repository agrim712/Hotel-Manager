import express from "express";
import cors from "cors";
import onboardRoutes from "./routes/onboardRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/onboard", onboardRoutes);

export default app;
