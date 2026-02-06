import { Request, Response } from 'express'
import { authRequest } from '@shared/middleware/auth.middleware'
import { registerUser,login,refreshAccesstoken, varifyOTP,requestResetOtp,resetPassword,varifyResetOTP } from './auth.service'
import { User } from '@modules/users/user.model'

export const Register = async(req: Request, res: Response) => {
    const user = await registerUser(req.body)
    res.status(201).json({message:'otp sended successfully'})
}

export const varifyotp = async (req: Request, res: Response) => {
    const { email, otp } = req.body
    const user = await varifyOTP(email, otp)
    res.status(201).json({message:'signup completed', })
}

export const loginUser = async (req: Request, res: Response) => {
    const { refreshtoken, accesstoken } = await login(req.body)
    res.cookie('refreshtoken', refreshtoken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(200).json({message:'succesfully login',accesstoken})
}

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshtoken
    if (!token) {
        return res.status(401).json({message:'no refresh token found'})
    }
    const accesstoken = await refreshAccesstoken(token)
    res.json({accesstoken})
}

export const logout = async (req: authRequest, res: Response) => {
    if (!req.user) {
        throw Error('UnAutherized')
    }
    await User.findByIdAndUpdate(req.user.userId, {
        refreshToken:null
    })
    res.clearCookie('refreshtoken')
    res.json({message:'logged out successfully'})
}

export const forgotPassword = async(req: Request, res: Response) => {
    try {
        const { email } = req.body
        await requestResetOtp(email)
        res.status(201).json({success:true,message:'otp sented success fully'})
    } catch (error) {
      res.status(400).json({
      success: false,
      message: error,
      })
          console.error('forgotPassword error',error);
    }
}

export const varifyemail = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body
        await varifyResetOTP(email, otp)
        res.status(200).json({success:true,message:'otp verified'})
    } catch (error:any) {
        res.status(400).json({ success: false, message: error })
        console.error(error)
    }
}

export const varifyPassword = async (req: Request, res: Response) => {
    try {
        const {email,password,confirmPassword} = req.body
        await resetPassword(email, password, confirmPassword)
        res.status(200).json({success:true,message:'passowrd rest successful'})
    } catch (error) {
        res.status(400).json({ success: false, message: error })
        console.error(error)
    }
} 