import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import ordersRouter from "./orders.js";
import cancellationsRouter from "./cancellations.js";
import goalsRouter from "./goals.js";
import healthRouter from "./health.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/orders", ordersRouter);
router.use("/cancellations", cancellationsRouter);
router.use("/goals", goalsRouter);
router.use("/health", healthRouter);

export default router;