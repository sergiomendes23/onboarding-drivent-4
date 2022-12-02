import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const BookingByUserId = await bookingService.getBookingByUserId(userId);
    return res.status(httpStatus.OK).send(BookingByUserId);
  } catch (error) {
    if (error.name === "notFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
