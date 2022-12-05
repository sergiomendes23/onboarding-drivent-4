import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createUser,
  createHotel,
  createRoomWithHotelId,
  createEnrollmentWithAddress,
  createBookingData,
  createTicketTypeRemote,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
} from "../factories";

import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user is not logged in", async () => {
      const token = await generateValidToken();

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 when booking is included in rooms data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBookingData(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const body = { roomId: faker.datatype.number() };

    const response = await server.post("/booking").send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const body = { roomId: faker.datatype.number() };

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const body = { roomId: faker.datatype.number() };

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when no roomId exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      await createRoomWithHotelId(hotel.id);
      const body = { roomId: "" };

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 when it has no enrollment for the user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 when it has no ticket for the user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const body = { roomId: room.id };

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    describe("when user is valid", () => {
      it("should respond with status 401 when not including hotel or ticket is remote or ticket is reserved", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      it("should respond with status 401 when there is no space available in the room", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
      it("should respond with status 200 when have bookingId", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        await createBookingData(user.id, room.id);

        const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          bookingId: expect.any(Number),
        });
      });
    });
  });
});

describe("PUT /booking/:bookingId", async () => {
  it("should respond with status 401 if no token is given", async () => {
    const body = { roomId: faker.datatype.number() };

    const response = await server.put("/booking/1").send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const body = { roomId: faker.datatype.number() };

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const body = { roomId: faker.datatype.number() };

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
});
