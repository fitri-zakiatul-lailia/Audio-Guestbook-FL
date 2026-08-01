import { del, list } from "@vercel/blob";
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

export async function DELETE(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data permintaan tidak valid" },
      { status: 400 }
    );
  }

  try {
    const pathname =
      typeof body === "object" && body !== null && "pathname" in body
        ? (body as { pathname?: unknown }).pathname
        : undefined;

    if (
      typeof pathname !== "string" ||
      !/^recordings\/\d+-[a-z0-9-]+\.webm$/.test(pathname)
    ) {
      return NextResponse.json(
        { error: "Path rekaman tidak valid" },
        { status: 400 }
      );
    }

    const { blobs } = await list({ prefix: pathname, limit: 2 });
    const recording = blobs.find((blob) => blob.pathname === pathname);

    if (!recording) {
      return NextResponse.json(
        { error: "Rekaman tidak ditemukan" },
        { status: 404 }
      );
    }

    await del(recording.url);

    return NextResponse.json({ deleted: true, pathname });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus rekaman" },
      { status: 500 }
    );
  }
}
