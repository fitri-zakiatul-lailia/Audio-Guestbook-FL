"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

export const RECORDING_ENTRY_STORAGE_KEY = "voice-guestbook:entry-from-home";

export default function StartRecordingLink() {
  function markHomeEntry(event: MouseEvent<HTMLAnchorElement>) {
    const isStandardNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;

    if (!isStandardNavigation) return;

    try {
      sessionStorage.setItem(RECORDING_ENTRY_STORAGE_KEY, String(Date.now()));
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
  }

  return (
    <Link
      href="/rekam"
      onClick={markHomeEntry}
      className="focus-ring inline-flex w-full items-center justify-center gap-3 rounded-full bg-roseDark
                 px-7 py-4 font-body text-sm font-semibold text-white shadow-petal transition-all
                 duration-200 hover:-translate-y-0.5 hover:bg-ink hover:shadow-romantic sm:w-auto sm:px-9"
    >
      <MicIcon />
      Mulai Merekam Ucapan
    </Link>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
