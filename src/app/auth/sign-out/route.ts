import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  return NextResponse.redirect(new URL("/login", env.NEXT_PUBLIC_SITE_URL));
}
