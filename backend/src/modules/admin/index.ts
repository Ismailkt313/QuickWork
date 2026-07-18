import { AdminRepository } from "./repositories/admin.repository";
import { AdminService } from "./services/admin.service";
import { AdminController } from "./controllers/admin.controller";
import { createAdminRouter } from "./routes/admin.routes";
import { notificationService } from "../notification";
import { appLogger } from "../../shared/logger";

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository, notificationService, appLogger);
const adminController = new AdminController(adminService);

const adminRouter = createAdminRouter(adminController);

export { adminRouter };