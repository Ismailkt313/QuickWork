import jwt from 'jsonwebtoken'
import { env } from '@config/env'
export interface jwtPayload{
    userId: string
    role: string
}

export const generateAccesstoken = (payload: jwtPayload) => {
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn:"30m"
    })
}

export const varifytoken = (token: string,): jwtPayload => {
    return jwt.verify(token,env.jwtSecret) as jwtPayload
}

export const generateRefreshtoken = (payload: jwtPayload) => {
    return jwt.sign(payload, env.jwtrefreshscret, {
        expiresIn:'14d'
    })
}