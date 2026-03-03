import express, { Application } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { authRouter } from "./modules/auth";
import { adminRouter } from "./modules/admin";
import { errorHandler } from "./middleware/errorHandler";
import { serviceProviderRouter } from "./modules/serviceProvider";
import { serviceRequestRouter, adminServiceRequestRouter } from "./modules/serviceRequest";
import { locationRouter } from "./modules/location";
import { skillRouter } from "./modules/skill";
import { uploadRouter } from "./modules/upload";
import cors from 'cors'
import passport from "./config/passport";

const app: Application = express();


app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
    
    
    next();
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
app.use("/api/skills", skillRouter);
app.use("/api/upload", uploadRouter);

app.use(errorHandler);


const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('databse connected')
        app.listen(config.PORT, () => {
            console.log('server connected')
        });
    } catch (error) {
        
        process.exit(1);
    }
};

startServer();

export default app;
