import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { router } from "./routes";
import { initScheduler } from "./scheduler";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(router);

initScheduler();

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log("Listening on port", port));
