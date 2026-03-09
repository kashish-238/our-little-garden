import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Gardens
  app.post(api.gardens.create.path, async (req, res) => {
    try {
      const input = api.gardens.create.input.parse(req.body);
      const garden = await storage.createGarden(input);
      res.status(201).json(garden);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.gardens.get.path, async (req, res) => {
    const code = req.params.code;
    const garden = await storage.getGarden(code);
    if (!garden) {
      return res.status(404).json({ message: 'Garden not found' });
    }
    res.json(garden);
  });

  app.get(api.gardens.getState.path, async (req, res) => {
    try {
      const code = req.params.code;
      const state = await storage.getGardenState(code);
      res.json(state);
    } catch (err: any) {
      if (err.message === "Garden not found") {
        return res.status(404).json({ message: err.message });
      }
      throw err;
    }
  });

  app.patch(api.gardens.updateHealth.path, async (req, res) => {
    try {
      const code = req.params.code;
      const input = api.gardens.updateHealth.input.parse(req.body);
      
      const garden = await storage.getGarden(code);
      if (!garden) return res.status(404).json({ message: 'Garden not found' });

      const updated = await storage.updateGardenHealth(code, input.healthScore);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Users
  app.post(api.gardens.createUser.path, async (req, res) => {
    try {
      const code = req.params.code;
      const input = api.gardens.createUser.input.parse(req.body);
      
      const garden = await storage.getGarden(code);
      if (!garden) return res.status(404).json({ message: 'Garden not found' });

      const user = await storage.createUser({ ...input, gardenCode: code });
      await storage.updateLastActivity(code);
      
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // User login (find existing user by name)
  app.post(api.gardens.loginUser.path, async (req, res) => {
    try {
      const code = req.params.code;
      const input = api.gardens.loginUser.input.parse(req.body);

      const garden = await storage.getGarden(code);
      if (!garden) return res.status(404).json({ message: 'Garden not found' });

      const user = await storage.findUserByNameInGarden(code, input.name);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Flowers
  app.post(api.gardens.createFlower.path, async (req, res) => {
    try {
      const code = req.params.code;
      const input = api.gardens.createFlower.input.parse(req.body);
      
      const garden = await storage.getGarden(code);
      if (!garden) return res.status(404).json({ message: 'Garden not found' });

      const flower = await storage.createFlower({ ...input, gardenCode: code });
      await storage.updateLastActivity(code);
      
      res.status(201).json(flower);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.gardens.updateFlower.path, async (req, res) => {
    try {
      const code = req.params.code;
      const id = parseInt(req.params.id);
      const input = api.gardens.updateFlower.input.parse(req.body);
      
      const flower = await storage.getFlower(id);
      if (!flower || flower.gardenCode !== code) {
        return res.status(404).json({ message: 'Flower not found' });
      }

      const updated = await storage.updateFlower(id, input);
      await storage.updateLastActivity(code);
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Letters
  app.post(api.gardens.createLetter.path, async (req, res) => {
    try {
      const code = req.params.code;
      const input = api.gardens.createLetter.input.parse(req.body);
      
      const garden = await storage.getGarden(code);
      if (!garden) return res.status(404).json({ message: 'Garden not found' });

      const letter = await storage.createLetter({ ...input, gardenCode: code });
      await storage.updateLastActivity(code);
      
      res.status(201).json(letter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.gardens.readLetter.path, async (req, res) => {
    try {
      const code = req.params.code;
      const id = parseInt(req.params.id);
      
      const letters = await storage.getLettersInGarden(code);
      const letter = letters.find(l => l.id === id);
      
      if (!letter) {
        return res.status(404).json({ message: 'Letter not found' });
      }

      const updated = await storage.markLetterRead(id);
      await storage.updateLastActivity(code);
      
      res.json(updated);
    } catch (err) {
      throw err;
    }
  });

  return httpServer;
}
