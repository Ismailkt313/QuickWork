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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

SkillSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.toLowerCase().trim();
    }
    next();
});

export const SkillModel = mongoose.model<ISkill>('Skill', SkillSchema);
