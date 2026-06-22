import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import googleAuthRouter from "./google-auth";
import testsRouter from "./tests";
import statsRouter from "./stats";
import lessonsRouter from "./lessons";
import leaderboardRouter from "./leaderboard";
import certificatesRouter from "./certificates";
import blogRouter from "./blog";
import adminRouter from "./admin";
import usersRouter from "./users";
import hrRouter from "./hr";
import assessmentRouter from "./assessment";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(googleAuthRouter);
router.use(testsRouter);
router.use(statsRouter);
router.use(lessonsRouter);
router.use(leaderboardRouter);
router.use(certificatesRouter);
router.use(blogRouter);
router.use(adminRouter);
router.use(usersRouter);
router.use(hrRouter);
router.use(assessmentRouter);

export default router;
