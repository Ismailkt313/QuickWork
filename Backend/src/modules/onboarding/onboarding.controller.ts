import { Request, Response } from "express";
import { getOnboardingStatus,submitbasicProfile } from "./onboarding.service";

export const getStatus = async(req:Request,res:Response) => {
    try {
        const userId = (req as any).user?.id
        if (!userId) {
            throw new Error('user not exists')
        }
        const status = await getOnboardingStatus(userId)
        res.status(200).json({success:true,data:status})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error })
    }
}

export const basicProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id
        if (!userId) {
            throw new Error('user not exists')
        }
        const provider = await submitbasicProfile(userId,req.body)
        res.status(200).json({success:true,message:'basec profile created'})
    } catch (error) {
        
    }
}