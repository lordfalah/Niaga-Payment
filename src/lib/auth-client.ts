import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { auth } from "./auth";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

export const { signIn, signUp, signOut, useSession, revokeSessions, admin } =
  createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
      inferAdditionalFields<typeof auth>(),
      nextCookies(),
      adminClient({
        ac,
        roles,
      }),
    ],
  });
