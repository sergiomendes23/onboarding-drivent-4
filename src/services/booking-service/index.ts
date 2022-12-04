import { notFoundError, unauthorizedError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
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
  if (!ticket.TicketType.includesHotel || ticket.TicketType.isRemote) {
    throw cannotListHotelsError;
  }
  if (ticket.status === TicketStatus.RESERVED) {
    throw unauthorizedError();
  }

  const room = await bookingRepository.getRoomWithId(userId);

  if (room.capacity === 0) {
    throw unauthorizedError();
  }

  const bookingData = await bookingRepository.bookingData(userId, roomId);

  const capacity = room.capacity - 1;

  await bookingRepository.roomCapacity(roomId, capacity);

  return bookingData;
}

const bookingService = {
  getBookingService,
  postBookingService,
};

export default bookingService;
