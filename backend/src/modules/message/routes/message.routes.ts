import { Router } from "express";
import { IMessageController } from "../interface/message.interface";
import { authMiddleware } from "../../../middleware/auth.middleware";

export const createMessageRouter = (controller: IMessageController): Router => {
    const router = Router();

    router.use(authMiddleware);

    router.post("/createMessage", controller.createMessage.bind(controller));
    router.get("/getMessages", controller.getMessages.bind(controller));
    router.get("/getConversations", controller.getConversations.bind(controller));
    router.get("/getConversation", controller.getConversation.bind(controller));
    router.delete("/deleteMessage", controller.deleteMessage.bind(controller));
    router.delete("/deleteConversation", controller.deleteConversation.bind(controller));

    return router;
};
