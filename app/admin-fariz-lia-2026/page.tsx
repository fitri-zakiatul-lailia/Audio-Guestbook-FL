"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";

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
  const [recordingToDelete, setRecordingToDelete] = useState<Recording | null>(null);
  const [deletingPathname, setDeletingPathname] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const adminHeadingRef = useRef<HTMLHeadingElement | null>(null);

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

  function openDeleteConfirmation(recording: Recording, trigger: HTMLButtonElement) {
    setDeleteError("");
    deleteTriggerRef.current = trigger;
    setRecordingToDelete(recording);
  }

  function closeDeleteConfirmation() {
    setDeleteError("");
    setRecordingToDelete(null);
    requestAnimationFrame(() => deleteTriggerRef.current?.focus());
  }

  function handleDeleteDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && deletingPathname === null) {
      event.preventDefault();
      closeDeleteConfirmation();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled])")
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  async function handleDeleteConfirmed() {
    if (!recordingToDelete) return;

    const target = recordingToDelete;
    setDeletingPathname(target.pathname);
    setDeleteError("");

    try {
      const res = await fetch("/api/recordings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathname: target.pathname }),
      });

      if (!res.ok) throw new Error("delete failed");

      setRecordings((current) =>
        current.filter((recording) => recording.pathname !== target.pathname)
      );
      setRecordingToDelete(null);
      requestAnimationFrame(() => adminHeadingRef.current?.focus());
    } catch {
      setDeleteError("Rekaman gagal dihapus. Silakan coba lagi.");
    } finally {
      setDeletingPathname(null);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="relative mb-7 overflow-hidden rounded-[2rem] border border-rose/25 bg-porcelain/80
                           px-6 py-7 shadow-romantic backdrop-blur-sm sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-8 -top-14 h-40 w-40 rounded-full bg-petal/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-body text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-roseDark/85">
                Koleksi privat Fariz &amp; Lia
              </p>
              <h1
                ref={adminHeadingRef}
                tabIndex={-1}
                className="font-display text-4xl font-semibold leading-none text-roseDark outline-none sm:text-5xl"
              >
                Ucapan <span className="font-normal italic text-rose">Tamu</span>
              </h1>
              <p className="mt-3 font-display text-lg text-ink/65">
                {loading ? "Memuat rekaman…" : `${recordings.length} rekaman tersimpan`}
              </p>
            </div>

            <button
              onClick={fetchRecordings}
              className="focus-ring inline-flex w-fit items-center rounded-xl border border-rose/35 bg-white/60
                         px-4 py-2.5 font-body text-xs font-semibold text-roseDark transition-colors
                         hover:border-rose/60 hover:bg-blush"
            >
              Muat ulang
            </button>
          </div>
        </header>

        {error && (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 font-body text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && recordings.length === 0 && !error && (
          <div className="rounded-[1.75rem] border border-dashed border-rose/35 bg-porcelain/65 px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blush text-roseDark">
              <SoundIcon />
            </div>
            <h2 className="mb-2 font-display text-2xl font-semibold text-roseDark">Belum ada rekaman</h2>
            <p className="mx-auto max-w-md font-display text-lg leading-7 text-ink/65">
              Rekaman tamu akan muncul di sini secara otomatis setelah dikirim.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {recordings.map((r) => (
            <article
              key={r.pathname}
              className="flex flex-col gap-4 rounded-2xl border border-rose/15 bg-porcelain/80 p-4
                         shadow-sm backdrop-blur-sm transition-colors hover:border-rose/30
                         sm:flex-row sm:items-center sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-2xl font-semibold text-roseDark">{r.name}</p>
                <p className="font-body text-xs text-muted">
                  {formatDate(r.uploadedAt || r.timestamp)} · {formatSize(r.size)}
                </p>
              </div>
              <audio controls src={r.url} className="h-10 w-full sm:w-64" />
              <div className="flex shrink-0 gap-2">
                <a
                  href={r.url}
                  download
                  className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-2.5 text-center
                             font-body text-xs font-semibold text-roseDark transition-colors hover:bg-rose/5"
                >
                  Unduh
                </a>
                <button
                  type="button"
                  onClick={(event) => openDeleteConfirmation(r, event.currentTarget)}
                  disabled={deletingPathname === r.pathname}
                  className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl
                             border border-red-200 px-4 py-2.5 font-body text-xs font-semibold text-red-600
                             transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Hapus rekaman ${r.name}`}
                >
                  <TrashIcon />
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {recordingToDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/35 px-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-recording-title"
            aria-describedby="delete-recording-description"
            onKeyDown={handleDeleteDialogKeyDown}
            className="w-full max-w-sm rounded-[1.75rem] border border-rose/20 bg-porcelain p-6 shadow-romantic"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TrashIcon size={21} />
            </div>
            <h2
              id="delete-recording-title"
              className="mb-2 font-display text-3xl font-semibold text-roseDark"
            >
              Hapus rekaman?
            </h2>
            <p id="delete-recording-description" className="font-display text-lg leading-7 text-ink/70">
              Rekaman dari <strong className="font-semibold">{recordingToDelete.name}</strong>{" "}
              akan dihapus secara permanen dan tidak dapat dipulihkan.
            </p>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-700" role="alert">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirmation}
                disabled={deletingPathname !== null}
                autoFocus
                className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-3 font-body
                           text-sm font-semibold text-roseDark transition-colors hover:bg-rose/5
                           disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={deletingPathname !== null}
                className="focus-ring flex-1 rounded-xl bg-red-600 px-4 py-3 font-body text-sm
                           font-semibold text-white transition-colors hover:bg-red-700
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingPathname ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TrashIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function SoundIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10v4" />
      <path d="M7 7v10" />
      <path d="M11 4v16" />
      <path d="M15 7v10" />
      <path d="M19 10v4" />
    </svg>
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
