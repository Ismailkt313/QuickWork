import { IOtpRepository, IOtpEntry, ICreateUserData } from "../interfaces/auth.interface";
import { OTP_TYPE } from "../../../constants/otp";
import { OtpEntryModel } from "../models/otp.model";

export class OtpRepository implements IOtpRepository {

    public async upsert(
        email: string,
        hashedOtp: string,
        type: OTP_TYPE,
        otpExpiresAt: Date,
        expiresAt: Date,
        userData?: ICreateUserData
    ): Promise<void> {
        await OtpEntryModel.findOneAndUpdate(
            { email, type },
            { hashedOtp, userData, otpExpiresAt, expiresAt },
            { upsert: true, new: true }
        );
    }

    public async findByEmailAndType(email: string, type: OTP_TYPE): Promise<IOtpEntry | null> {
        return OtpEntryModel.findOne({ email, type });
    }

    public async deleteByEmailAndType(email: string, type: OTP_TYPE): Promise<void> {
        await OtpEntryModel.deleteOne({ email, type });
    }

    public async updateOtp(
        email: string,
        hashedOtp: string,
        type: OTP_TYPE,
        otpExpiresAt: Date
    ): Promise<void> {
        await OtpEntryModel.findOneAndUpdate(
            { email, type },
            { hashedOtp, otpExpiresAt }
        );
    }

    public async deleteByRefreshToken(token: string): Promise<void> {
        await OtpEntryModel.deleteOne({ token });
    }
}
