import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXAlertConfig from "@/models/ShieldXAlertConfig";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
} from "@/lib/shieldx-access";
import { sendShieldXTestAlert } from "@/lib/shieldx-alerts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Alert system is coming soon. This feature is under active development." },
    { status: 501 }
  );
}
