import { MESSAGE_TYPE } from "../../../constants/message";

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message?: string;
  image?: string;
  messageType: MESSAGE_TYPE;
  createdAt: string;
}
