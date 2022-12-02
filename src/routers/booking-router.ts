import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import {  } from "@/controllers";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/");

export { bookingRouter };
