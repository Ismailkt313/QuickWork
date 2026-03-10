import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { IAdminController, ROLES } from "../interfaces/admin.interface";

export const createAdminRouter = (adminController: IAdminController): Router => {
    const router = Router();

    router.get("/users", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getUsers);
    router.patch("/users/:id/block", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.toggleBlockUser);
    router.get("/providers/pending", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getPendingProviders);
    router.patch("/providers/:id/approve", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.approveProvider);
    router.patch("/providers/:id/reject", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.rejectProvider);

    return router;
};
