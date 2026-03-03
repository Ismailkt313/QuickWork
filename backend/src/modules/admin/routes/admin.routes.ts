import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";

export const createAdminRouter = (adminController: AdminController): Router => {
    const router = Router();

    router.get("/users", authMiddleware, authorizeRoles("admin"), adminController.getUsers);
    router.patch("/users/:id/block", authMiddleware, authorizeRoles("admin"), adminController.toggleBlockUser);

    return router;
};
