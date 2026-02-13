import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "health check passed",
    success: true,
    status: 200
  }, { status: 200 });
}