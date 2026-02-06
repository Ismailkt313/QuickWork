import { Router } from "express";
import { authRequest,authenticate } from "@shared/middleware/auth.middleware";
import { Register, loginUser, refresh, varifyotp,forgotPassword,varifyPassword,varifyemail } from "./auth.controller";


const router = Router()

router.post('/register', Register)
router.post('/varify-otp',varifyotp)
router.post('/login', loginUser)
router.post('/refresh', refresh)
router.post('/request-rest-password', forgotPassword)
router.post('/varify-reset-otp', varifyemail)
router.post('/reset-password',varifyPassword)

router.get('/abc',authenticate, (req: authRequest, res) => {
    res.json({user:req.user})
})
export default router