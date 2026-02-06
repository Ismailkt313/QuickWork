import { Router } from "express";
import authRoutes from './modules/auth/auth.routes'
import providerRoutes from './modules/onboarding/onboarding.routes'

const router = Router()
router.use('/auth', authRoutes)
router.use('/provider',providerRoutes)
export default router