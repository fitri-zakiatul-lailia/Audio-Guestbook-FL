import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "recordings/" });

    const recordings = blobs
      .map((b) => {
        const filename = b.pathname.split("/").pop() || "";
        const match = filename.match(/^(\d+)-(.+)\.webm$/);
        const timestamp = match ? parseInt(match[1], 10) : 0;
        const rawName = match ? match[2] : filename.replace(/\.webm$/, "");
        const name = rawName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          url: b.url,
          pathname: b.pathname,
          name,
          timestamp,
          uploadedAt: b.uploadedAt,
          size: b.size,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ recordings });
  } catch (err) {
    console.error("List error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar rekaman" },
      { status: 500 }
    );
  }
}
