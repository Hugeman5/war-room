import { NextResponse } from "next/server";
import { getAggregatedNews } from "@/intelligence/newsAggregator";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getAggregatedNews();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("[API/NEWS] Failed to fetch news:", error);
    return NextResponse.json(
        { error: "Failed to fetch news feed" },
        { status: 500 }
    );
  }
}
