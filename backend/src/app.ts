import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport";
import { registerdRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/index";
import morgan from "morgan";
import { appLogger, MorganStream } from "./shared/logger";
import { requestIdMiddleware } from "./middleware/requestId.middleware";

const app: Application = express();

const allowedOrigins = [
  config.FRONTEND_URL,
  config.VERCEL_URL
];

app.use(requestIdMiddleware);

const morganFormat = (tokens: any, req: any, res: any) => {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: parseInt(tokens.status(req, res) || "0", 10),
        responseTime: `${tokens["response-time"](req, res)}ms`,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: tokens["user-agent"](req, res),
    });
};

app.use(morgan(morganFormat, { 
    stream: new MorganStream(appLogger),
    skip: (req) => req.method === "OPTIONS"
}));

app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

registerdRoutes(app);

app.use(errorHandler);

export default app;