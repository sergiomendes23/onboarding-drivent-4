import { prisma } from "@/config";

async function getBookingWithUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function getRoomBooking(id: number) {
  return prisma.room.findFirst({
    where: {
      id,
    },
    include: {
      Booking: true,
    },
  });
}

async function bookingData(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
    include: {
      Room: true,
    },
  });
}

const bookingRepository = {
  getBookingWithUserId,
  getRoomBooking,
  bookingData,
};

export default bookingRepository;
