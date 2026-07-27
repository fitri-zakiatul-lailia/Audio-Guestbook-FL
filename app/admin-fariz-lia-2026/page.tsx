"use client";

import { useEffect, useState } from "react";

type Recording = {
  url: string;
  pathname: string;
  name: string;
  timestamp: number;
  uploadedAt: string;
  size: number;
};

export default function AdminPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecordings();
  }, []);

  async function fetchRecordings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recordings", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setRecordings(data.recordings || []);
    } catch {
      setError("Gagal memuat daftar rekaman. Coba muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-display italic text-3xl text-pine">Ucapan Tamu</h1>
        <button
          onClick={fetchRecordings}
          className="focus-ring text-xs text-pine/60 hover:text-pine font-body underline"
        >
          Muat ulang
        </button>
      </div>
      <p className="font-body text-sm text-ink/50 mb-8">
        {loading ? "Memuat…" : `${recordings.length} rekaman tersimpan`}
      </p>

      {error && <p className="text-red-600 font-body text-sm mb-6">{error}</p>}

      {!loading && recordings.length === 0 && !error && (
        <p className="font-body text-sm text-ink/50">
          Belum ada rekaman masuk. Rekaman tamu akan muncul di sini secara otomatis.
        </p>
      )}

      <div className="space-y-3">
        {recordings.map((r) => (
          <div
            key={r.pathname}
            className="rounded-xl bg-white/60 border border-pine/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg text-pine truncate">{r.name}</p>
              <p className="font-body text-xs text-ink/50">
                {formatDate(r.uploadedAt || r.timestamp)} · {formatSize(r.size)}
              </p>
            </div>
            <audio controls src={r.url} className="w-full sm:w-64 h-10" />
            <a
              href={r.url}
              download
              className="focus-ring shrink-0 text-xs font-body font-medium text-pine border border-pine/30
                         px-4 py-2 rounded-full hover:bg-pine/5 transition-colors text-center"
            >
              Unduh
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}

function formatDate(value: string | number) {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
