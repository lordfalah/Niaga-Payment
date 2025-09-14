import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { TRole } from "@/generated/prisma";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      firstName: {
        type: "string",
        input: false,
      },
      lastName: {
        type: "string",
        input: false,
      },
    },
  },

  plugins: [
    nextCookies(),
    admin({
      defaultRole: TRole.USER,
      adminRoles: [TRole.AUTHOR, TRole.SUPERADMIN],
      ac,
      roles,
    }),
  ],
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
