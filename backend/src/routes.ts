import { Application } from "express";
import { authRouter } from "./modules/auth";
import { adminRouter } from "./modules/admin";
import { serviceProviderRouter } from "./modules/serviceProvider";
import { serviceRequestRouter, adminServiceRequestRouter } from "./modules/serviceRequest";
import { locationRouter } from "./modules/location";
import { skillRouter } from "./modules/skill";
import { uploadRouter } from "./modules/upload";
import { landingRouter } from "./modules/landing";
import { jobRouter } from "./modules/job";
import { assignmentRouter } from "./modules/assignment";
import messageRouter from "./modules/message";

export const registerdRoutes = (app:Application) => {
    app.use("/api/auth", authRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/admin", adminServiceRequestRouter);
    app.use("/api/provider", serviceProviderRouter);
    app.use("/api/service-request", serviceRequestRouter);
    app.use("/api/locations", locationRouter);
    app.use("/api/skills", skillRouter);
    app.use("/api/upload", uploadRouter);
    app.use("/api/landing", landingRouter);
    app.use("/api/job", jobRouter);
    app.use("/api/assignment", assignmentRouter); 
    app.use("/api/messages", messageRouter);
}