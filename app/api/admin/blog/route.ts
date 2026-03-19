import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

// GET /api/admin/blog — list all blog posts with any status (admin only)
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    const validStatuses = ["draft", "published", "pending", "rejected", "featured", "unpublished"];
    if (status !== "all" && validStatuses.includes(status)) query.status = status;

    const [posts, total, pending] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
      BlogPost.countDocuments({ status: "pending" }),
    ]);

    return NextResponse.json({
      posts,
      total,
      pending,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin blog GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/blog — approve, reject, or feature a blog post
export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { postId, action, reason } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: "postId and action are required" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    switch (action) {
      case "approve":
        post.status = "published";
        post.publishedAt = new Date();
        post.rejectionReason = "";
        break;
      case "reject":
        post.status = "rejected";
        post.rejectionReason = reason || "Does not meet our content guidelines.";
        break;
      case "unpublish":
        post.status = "draft";
        break;
      case "feature":
        post.featured = !post.featured;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: approve, reject, unpublish, feature" },
          { status: 400 }
        );
    }

    await post.save();

    return NextResponse.json({
      message: `Post ${action}${action.endsWith("e") ? "d" : "ed"} successfully`,
      post,
    });
  } catch (error) {
    console.error("Admin blog PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog — delete a blog post
export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const post = await BlogPost.findByIdAndDelete(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Admin blog DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
