import { Request, Response } from "express";
import prisma from "../db/prisma";

export const getTopics = async (_req: Request, res: Response) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ topics });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
