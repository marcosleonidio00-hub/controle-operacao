import { Router } from "express";
import authRoutes from "./auth";
import usersRoutes from "./users";
import ordersRoutes from "./orders";
import cancellationsRoutes from "./cancellations";
import goalsRoutes from "./goals";
import healthRoutes from "./health";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/orders", ordersRoutes);
router.use("/cancellations", cancellationsRoutes);
router.use("/goals", goalsRoutes);
router.use("/health", healthRoutes);

export default router;