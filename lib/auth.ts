import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit } from "@/lib/rate-limit";
import { getEffectiveShieldXPlan, type ShieldXPlan, type ShieldXPlanSource } from "@/lib/shieldx-access";

const ADMIN_EMAILS = [
  "scr@securecodereviews.com",
  "support@securecodereviews.com",
  process.env.ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean) as string[];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Rate limit login attempts by email
        const rateLimitResult = await rateLimit(`login:${credentials.email.toLowerCase()}`, {
          maxRequests: 5,
          windowSeconds: 900,
        });

        if (!rateLimitResult.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        await dbConnect();

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select(
          "+password email name role shieldxPlan shieldxPlanSource shieldxExpiry shieldxBillingProvider shieldxBillingStatus shieldxCancelAtPeriodEnd shieldxSeatRole shieldxTeamOwnerId"
          + " passwordResetRequired"
        );

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Auto-promote configured admin emails
        const isAdminEmail = ADMIN_EMAILS.includes(user.email.toLowerCase());
        if (isAdminEmail && (user.role !== "admin" || user.shieldxPlan !== "enterprise")) {
          await User.findByIdAndUpdate(user._id, {
            role: "admin",
            shieldxPlan: "enterprise",
            shieldxPlanSource: "admin",
          });
          user.role = "admin";
          user.shieldxPlan = "enterprise";
          user.shieldxPlanSource = "admin";
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          shieldxPlan: getEffectiveShieldXPlan(user),
          shieldxPlanSource: (user.shieldxPlanSource || "free") as ShieldXPlanSource,
          shieldxBillingProvider: user.shieldxBillingProvider || null,
          shieldxBillingStatus: user.shieldxBillingStatus || "inactive",
          shieldxExpiry: user.shieldxExpiry || null,
          shieldxCancelAtPeriodEnd: Boolean(user.shieldxCancelAtPeriodEnd),
          shieldxSeatRole: user.shieldxSeatRole || null,
          shieldxTeamOwnerId: user.shieldxTeamOwnerId || null,
          passwordResetRequired: Boolean(user.passwordResetRequired),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || "user";
        token.id = user.id;
        token.shieldxPlan = ((user as { shieldxPlan?: ShieldXPlan }).shieldxPlan ||
          "free") as ShieldXPlan;
        token.shieldxPlanSource = (
          (user as { shieldxPlanSource?: ShieldXPlanSource }).shieldxPlanSource ||
          "free"
        ) as ShieldXPlanSource;
        token.shieldxBillingProvider =
          (user as { shieldxBillingProvider?: string | null }).shieldxBillingProvider ||
          null;
        token.shieldxBillingStatus =
          (user as { shieldxBillingStatus?: string }).shieldxBillingStatus ||
          "inactive";
        token.shieldxExpiry =
          (user as { shieldxExpiry?: Date | string | null }).shieldxExpiry || null;
        token.shieldxCancelAtPeriodEnd = Boolean(
          (user as { shieldxCancelAtPeriodEnd?: boolean }).shieldxCancelAtPeriodEnd
        );
        token.shieldxSeatRole =
          (user as { shieldxSeatRole?: string | null }).shieldxSeatRole || null;
        token.shieldxTeamOwnerId =
          (user as { shieldxTeamOwnerId?: string | null }).shieldxTeamOwnerId || null;
        token.passwordResetRequired = Boolean(
          (user as { passwordResetRequired?: boolean }).passwordResetRequired
        );
        return token;
      }

      if (token.id) {
        try {
          await dbConnect();
          const latestUser = (await User.findById(token.id)
            .select(
              "role shieldxPlan shieldxPlanSource shieldxExpiry shieldxBillingProvider shieldxBillingStatus shieldxCancelAtPeriodEnd shieldxSeatRole shieldxTeamOwnerId"
              + " passwordResetRequired"
            )
            .lean()) as {
            role?: string;
            shieldxPlan?: ShieldXPlan;
            shieldxPlanSource?: ShieldXPlanSource;
            shieldxExpiry?: Date | string | null;
            shieldxBillingProvider?: string | null;
            shieldxBillingStatus?: string;
            shieldxCancelAtPeriodEnd?: boolean;
            shieldxSeatRole?: string | null;
            shieldxTeamOwnerId?: string | null;
            passwordResetRequired?: boolean;
          } | null;

          if (latestUser) {
            token.role = latestUser.role || "user";
            token.shieldxPlan = getEffectiveShieldXPlan(latestUser);
            token.shieldxPlanSource = latestUser.shieldxPlanSource || "free";
            token.shieldxBillingProvider = latestUser.shieldxBillingProvider || null;
            token.shieldxBillingStatus =
              latestUser.shieldxBillingStatus || "inactive";
            token.shieldxExpiry = latestUser.shieldxExpiry || null;
            token.shieldxCancelAtPeriodEnd = Boolean(
              latestUser.shieldxCancelAtPeriodEnd
            );
            token.shieldxSeatRole = latestUser.shieldxSeatRole || null;
            token.shieldxTeamOwnerId = latestUser.shieldxTeamOwnerId || null;
            token.passwordResetRequired = Boolean(
              latestUser.passwordResetRequired
            );
          }
        } catch (error) {
          console.error("Failed to refresh session claims:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { shieldxPlan?: string }).shieldxPlan =
          token.shieldxPlan as string;
        (session.user as { shieldxPlanSource?: string }).shieldxPlanSource =
          token.shieldxPlanSource as string;
        (session.user as { shieldxBillingProvider?: string | null }).shieldxBillingProvider =
          (token.shieldxBillingProvider as string | null) || null;
        (session.user as { shieldxBillingStatus?: string }).shieldxBillingStatus =
          token.shieldxBillingStatus as string;
        (session.user as { shieldxExpiry?: string | null }).shieldxExpiry =
          token.shieldxExpiry
            ? new Date(token.shieldxExpiry as string | number | Date).toISOString()
            : null;
        (session.user as { shieldxCancelAtPeriodEnd?: boolean }).shieldxCancelAtPeriodEnd =
          Boolean(token.shieldxCancelAtPeriodEnd);
        (session.user as { shieldxSeatRole?: string | null }).shieldxSeatRole =
          (token.shieldxSeatRole as string | null) || null;
        (session.user as { shieldxTeamOwnerId?: string | null }).shieldxTeamOwnerId =
          (token.shieldxTeamOwnerId as string | null) || null;
        (session.user as { passwordResetRequired?: boolean }).passwordResetRequired =
          Boolean(token.passwordResetRequired);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
