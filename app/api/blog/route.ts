import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

// GET /api/blog — list published blog posts (public) or user's own posts (authenticated)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const myPosts = searchParams.get("my") === "true";

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (myPosts) {
      // User wants their own posts
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query["author.userId"] = (session.user as { id?: string }).id;
      if (status !== "all") query.status = status;
    } else {
      // Public — only published posts
      query.status = "published";
    }

    if (category) query.category = category;

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST /api/blog — create a new blog post (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { title, content, excerpt, category, tags } = body;

    if (!title || !content || !excerpt || !category) {
      return NextResponse.json(
        { error: "Title, content, excerpt, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for duplicate slugs
    let slug = baseSlug;
    let counter = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const user = session.user as { id?: string; name?: string; email?: string; role?: string };
    const isAdmin = user.role === "admin";

    const post = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      author: {
        userId: user.id,
        name: user.name || "Anonymous",
        email: user.email || "",
      },
      status: isAdmin ? "published" : "pending",
      publishedAt: isAdmin ? new Date() : null,
    });

    return NextResponse.json(
      {
        message: isAdmin
          ? "Post published successfully"
          : "Post submitted for review. An admin will review it shortly.",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Blog POST error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
