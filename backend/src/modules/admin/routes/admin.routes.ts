import { Router } from "express";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { IAdminController } from "../interfaces/admin.interface";
import { ROLES } from "../../../constants/roles";

export const createAdminRouter = (adminController: IAdminController): Router => {
    const router = Router();

    router.get("/users", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getUsers);
    router.patch("/users/:id/block", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.toggleBlockUser);
    router.get("/providers/pending", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getPendingProviders);
    router.patch("/provider/:id/approve", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.approveProvider);
    router.patch("/provider/:id/reject", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.rejectProvider);
    router.get("/provider/:id", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getProviderDetails);
    router.get("/user/:id", authMiddleware, authorizeRoles(ROLES.ADMIN), adminController.getUserById);

    return router;
};
