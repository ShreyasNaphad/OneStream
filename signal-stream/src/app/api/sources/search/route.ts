import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/sourceCatalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const exclude = searchParams.get("exclude") || "";
  
  const excludeIds = exclude ? exclude.split(",") : [];
  const results = searchCatalog(query, excludeIds);

  return NextResponse.json({ sources: results });
}
