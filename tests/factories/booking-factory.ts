import { prisma } from "@/config";

export async function createBookingData(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export async function createBookingId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}
