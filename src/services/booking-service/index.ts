import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function getBookingByUserId(userId: number) {
  const bookingUserId = await bookingRepository.getBookingWithUserId(userId);

  if (!bookingUserId) {
    throw notFoundError();
  }

  return bookingUserId;
}

const bookingService = {
  getBookingByUserId,
};

export default bookingService;
