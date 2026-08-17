import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../db/prisma";

const jwtSecret = process.env.JWT_SECRET;

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reqBody = z.object({
      email: z.email(),
      userName: z.string().min(3).max(20),
      fullName: z.string().min(1),
      password: z.string().min(6),
    });

    const parsedBody = reqBody.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        message: parsedBody.error.issues,
      });
      return;
    }

    const { email, userName, fullName, password } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        userName,
        fullName,
        password: hashedPassword,
      },
    });

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        userName: newUser.userName,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "An error occurred while creating the user",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loginSchema = z.object({
      email: z.email(),
      password: z.string().min(1),
    });

    const parsedBody = loginSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        message: parsedBody.error.issues,
      });
      return;
    }

    const { email, password } = parsedBody.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};