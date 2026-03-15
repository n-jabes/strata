import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const router = Router();

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post(
  "/register",
  async (req: Request<object, object, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ message: "Name must be at least 2 characters." });
      return;
    }

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ message: "A valid email is required." });
      return;
    }

    if (!password || password.length < 8) {
      res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
      return;
    }

    try {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existing) {
        res.status(409).json({ message: "An account with this email already exists." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
        },
        select: { id: true, name: true, email: true, createdAt: true },
      });

      res.status(201).json({ success: true, user });
    } catch {
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  }
);

export default router;
