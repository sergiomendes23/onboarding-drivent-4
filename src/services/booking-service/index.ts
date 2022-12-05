import { notFoundError, unauthorizedError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";

async function getBookingService(userId: number) {
  const bookingUserId = await bookingRepository.getBookingWithUserId(userId);

  if (!bookingUserId) {
    throw notFoundError();
  }

  return bookingUserId;
}

async function postBookingService(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || !enrollment || !roomId) {
    throw notFoundError();
  }
  if (!ticket.TicketType.includesHotel || ticket.TicketType.isRemote || ticket.status === TicketStatus.RESERVED) {
    throw unauthorizedError();
  }

  const roomBooking = await bookingRepository.getRoomBooking(roomId);

  if (roomBooking.Booking.length >= roomBooking.capacity) {
    throw unauthorizedError();
  }

  const bookingData = await bookingRepository.bookingData(userId, roomId);

  return bookingData.id;
}

async function putBookingService(userId: number, roomId: number, bookingId: string): Promise<number> {
  const roomBooking = await bookingRepository.getRoomBooking(roomId);

  if (!roomBooking || !roomId) {
    throw notFoundError();
  }
  if (roomBooking.Booking.length >= roomBooking.capacity) {
    throw unauthorizedError();
  }

  const booking = await bookingRepository.getBookingWithUserId(userId);
  const bookingIdNumb = Number(bookingId);

  if(bookingIdNumb !== booking.id || !booking || !bookingIdNumb) {
    throw unauthorizedError();
  }

  const bookingData = await bookingRepository.bookingUpdate(bookingIdNumb, roomId);

  return bookingData.id;
}
const bookingService = {
  getBookingService,
  postBookingService,
  putBookingService,
};

export default bookingService;
