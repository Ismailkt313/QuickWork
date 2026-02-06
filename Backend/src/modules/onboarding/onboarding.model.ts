import mongoose, { Schema,Document} from 'mongoose'
import { ref, title } from 'node:process'

export interface IServiceProvider extends Document {
    userId: mongoose.Types.ObjectId,
    about: string,
    profileImage: string,
    experience: string,
    hourlyRate: number,
    
    skills: mongoose.Types.ObjectId,
    serviceArea: mongoose.Types.ObjectId[],
    isAvalable: Boolean,
    isActive: Boolean,
    onboardingStepNo: number,
    verification: {
        status: "draft" | "pending" | "verified" | "rejected"
        verifiedBy?: mongoose.Types.ObjectId
        varifiedAt?: Date
        rejectionReason?:string
    }
    portfolio: {
        title: string
        description: string
        image:string[]
    }[],
    createdAt: Date
    updatedAt: Date
}
const serviceProviderSchema = new Schema<IServiceProvider>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique:true
    },
    about: { type: String },
    profileImage: { type: String },
    experience: { type: String },
    hourlyRate: { type: Number },
    
    skills: [
        {
            type: Schema.Types.ObjectId ,
            ref:'Skill'
        },
    ],
    serviceArea: [
        {
            type: Schema.Types.ObjectId,
            ref:'serviceArea'
        }
    ],
    isAvalable: { type: Boolean, defualt: true },
    isActive: { type: Boolean, default: false },
    onboardingStepNo: { type: Number,default:0 },
    verification: {
        status: {
            type: String,
            enum:["draft","pending" , "verified" , "rejected"],
            default:"pending",
        },
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref:'User'
        },
        varifiedAt: {
            type:Date
        },
        rejectionReason: String
    },
    portfolio: [{
        title: { type: String },
        description: { type: String },
        Image:[{type:String}]
    }]
}, {
    timestamps:true
})

export const serviProvider = mongoose.model<IServiceProvider>('serviceProvider',serviceProviderSchema)