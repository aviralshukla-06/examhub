import { Request, Response } from "express";
import prisma from "../db/prisma";

export const getCountries = async (_req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ countries });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStates = async (req: Request, res: Response) => {
  try {
    const { countryId } = req.query;
    if (!countryId) {
      res.status(400).json({ message: "countryId is required" });
      return;
    }
    const states = await prisma.state.findMany({
      where: { countryId: String(countryId) },
      orderBy: { name: "asc" },
    });
    res.json({ states });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.query;
    if (!stateId) {
      res.status(400).json({ message: "stateId is required" });
      return;
    }
    const universities = await prisma.university.findMany({
      where: { stateId: String(stateId) },
      orderBy: { name: "asc" },
    });
    res.json({ universities });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
