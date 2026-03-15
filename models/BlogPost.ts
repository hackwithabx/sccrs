import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Web Security",
        "API Security",
        "Cloud Security",
        "DevSecOps",
        "Mobile Security",
        "Network Security",
        "Application Security",
        "Threat Intelligence",
        "Compliance",
        "Secure Coding",
        "Penetration Testing",
        "Vulnerability Research",
        "AI Security",
        "Supply Chain Security",
        "Zero Trust",
        "Other",
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate read time before saving
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BlogPostSchema as any).pre("save", function (this: any, next: any) {
  if (this.isModified("content")) {
    const words = this.content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    this.readTime = `${minutes} min read`;
  }
  next();
});

// Index for efficient queries
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ "author.userId": 1, status: 1 });
BlogPostSchema.index({ category: 1, status: 1 });
BlogPostSchema.index({ tags: 1 });

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
