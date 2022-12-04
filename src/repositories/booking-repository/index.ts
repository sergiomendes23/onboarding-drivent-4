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

async function getRoomWithId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}

async function bookingData(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function roomCapacity(roomId: number, capacity: number) {
  return prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      capacity,
    },
  });
}

const bookingRepository = {
  getBookingWithUserId,
  getRoomWithId,
  bookingData,
  roomCapacity,
};

export default bookingRepository;
