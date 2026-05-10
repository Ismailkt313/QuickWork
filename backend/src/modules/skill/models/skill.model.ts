import mongoose, { Schema } from 'mongoose';
import { ISkill } from '../interfaces/skill.interface';

const SkillSchema = new Schema<ISkill>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

SkillSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.toLowerCase().trim();
    }
    next();
});

export const SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);
