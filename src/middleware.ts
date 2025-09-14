import { NextRequest, NextResponse } from "next/server";
import { TRole } from "./generated/prisma";
import { getServerSession } from "./lib/get-session";

export async function middleware(request: NextRequest) {
  const session = await getServerSession();

  if (!session || session.user.role === TRole.USER) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: "/dashboard/:path*",
};
