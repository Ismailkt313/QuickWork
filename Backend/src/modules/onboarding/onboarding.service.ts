import { serviProvider } from "./onboarding.model";
import { IBasicProfile } from "./onboarding.types";

export const getOnboardingStatus = async (userId: String) => {
    try {
        const provider = await serviProvider.findOne({ userId })
        if (!provider) {
            return {
                status: 'not_started',
                step:0,
            }
        }
        if (provider.verification.status === "draft") {
        return {
          status: "in_progress",
          step: provider.onboardingStepNo,
        };
      }

      if (provider.verification.status === "pending") {
        return {
          status: "pending",
        };
      }

      if (provider.verification.status === "verified") {
        return {
          status: "approved",
        };
      }

      if (provider.verification.status === "rejected") {
        return {
          status: "rejected",
          reason: provider.verification.rejectionReason,
        };
      }
    } catch (error) {
        console.log('getonboarding status error',error)
        return error
    }
}

export const submitbasicProfile = async (userId: string, data: IBasicProfile) => {
    try {
        const provider = await serviProvider.findOne({ userId })
        if (provider?.verification.status == 'pending') {
            throw new Error('Application under review')
        }
        if (provider?.verification.status == 'verified') {
            throw new Error('Application already varified')
        }
        if (!data.about || data.about.length < 20){
          throw new Error("About too short");
        }
        if (!data.hourlyRate || data.hourlyRate <= 0){
          throw new Error("Invalid hourly rate");
        }
        const update = serviProvider.findOneAndUpdate({ userId },
            {
                about: data.about,
                profileImage: data.profileImage,
                experience: data.experience,
                hourlyRate:data.hourlyRate
            }, {
                upsert: true, new: true
        })
        return update

    } catch (error) {
        
    }
}