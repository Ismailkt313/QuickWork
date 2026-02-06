import { Router } from "express";
import { getStatus,basicProfile } from "./onboarding.controller";
import { authenticate } from "@shared/middleware/auth.middleware";

const router = Router()

router.get('/onboarding-status', authenticate, getStatus)
router.post('/onboarding-basic',authenticate,basicProfile)

export default router