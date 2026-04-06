import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "file"],
        default: "text"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = model("Message", messageSchema);
