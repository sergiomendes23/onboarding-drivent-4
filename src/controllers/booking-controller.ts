import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const BookingByUserId = await bookingService.getBookingService(userId);
    return res.status(httpStatus.OK).send(BookingByUserId);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  try {
    const booking = await bookingService.postBookingService(userId, roomId);
    const bookingId = booking.id;
    return res.status(httpStatus.OK).send({ bookingId });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "unauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
