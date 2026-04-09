import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import dbConnect from "@/lib/mongodb";
import ShieldXCustomRule from "@/models/ShieldXCustomRule";

export const dynamic = "force-dynamic";

// GET — list user's custom rules
export async function GET(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();
    const rules = await ShieldXCustomRule.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({ error: "Failed to fetch custom rules" }, { status: 500 });
  }
}

/* Validate regex is safe (no catastrophic backtracking) */
function validateRegex(pattern: string, flags: string): { valid: boolean; error?: string } {
  if (pattern.length > 2000) return { valid: false, error: "Pattern too long (max 2000 chars)" };
  try {
    new RegExp(pattern, flags);
  } catch (e) {
    return { valid: false, error: `Invalid regex: ${(e as Error).message}` };
  }
  // Reject patterns with nested quantifiers that can cause ReDoS
  if (/(\+|\*|\{)\s*(\+|\*|\{)/.test(pattern) || /\([^)]*\+\)\+/.test(pattern)) {
    return { valid: false, error: "Pattern may cause catastrophic backtracking (nested quantifiers). Please simplify." };
  }
  return { valid: true };
}

// POST — create a custom rule
export async function POST(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name, ruleType, findingId, pattern, patternFlags,
      severity, cwe, owasp, category, message, remediation,
      languages, confidence, filePattern, suppressPattern, description,
    } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name is required (min 2 chars)" }, { status: 400 });
    }
    if (!ruleType || !["false-positive", "false-negative", "custom-check"].includes(ruleType)) {
      return NextResponse.json({ error: "ruleType must be false-positive, false-negative, or custom-check" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Message is required (min 5 chars)" }, { status: 400 });
    }

    // Validate rule-type specific requirements
    if (ruleType === "false-positive" && !findingId) {
      return NextResponse.json({ error: "findingId is required for false-positive rules" }, { status: 400 });
    }
    if ((ruleType === "false-negative" || ruleType === "custom-check") && !pattern) {
      return NextResponse.json({ error: "pattern (regex) is required for false-negative and custom-check rules" }, { status: 400 });
    }

    // Validate regex pattern if provided
    if (pattern) {
      const flags = patternFlags || "gi";
      const validation = validateRegex(pattern, flags);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Validate severity
    if (severity && !["critical", "high", "medium", "low", "info"].includes(severity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    // Validate languages
    const validLangs = ["javascript", "typescript", "java", "cpp", "csharp"];
    if (languages && Array.isArray(languages)) {
      for (const l of languages) {
        if (!validLangs.includes(l)) {
          return NextResponse.json({ error: `Invalid language: ${l}` }, { status: 400 });
        }
      }
    }

    // Check rule limit per user (max 100)
    await dbConnect();
    const count = await ShieldXCustomRule.countDocuments({ userId: user.id });
    if (count >= 100) {
      return NextResponse.json({ error: "Maximum 100 custom rules per account" }, { status: 400 });
    }

    const rule = await ShieldXCustomRule.create({
      userId: user.id,
      name: name.trim().slice(0, 200),
      ruleType,
      findingId: findingId?.trim().slice(0, 200),
      pattern: pattern?.slice(0, 2000),
      patternFlags: (patternFlags || "gi").slice(0, 10),
      severity: severity || "medium",
      cwe: cwe?.trim().slice(0, 50),
      owasp: owasp?.trim().slice(0, 50),
      category: (category || "Custom Rule").trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
      remediation: remediation?.trim().slice(0, 2000),
      languages: languages || [],
      enabled: true,
      confidence: confidence || "medium",
      filePattern: filePattern?.trim().slice(0, 500),
      suppressPattern: suppressPattern?.trim().slice(0, 1000),
      description: description?.trim().slice(0, 2000),
      createdBy: user.email,
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create custom rule" }, { status: 500 });
  }
}

// PUT — update a custom rule
export async function PUT(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
    }

    // Validate regex if being updated
    if (updates.pattern) {
      const flags = updates.patternFlags || "gi";
      const validation = validateRegex(updates.pattern, flags);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    await dbConnect();
    const rule = await ShieldXCustomRule.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: updates },
      { new: true }
    );

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
  }
}

// DELETE — remove a custom rule
export async function DELETE(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
    }

    await dbConnect();
    const result = await ShieldXCustomRule.findOneAndDelete({ _id: id, userId: user.id });

    if (!result) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
