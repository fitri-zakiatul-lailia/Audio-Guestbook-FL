import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;
    const rawName = (formData.get("name") as string | null)?.trim();

    if (!file || !rawName) {
      return NextResponse.json(
        { error: "Nama dan rekaman wajib diisi" },
        { status: 400 }
      );
    }

    // Keep the guest's name in the filename (URL-safe) so the admin
    // page can display it without needing a database.
    const safeName =
      rawName
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") || "tamu";

    const timestamp = Date.now();
    const filename = `recordings/${timestamp}-${safeName}.webm`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type || "audio/webm",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan rekaman" },
      { status: 500 }
    );
  }
}
