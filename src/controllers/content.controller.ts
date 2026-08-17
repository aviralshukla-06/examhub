import { Response } from "express";
import { z } from "zod";
import prisma from "../db/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";

// ─── Validation Schema ─────────────────────────────────────

const uploadSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["VIDEO", "PDF", "DOCUMENT", "IMAGE"]),
  countryId: z.string().min(1, "Country is required"),
  stateId: z.string().min(1, "State is required"),
  universityId: z.string().min(1, "University is required"),
  topicIds: z
    .string()
    .transform((val) => JSON.parse(val))  // multipart sends strings
    .pipe(z.array(z.string()).min(1, "At least one topic required")),
  isPaid: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean()),
  priceInr: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
});

// ─── Upload Content ────────────────────────────────────────

export const uploadContent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 1. File must exist (multer puts it here)
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // 2. Validate body
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues });
      return;
    }

    const {
      title,
      description,
      type,
      countryId,
      stateId,
      universityId,
      topicIds,
      isPaid,
      priceInr,
    } = parsed.data;

    // 3. Paid content must have a price
    if (isPaid && (!priceInr || priceInr <= 0)) {
      res.status(400).json({ message: "Paid content requires a valid price" });
      return;
    }

    // 4. Verify geography exists in DB
    const [country, state, university] = await Promise.all([
      prisma.country.findUnique({ where: { id: countryId } }),
      prisma.state.findUnique({ where: { id: stateId } }),
      prisma.university.findUnique({ where: { id: universityId } }),
    ]);

    if (!country || !state || !university) {
      res.status(400).json({ message: "Invalid country, state or university" });
      return;
    }

    // 5. Verify all topics exist
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
    });

    if (topics.length !== topicIds.length) {
      res.status(400).json({ message: "One or more invalid topic IDs" });
      return;
    }

    // 6. Build file URL (local path for now, S3 URL later)
    const fileUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    // 7. Create content record
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type: type as ContentType,
        fileUrl,
        isPaid,
        priceInr: isPaid ? priceInr : null,
        uploaderId: req.user!.id,
        countryId,
        stateId,
        universityId,
        topics: {
          create: topicIds.map((topicId: string) => ({ topicId })),
        },
      },
      include: {
        topics: { include: { topic: true } },
        country: true,
        state: true,
        university: true,
      },
    });

    res.status(201).json({
      message: "Content uploaded successfully",
      content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ─── Get Content by ID (with access check) ─────────────────


export const getContentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, userName: true, fullName: true, avatarUrl: true },
        },
        topics: { include: { topic: true } },
        country: true,
        state: true,
        university: true,
      },
    });

    if (!content || content.status === "DELETED") {
      res.status(404).json({ message: "Content not found" });
      return;
    }

    // Free content — return everything
    if (!content.isPaid) {
      res.status(200).json({ content });
      return;
    }

    // Paid content — check if user bought it or is the uploader
    const userId = req.user?.id;

    if (userId === content.uploaderId) {
      res.status(200).json({ content });
      return;
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_contentId: { userId: userId!, contentId: id },
      },
    });

    if (!purchase || purchase.status !== "COMPLETED") {
      // Return metadata only, not the fileUrl
      const { fileUrl, ...meta } = content;
      res.status(200).json({
        content: meta,
        locked: true,
        message: "Purchase required to access this content",
      });
      return;
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── List Content (with filters) ───────────────────────────

export const listContent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      countryId,
      stateId,
      universityId,
      topicId,
      search,
      type,
      isPaid,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const content = await prisma.content.findMany({
      where: {
        status: "ACTIVE",
        ...(countryId && { countryId }),
        ...(stateId && { stateId }),
        ...(universityId && { universityId }),
        ...(type && { type: type as ContentType }),
        ...(isPaid !== undefined && { isPaid: isPaid === "true" }),
        ...(topicId && {
          topics: { some: { topicId } },
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              topics: {
                some: {
                  topic: { name: { contains: search, mode: "insensitive" } },
                },
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isPaid: true,
        priceInr: true,
        thumbnailUrl: true,
        createdAt: true,
        // Never expose fileUrl in list — only in getById after access check
        uploader: {
          select: { id: true, userName: true, avatarUrl: true },
        },
        topics: { include: { topic: true } },
        country: true,
        state: true,
        university: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const total = await prisma.content.count({
      where: { status: "ACTIVE" },
    });

    res.status(200).json({
      content,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
