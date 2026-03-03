import express, { Application } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { authRouter } from "./modules/auth";
import { adminRouter } from "./modules/admin";
import { errorHandler } from "./middleware/errorHandler";
import { serviceProviderRouter } from "./modules/serviceProvider";
import { serviceRequestRouter, adminServiceRequestRouter } from "./modules/serviceRequest";
import { locationRouter } from "./modules/location";
import cors from 'cors'
import passport from "./config/passport";

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))


app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminServiceRequestRouter);
app.use("/api/provider", serviceProviderRouter);
app.use("/api/service-request", serviceRequestRouter);
app.use("/api/locations", locationRouter);

app.use(errorHandler);


const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected successfully");

        app.listen(config.PORT, () => {
            console.log(`Server running on port ${config.PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

startServer();

export default app;
