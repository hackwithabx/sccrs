import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ShieldXScan from "@/models/ShieldXScan";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET — Fetch ShieldX admin dashboard data (real DB queries)
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "MongoDB not configured" },
      { status: 503 }
    );
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "overview";

    if (view === "overview") {
      const [
        totalUsers,
        freeUsers,
        proUsers,
        enterpriseUsers,
        totalScans,
        recentScans,
        severityAgg,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ shieldxPlan: "free" }),
        User.countDocuments({ shieldxPlan: "pro" }),
        User.countDocuments({ shieldxPlan: "enterprise" }),
        ShieldXScan.countDocuments(),
        ShieldXScan.find()
          .sort({ createdAt: -1 })
          .limit(20)
          .select(
            "userId userEmail userName plan scanType title overallScore counts status createdAt"
          )
          .lean(),
        ShieldXScan.aggregate([
          {
            $group: {
              _id: null,
              critical: { $sum: "$counts.critical" },
              high: { $sum: "$counts.high" },
              medium: { $sum: "$counts.medium" },
              low: { $sum: "$counts.low" },
              avgScore: { $avg: "$overallScore" },
            },
          },
        ]),
      ]);

      const scansByType = await ShieldXScan.aggregate([
        { $group: { _id: "$scanType", count: { $sum: 1 } } },
      ]);

      const severity = severityAgg[0] || {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        avgScore: 0,
      };

      return NextResponse.json({
        overview: {
          totalUsers,
          freeUsers,
          proUsers,
          enterpriseUsers,
          totalScans,
          severity: {
            critical: severity.critical,
            high: severity.high,
            medium: severity.medium,
            low: severity.low,
          },
          avgScore: Math.round((severity.avgScore || 0) * 10) / 10,
          scansByType: Object.fromEntries(
            scansByType.map((s: { _id: string; count: number }) => [
              s._id,
              s.count,
            ])
          ),
          estimatedMRR: proUsers * 499 + enterpriseUsers * 999,
        },
        recentScans,
      });
    }

    if (view === "users") {
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(
        Math.max(1, parseInt(searchParams.get("limit") || "50")),
        100
      );
      const plan = searchParams.get("plan");
      const search = searchParams.get("search")?.trim();
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (plan && ["free", "pro", "enterprise"].includes(plan)) {
        filter.shieldxPlan = plan;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "name email role shieldxPlan shieldxPlanSource shieldxBillingStatus shieldxExpiry shieldxScanCount shieldxCancelAtPeriodEnd createdAt passwordResetRequired"
          )
          .lean(),
        User.countDocuments(filter),
      ]);

      // Fetch scan counts per user
      const userIds = users.map(
        (u: { _id: { toString: () => string } }) => u._id.toString()
      );
      const scanCounts = await ShieldXScan.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: "$userId",
            totalScans: { $sum: 1 },
            avgScore: { $avg: "$overallScore" },
            lastScan: { $max: "$createdAt" },
          },
        },
      ]);
      const scanMap = Object.fromEntries(
        scanCounts.map(
          (s: {
            _id: string;
            totalScans: number;
            avgScore: number;
            lastScan: Date;
          }) => [
            s._id,
            {
              totalScans: s.totalScans,
              avgScore: Math.round(s.avgScore * 10) / 10,
              lastScan: s.lastScan,
            },
          ]
        )
      );

      const enrichedUsers = users.map(
        (u: { _id: { toString: () => string } }) => ({
          ...u,
          scanStats: scanMap[u._id.toString()] || {
            totalScans: 0,
            avgScore: 0,
            lastScan: null,
          },
        })
      );

      return NextResponse.json({
        users: enrichedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    if (view === "scans") {
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(
        Math.max(1, parseInt(searchParams.get("limit") || "20")),
        50
      );
      const scanType = searchParams.get("scanType");
      const search = searchParams.get("search")?.trim();
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {};
      if (
        scanType &&
        ["secrets", "deps", "cloud", "api", "logs", "cicd", "score"].includes(
          scanType
        )
      ) {
        filter.scanType = scanType;
      }
      if (search) {
        filter.$or = [
          { userName: { $regex: search, $options: "i" } },
          { userEmail: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const [scans, total] = await Promise.all([
        ShieldXScan.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ShieldXScan.countDocuments(filter),
      ]);

      return NextResponse.json({
        scans,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (error) {
    console.error("Admin ShieldX API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
