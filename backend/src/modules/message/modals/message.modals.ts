import { Schema, model } from "mongoose";
import { MESSAGE_TYPE } from "../../../constants/message";

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
        enum: Object.values(MESSAGE_TYPE),
        default: MESSAGE_TYPE.TEXT
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = model("Message", messageSchema);
