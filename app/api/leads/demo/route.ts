import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, mobile, city, usageType } = await req.json();

    if (!fullName || !email || !mobile || !city || !usageType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.demoLead.create({
      data: {
        fullName,
        email,
        mobile,
        city,
        usageType,
      },
    });

    return NextResponse.json({ success: true, message: "Lead captured successfully" });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}