import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import testsRouter from "./tests";
import statsRouter from "./stats";
import lessonsRouter from "./lessons";
import leaderboardRouter from "./leaderboard";
import certificatesRouter from "./certificates";
import blogRouter from "./blog";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(testsRouter);
router.use(statsRouter);
router.use(lessonsRouter);
router.use(leaderboardRouter);
router.use(certificatesRouter);
router.use(blogRouter);
router.use(usersRouter);

export default router;
