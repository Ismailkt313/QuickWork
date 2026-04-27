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
import { reviewRouter } from "./modules/review";
import { reportRouter } from "./modules/report";
import { notificationRouter } from "./modules/notification";
import { API_ROUTES } from "./constants/routes";

export const registerdRoutes = (app: Application) => {
    const BASE_URL = API_ROUTES.BASE
    app.use(BASE_URL + API_ROUTES.AUTH, authRouter);
    app.use(BASE_URL + API_ROUTES.ADMIN, adminRouter);
    app.use(BASE_URL + API_ROUTES.ADMIN, adminServiceRequestRouter);
    app.use(BASE_URL + API_ROUTES.PROVIDER, serviceProviderRouter);
    app.use(BASE_URL + API_ROUTES.SERVICE_REQUEST, serviceRequestRouter);
    app.use(BASE_URL + API_ROUTES.LOCATIONS, locationRouter);
    app.use(BASE_URL + API_ROUTES.SKILLS, skillRouter);
    app.use(BASE_URL + API_ROUTES.UPLOAD, uploadRouter);
    app.use(BASE_URL + API_ROUTES.LANDING, landingRouter);
    app.use(BASE_URL + API_ROUTES.JOB, jobRouter);
    app.use(BASE_URL + API_ROUTES.ASSIGNMENT, assignmentRouter);
    app.use(BASE_URL + API_ROUTES.MESSAGES, messageRouter);
    app.use(BASE_URL + API_ROUTES.REVIEW, reviewRouter);
    app.use(BASE_URL + API_ROUTES.REPORT, reportRouter);
    app.use(BASE_URL + API_ROUTES.NOTIFICATIONS, notificationRouter);
}