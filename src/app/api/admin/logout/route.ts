import { NextResponse } from "next/server";
import { getAdminCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set({
    ...getAdminCookieOptions(0),
    value: "",
  });
  return response;
}

