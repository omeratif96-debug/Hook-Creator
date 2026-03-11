import { Router, type IRouter } from "express";
import healthRouter from "./health";
import hooksRouter from "./hooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(hooksRouter);

export default router;
