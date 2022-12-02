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

const bookingRepository = {
  getBookingWithUserId,
};

export default bookingRepository;
