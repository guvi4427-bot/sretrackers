import { NextResponse } from "next/server";
import { seed } from "@/lib/seed";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }
  try {
    await seed();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully"
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { success: false, error: "Seeding failed" },
      { status: 500 }
    );
  }
}
