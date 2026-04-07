import express, { Application } from "express";
import cors from "cors";
import passport from "./config/passport";
import { registerdRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { config } from "./config/index";

const app: Application = express();

const allowedOrigins = [
  config.FRONTEND_URL,
  config.VERCEL_URL
];

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