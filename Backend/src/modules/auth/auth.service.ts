import { User } from "@modules/users/user.model";
import { hash, compare } from "@shared/utils/hash";
import { Tlogin, Tregister } from "./auth.types";
import { generateRefreshtoken, varifytoken, generateAccesstoken } from "@shared/utils/jwt";
import { signupTemp } from "./auth.signup-temp-modal";
import { otp } from "./auth.otp-temp-modal";
import { generateOtp } from "@shared/utils/otp";
import { sendOTP } from "@shared/utils/mail";


export const registerUser = async(data:Tregister) => {
    const { email, password, varifyPassword } = data

    if (password != varifyPassword) {
        throw new Error('passwords are not match')
    }

    validateSignup(email,password)

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new Error('user already exists')
    }
    const hashed = await hash(password)
    await signupTemp.findOneAndUpdate(
        {
            email
        }, {
            email,
            password: hashed
    }, {
        upsert: true
    })
    const OTP = generateOtp()
    await otp.findOneAndUpdate({
        email
    },{
        email,
        otp: OTP,
        expiresAt:new Date()
    }, {
        upsert:true
    }
    )
    const shareOTP = sendOTP(email, OTP)
    console.log('shared otp',OTP)
    if (!shareOTP) {
        throw Error('Error Occurd while sending otp')
    }
    return shareOTP
}


export const varifyOTP = async (email:string,OTP:string) => {
    const otprecord = await otp.findOne({ email })
    if (!otprecord) {
        throw Error('otp expired or not found')
    }
    if (otprecord.otp != OTP) {
        throw Error('Invalid otp please try again')
    }
    const temp = await signupTemp.findOne({ email })
    if (!temp) {
        throw new Error('signup session expired')
    }
    const user = await User.create({
        email: temp.email,
        hashedPassword: temp.password,
    })
    await otp.deleteOne({ email })
    await signupTemp.deleteOne({ email })
    return user
}

export const validateSignup = (email: string, password: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid Gmail address");
  }

  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be ≥6 chars and include letter, number & special char"
    );
  }
};


export const requestResetOtp = async(email: string) => {
    try {
            const user = await User.findOne({ email })
    if (!user) {
        throw new Error('email does not exist')
    }
    const OTP = generateOtp()
    await otp.findOneAndUpdate({
        email
    }, {
        email,
        otp: OTP,
        expiresAt:new Date()
    })
    await sendOTP(email, OTP)
    console.log('reset password otp', OTP)
    return true
    } catch (error) {
        console.error('reset otp error',error)
    }
}


export const varifyResetOTP = async (email: string, OTP: string)=>{
    try {
        const record = await otp.findOne({ email })
        if (!record) {
            throw new Error('otp session expired please try again')
        }
        if (OTP != record.otp) {
            throw new Error('invalid otp')
        }
        return true
    } catch (error) {
        console.log('varify reset otp error',Error)
    }
}

export const resetPassword = async (email:string,password: string, confirmPassword: string) => {
    try {
        if (password != confirmPassword) {
            throw new Error('Passwords do not match')
        }
        validateSignup(email, password)
        const hashed = await hash(password)
        await User.findOneAndUpdate({ email }, { hashedPassword: hashed })
        await otp.deleteOne({email})
    } catch (error) {
        console.error('reset password error',error)
    }
}

export const login = async (data: Tlogin) => {
    const { email, password } = data
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('user not found')
    }
     const passwordCompare = await compare(password, user.hashedPassword)
    if (!passwordCompare) {
        throw new Error('password not match')
    }

    let userId: string = user.id.toString()
    let role: string = user.role

    const accesstoken = generateAccesstoken({userId,role})
    const refreshtoken = generateRefreshtoken({ userId, role })
    user.refreshToken = refreshtoken
    await user.save()
    return {accesstoken,refreshtoken}
}

export const refreshAccesstoken = async (token:string) => {
    const decoded = varifytoken(token)
    const user = await User.findById(decoded.userId)
    if (!user) {
        throw Error('user not found')
    }
    let userId: string = user.id.toString()
    let role: string = user.role
    return generateAccesstoken({userId,role})
}