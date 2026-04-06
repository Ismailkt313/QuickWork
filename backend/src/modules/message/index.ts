import { Router } from "express";
import { MessageController } from "./controller/message.controller";
import { MessageService } from "./services/message.service";
import { MessageRepository } from "./repository/message.repository";
import { ConversationRepository } from "./repository/conversation.repository";
import { createMessageRouter } from "./routes/message.routes";

const router = Router();

const messageRepository = new MessageRepository();
const conversationRepository = new ConversationRepository();
export const messageService = new MessageService(messageRepository, conversationRepository);
const messageController = new MessageController(messageService);
const messageRouter = createMessageRouter(messageController);

export default messageRouter;