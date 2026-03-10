import { Router } from "express";
import { ILandingController } from "../types/landing.types";

export const createLandingRouter = (controller: ILandingController): Router => {
    const router = Router();
    router.get("/", controller.getLandingData);
    return router;

}