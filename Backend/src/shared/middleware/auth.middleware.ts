import { Request, Response, NextFunction } from "express";
import { varifytoken } from "@shared/utils/jwt";

export interface authRequest extends Request{
    user?: {
        userId: string
        role:string
    }
}
export const authenticate = (req:authRequest,res:Response,next:NextFunction) => {
    const AuthHeadder = req.headers.authorization
    if (!AuthHeadder || !AuthHeadder.startsWith('Bearer ')) {
        return res.status(401).json({message:'unautherized person'})
    }
    const token = AuthHeadder.split(' ')[1]
    try {
        const decoded = varifytoken(token)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({message:'invalid token'})
    }
} 