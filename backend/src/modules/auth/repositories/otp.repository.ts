import { IOtpRepository, IOtpEntry, ICreateUserData } from "../interfaces/auth.interface";
import { OtpEntryModel } from "../models/otp.model";

export class OtpRepository implements IOtpRepository {

    public async upsert(email: string, hashedOtp: string, userData: ICreateUserData, otpExpiresAt: Date, expiresAt: Date): Promise<void> {
        await OtpEntryModel.findOneAndUpdate(
            { email },
            { hashedOtp, userData, otpExpiresAt, expiresAt },
            { upsert: true, new: true }
        );
    }

    public async findByEmail(email: string): Promise<IOtpEntry | null> {
        return OtpEntryModel.findOne({ email });
    }

    public async deleteByEmail(email: string): Promise<void> {
        await OtpEntryModel.deleteOne({ email });
    }

    public async updateOtp(email: string, hashedOtp: string, otpExpiresAt: Date): Promise<void> {
        await OtpEntryModel.findOneAndUpdate(
            { email },
            { hashedOtp, otpExpiresAt }
        );
    }
}
