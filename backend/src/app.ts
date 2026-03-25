import express, { Application } from "express";
import { errorHandler } from "./middleware/errorHandler";
import { registerdRoutes } from "./routes";
import cors from 'cors'
import passport from "./config/passport";

const app: Application = express();


app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' })); 
app.use(passport.initialize());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quick-work-git-main-ismails-projects-08248cd7.vercel.app/'
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}))


registerdRoutes(app)

app.use(errorHandler);


export default app;
