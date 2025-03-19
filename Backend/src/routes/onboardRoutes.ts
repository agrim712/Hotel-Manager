import express from "express";
import { validateRequest } from "../middlewares/validationMiddleware";
import { onboardSchema } from "../validators/onboardValidator";
import onboardController from "../controllers/onboardController";

const router = express.Router();

// Define the route for onboarding a property
router.post("/", validateRequest(onboardSchema), onboardController);

// Export the router
export default router;