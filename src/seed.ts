import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // ─── Countries ───────────────────────────────────────────
  const india = await prisma.country.upsert({
    where: { code: "IN" },
    update: {},
    create: { name: "India", code: "IN" },
  });

  // ─── States ──────────────────────────────────────────────
  const maha = await prisma.state.upsert({
    where: { name_countryId: { name: "Maharashtra", countryId: india.id } },
    update: {},
    create: { name: "Maharashtra", countryId: india.id },
  });

  const delhi = await prisma.state.upsert({
    where: { name_countryId: { name: "Delhi", countryId: india.id } },
    update: {},
    create: { name: "Delhi", countryId: india.id },
  });

  const karnataka = await prisma.state.upsert({
    where: { name_countryId: { name: "Karnataka", countryId: india.id } },
    update: {},
    create: { name: "Karnataka", countryId: india.id },
  });

  // ─── Universities ─────────────────────────────────────────
  const mumbaiUni = await prisma.university.upsert({
    where: { name_stateId: { name: "University of Mumbai", stateId: maha.id } },
    update: {},
    create: { name: "University of Mumbai", stateId: maha.id },
  });

  const sppu = await prisma.university.upsert({
    where: { name_stateId: { name: "SPPU Pune", stateId: maha.id } },
    update: {},
    create: { name: "SPPU Pune", stateId: maha.id },
  });

  const iitDelhi = await prisma.university.upsert({
    where: { name_stateId: { name: "IIT Delhi", stateId: delhi.id } },
    update: {},
    create: { name: "IIT Delhi", stateId: delhi.id },
  });

  const du = await prisma.university.upsert({
    where: { name_stateId: { name: "Delhi University", stateId: delhi.id } },
    update: {},
    create: { name: "Delhi University", stateId: delhi.id },
  });

  const vtu = await prisma.university.upsert({
    where: { name_stateId: { name: "VTU", stateId: karnataka.id } },
    update: {},
    create: { name: "VTU", stateId: karnataka.id },
  });

  // ─── Topics ───────────────────────────────────────────────
  const topicNames = [
    "Mathematics", "DBMS", "Operating Systems",
    "Networks", "Physics", "Data Structures",
    "Machine Learning", "Aptitude", "Programming",
  ];

  const topicMap: Record<string, string> = {};

  for (const name of topicNames) {
    const slug = name.toLowerCase().replace(/ /g, "-");
    const topic = await prisma.topic.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    topicMap[name] = topic.id;
  }

  // ─── Users ────────────────────────────────────────────────
  const password = await bcrypt.hash("password123", 10);

  const rahul = await prisma.user.upsert({
    where: { email: "rahul@examhub.com" },
    update: {},
    create: {
      email: "rahul@examhub.com",
      userName: "rahul_dev",
      fullName: "Rahul Singh",
      password,
      role: "CREATOR",
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@examhub.com" },
    update: {},
    create: {
      email: "priya@examhub.com",
      userName: "priya_tech",
      fullName: "Priya Sharma",
      password,
      role: "CREATOR",
    },
  });

  const arjun = await prisma.user.upsert({
    where: { email: "arjun@examhub.com" },
    update: {},
    create: {
      email: "arjun@examhub.com",
      userName: "arjun_notes",
      fullName: "Arjun Verma",
      password,
      role: "CREATOR",
    },
  });

  // ─── Content ──────────────────────────────────────────────
  const contents = [
    {
      title: "DBMS Complete Notes SE Sem 4",
      type: "PDF" as const,
      isPaid: false,
      priceInr: null,
      uploaderId: rahul.id,
      countryId: india.id,
      stateId: maha.id,
      universityId: mumbaiUni.id,
      topics: ["DBMS", "Mathematics"],
    },
    {
      title: "Normalization 1NF to BCNF Video Lecture",
      type: "VIDEO" as const,
      isPaid: true,
      priceInr: 49,
      uploaderId: priya.id,
      countryId: india.id,
      stateId: maha.id,
      universityId: sppu.id,
      topics: ["DBMS"],
    },
    {
      title: "Operating Systems Complete Notes",
      type: "PDF" as const,
      isPaid: false,
      priceInr: null,
      uploaderId: arjun.id,
      countryId: india.id,
      stateId: delhi.id,
      universityId: iitDelhi.id,
      topics: ["Operating Systems"],
    },
    {
      title: "Data Structures Question Bank 2024",
      type: "DOCUMENT" as const,
      isPaid: true,
      priceInr: 99,
      uploaderId: rahul.id,
      countryId: india.id,
      stateId: delhi.id,
      universityId: du.id,
      topics: ["Data Structures"],
    },
    {
      title: "Machine Learning Slides — Full Course",
      type: "PDF" as const,
      isPaid: true,
      priceInr: 149,
      uploaderId: priya.id,
      countryId: india.id,
      stateId: karnataka.id,
      universityId: vtu.id,
      topics: ["Machine Learning"],
    },
    {
      title: "Computer Networks Handwritten Notes",
      type: "DOCUMENT" as const,
      isPaid: false,
      priceInr: null,
      uploaderId: arjun.id,
      countryId: india.id,
      stateId: maha.id,
      universityId: mumbaiUni.id,
      topics: ["Networks"],
    },
    {
      title: "SQL Queries Cheat Sheet",
      type: "PDF" as const,
      isPaid: false,
      priceInr: null,
      uploaderId: rahul.id,
      countryId: india.id,
      stateId: delhi.id,
      universityId: iitDelhi.id,
      topics: ["DBMS", "Programming"],
    },
    {
      title: "Python Programming Complete Guide",
      type: "VIDEO" as const,
      isPaid: true,
      priceInr: 79,
      uploaderId: priya.id,
      countryId: india.id,
      stateId: maha.id,
      universityId: sppu.id,
      topics: ["Programming"],
    },
  ];

  for (const c of contents) {
    const existing = await prisma.content.findFirst({
      where: { title: c.title },
    });
    if (existing) continue;

    await prisma.content.create({
      data: {
        title: c.title,
        type: c.type,
        isPaid: c.isPaid,
        priceInr: c.priceInr,
        fileUrl: `/uploads/sample-${c.type.toLowerCase()}.pdf`,
        status: "ACTIVE",
        uploaderId: c.uploaderId,
        countryId: c.countryId,
        stateId: c.stateId,
        universityId: c.universityId,
        topics: {
          create: c.topics.map((name) => ({
            topicId: topicMap[name],
          })),
        },
      },
    });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());