import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  gardens,
  users,
  flowers,
  letters,
  type Garden,
  type User,
  type Flower,
  type Letter,
  type CreateGardenRequest,
  type CreateUserRequest,
  type CreateFlowerRequest,
  type UpdateFlowerRequest,
  type CreateLetterRequest,
  type GardenStateResponse
} from "@shared/schema";

export interface IStorage {
  // Garden
  getGarden(code: string): Promise<Garden | undefined>;
  createGarden(garden: CreateGardenRequest): Promise<Garden>;
  updateGardenHealth(code: string, healthScore: number): Promise<Garden>;
  updateLastActivity(code: string): Promise<void>;
  getGardenState(code: string): Promise<GardenStateResponse>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUsersInGarden(gardenCode: string): Promise<User[]>;
  createUser(user: CreateUserRequest): Promise<User>;

  // Flowers
  getFlower(id: number): Promise<Flower | undefined>;
  getFlowersInGarden(gardenCode: string): Promise<Flower[]>;
  createFlower(flower: CreateFlowerRequest): Promise<Flower>;
  updateFlower(id: number, updates: UpdateFlowerRequest): Promise<Flower>;

  // Letters
  getLettersInGarden(gardenCode: string): Promise<Letter[]>;
  createLetter(letter: CreateLetterRequest): Promise<Letter>;
  markLetterRead(id: number): Promise<Letter>;
}

export class DatabaseStorage implements IStorage {
  async getGarden(code: string): Promise<Garden | undefined> {
    const [garden] = await db.select().from(gardens).where(eq(gardens.code, code));
    return garden;
  }

  async createGarden(garden: CreateGardenRequest): Promise<Garden> {
    const [newGarden] = await db.insert(gardens).values(garden).returning();
    return newGarden;
  }

  async updateGardenHealth(code: string, healthScore: number): Promise<Garden> {
    const [updated] = await db.update(gardens)
      .set({ healthScore })
      .where(eq(gardens.code, code))
      .returning();
    return updated;
  }

  async updateLastActivity(code: string): Promise<void> {
    await db.update(gardens)
      .set({ lastActivity: new Date() })
      .where(eq(gardens.code, code));
  }

  async getGardenState(code: string): Promise<GardenStateResponse> {
    const [garden] = await db.select().from(gardens).where(eq(gardens.code, code));
    if (!garden) throw new Error("Garden not found");

    const usersInGarden = await this.getUsersInGarden(code);
    const flowersInGarden = await this.getFlowersInGarden(code);
    const lettersInGarden = await this.getLettersInGarden(code);

    return {
      garden,
      users: usersInGarden,
      flowers: flowersInGarden,
      letters: lettersInGarden,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsersInGarden(gardenCode: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.gardenCode, gardenCode));
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getFlower(id: number): Promise<Flower | undefined> {
    const [flower] = await db.select().from(flowers).where(eq(flowers.id, id));
    return flower;
  }

  async getFlowersInGarden(gardenCode: string): Promise<Flower[]> {
    return await db.select().from(flowers).where(eq(flowers.gardenCode, gardenCode));
  }

  async createFlower(flower: CreateFlowerRequest): Promise<Flower> {
    const [newFlower] = await db.insert(flowers).values(flower).returning();
    return newFlower;
  }

  async updateFlower(id: number, updates: UpdateFlowerRequest): Promise<Flower> {
    const [updated] = await db.update(flowers)
      .set(updates)
      .where(eq(flowers.id, id))
      .returning();
    return updated;
  }

  async getLettersInGarden(gardenCode: string): Promise<Letter[]> {
    return await db.select().from(letters).where(eq(letters.gardenCode, gardenCode));
  }

  async createLetter(letter: CreateLetterRequest): Promise<Letter> {
    const [newLetter] = await db.insert(letters).values(letter).returning();
    return newLetter;
  }

  async markLetterRead(id: number): Promise<Letter> {
    const [updated] = await db.update(letters)
      .set({ readAt: new Date() })
      .where(eq(letters.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
