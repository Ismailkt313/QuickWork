import express, { Application } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { authRouter } from "./modules/auth";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
app.use("/api/auth", authRouter);
 
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
