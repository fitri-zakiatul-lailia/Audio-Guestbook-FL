"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const MAX_SECONDS = 60;

type RecState = "idle" | "recording" | "paused" | "preview" | "saving" | "saved";

export default function RekamPage() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isVisualizerSupported, setIsVisualizerSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopEverything();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== "recording" || !isVisualizerSupported) return;

    drawVisualizer();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // The visualizer is intentionally restarted only when its visible state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isVisualizerSupported]);

  function stopEverything() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
  }

  function drawVisualizer() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 29;
      const centerIndex = Math.floor(barCount / 2);
      const usableBins = Math.max(centerIndex + 1, Math.floor(bufferLength * 0.65));
      const step = Math.max(1, Math.floor(usableBins / (centerIndex + 1)));
      const barWidth = w / barCount - 3;

      for (let i = 0; i < barCount; i++) {
        const distanceFromCenter = Math.abs(i - centerIndex);
        const sampleIndex = Math.min(usableBins - 1, (distanceFromCenter + 1) * step);
        const value = dataArray[sampleIndex] || 0;
        const edgeFalloff = 1 - (distanceFromCenter / centerIndex) * 0.28;
        const barHeight = Math.max(3, (value / 255) * h * edgeFalloff);
        const x = i * (barWidth + 3);
        const y = h - barHeight;
        ctx.fillStyle = distanceFromCenter <= 1 ? "#F891BB" : "#B98196";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(render);
    };
    render();
  }

  async function handleStart() {
    if (!name.trim()) {
      setNameError("Nama tidak boleh kosong");
      return;
    }
    setNameError("");
    setUploadError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextConstructor =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      const canDrawRoundedBars =
        typeof CanvasRenderingContext2D !== "undefined" &&
        typeof CanvasRenderingContext2D.prototype.roundRect === "function";
      let visualizerReady = false;

      if (AudioContextConstructor && canDrawRoundedBars) {
        try {
          const audioCtx = new AudioContextConstructor();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          analyserRef.current = analyser;
          visualizerReady = true;
        } catch {
          audioCtxRef.current?.close().catch(() => {});
          audioCtxRef.current = null;
          analyserRef.current = null;
        }
      }

      setIsVisualizerSupported(visualizerReady);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioUrl(url);
        setState("preview");
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setElapsed(0);
      setState("recording");

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            handleStop();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      setUploadError("Tidak bisa mengakses mikrofon. Pastikan izin mikrofon diaktifkan.");
    }
  }

  function handlePause() {
    mediaRecorderRef.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState("paused");
  }

  function handleResume() {
    mediaRecorderRef.current?.resume();
    setState("recording");
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= MAX_SECONDS) {
          handleStop();
        }
        return next;
      });
    }, 1000);
  }

  function handleStop() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function handleUlangi() {
    // Discard current take and start a fresh recording right away.
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setIsPlaying(false);
    setElapsed(0);
    setState("idle");
    handleStart();
  }

  function handleHapus() {
    // Discard current take and return to the start screen.
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setIsPlaying(false);
    setElapsed(0);
    setState("idle");
  }

  function handleDengarkan() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  async function handleSimpanConfirmed() {
    setShowConfirm(false);
    setState("saving");
    setUploadError("");
    try {
      const blob = await fetch(audioUrl!).then((r) => r.blob());
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("audio", blob, "ucapan.webm");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("upload failed");

      setState("saved");
    } catch (err) {
      setUploadError("Gagal menyimpan rekaman. Periksa koneksi internet dan coba lagi.");
      setState("preview");
    }
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:px-8 sm:py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-full border border-rose/20
                     bg-porcelain/70 px-3.5 py-2 font-body text-xs font-medium text-roseDark/90
                     shadow-sm backdrop-blur-sm transition-colors hover:border-rose/40 hover:text-roseDark"
        >
          ← Kembali
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-rose/25 bg-porcelain/80
                            p-6 shadow-romantic backdrop-blur-sm sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-petal/10 blur-2xl" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose/50 to-transparent" />
          <div className="relative">
        {state === "saved" ? (
          <div className="py-8 text-center animate-fadeUp">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-roseDark shadow-petal">
              <CheckIcon />
            </div>
            <h2 className="mb-2 font-display text-3xl font-semibold text-roseDark">Terima kasih, {name}!</h2>
            <p className="font-display text-lg leading-7 text-ink/65">
              Terima kasih sudah menjadi bagian dari hari bahagia kami. Ucapanmu
              akan menjadi kenangan yang sangat berarti bagi Fariz &amp; Lia.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-2 font-body text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-roseDark/85">
              Audio guestbook
            </p>
            <h2 className="mb-1 font-display text-4xl font-semibold leading-none text-roseDark">
              Ucapan <span className="font-normal italic text-rose">untukmu</span>
            </h2>
            <p className="mb-8 font-display text-lg leading-7 text-ink/65">
              Fariz &amp; Lia akan mendengarkan setiap kata darimu.
            </p>

            {state === "idle" && (
              <div className="mb-7">
                <label className="mb-2 block font-body text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
                  Nama kamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="Tulis namamu di sini"
                  className="focus-ring w-full rounded-xl border border-mauve/70 bg-white/75 px-4 py-3.5
                             font-body text-sm text-ink shadow-sm outline-none transition-colors
                             placeholder:text-muted/45 hover:border-rose/50 focus:border-rose"
                />
                {nameError && <p className="text-red-600 text-xs mt-2 font-body">{nameError}</p>}
              </div>
            )}

            {(state === "idle") && (
              <button
                onClick={handleStart}
                className="focus-ring flex w-full items-center justify-center gap-3 rounded-xl bg-roseDark
                           px-6 py-4 font-body text-sm font-semibold text-white shadow-petal
                           transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-romantic"
              >
                <MicIcon /> Mulai Merekam
              </button>
            )}

            {(state === "recording" || state === "paused") && (
              <div className="animate-fadeUp">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-sm text-muted">
                    {state === "recording" ? "Sedang merekam…" : "Dijeda"}
                  </span>
                  <span className="font-display text-xl font-semibold text-roseDark tabular-nums">
                    {mm}:{ss} <span className="text-sm text-muted">/ 01:00</span>
                  </span>
                </div>

                <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-rose/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose to-petal transition-all duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                {isVisualizerSupported && (
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={80}
                    className="mb-6 h-20 w-full rounded-xl border border-rose/10 bg-blush/70"
                  />
                )}

                <div className="flex gap-3">
                  {state === "recording" ? (
                    <button
                      onClick={handlePause}
                      className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-3 font-body
                                 text-sm font-semibold text-roseDark transition-colors hover:bg-rose/5"
                    >
                      Jeda
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-3 font-body
                                 text-sm font-semibold text-roseDark transition-colors hover:bg-rose/5"
                    >
                      Lanjutkan
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="focus-ring flex-1 rounded-xl bg-roseDark px-4 py-3 font-body text-sm
                               font-semibold text-white transition-colors hover:bg-ink"
                  >
                    Berhenti
                  </button>
                </div>
              </div>
            )}

            {(state === "preview" || state === "saving") && audioUrl && (
              <div className="animate-fadeUp">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                <div className="mb-6 flex items-center gap-4 rounded-2xl border border-rose/15 bg-blush/70 p-5 shadow-sm">
                  <button
                    onClick={handleDengarkan}
                    disabled={state === "saving"}
                    className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                               bg-roseDark text-white shadow-petal transition-colors hover:bg-ink disabled:opacity-50"
                    aria-label={isPlaying ? "Jeda pemutaran" : "Dengarkan rekaman"}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <div>
                    <p className="font-body text-sm text-ink/80">Rekaman siap didengarkan</p>
                    <p className="font-body text-xs text-muted">
                      Durasi {mm}:{ss}
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-red-600 text-sm font-body mb-4">{uploadError}</p>
                )}

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={handleUlangi}
                    disabled={state === "saving"}
                    className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-3 font-body
                               text-sm font-semibold text-roseDark transition-colors hover:bg-rose/5 disabled:opacity-50"
                  >
                    Ulangi
                  </button>
                  <button
                    onClick={handleHapus}
                    disabled={state === "saving"}
                    className="focus-ring flex-1 border border-red-300 text-red-500 font-body font-medium
                               px-4 py-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={state === "saving"}
                  className="focus-ring w-full rounded-xl bg-roseDark px-6 py-4 font-body text-sm font-semibold
                             text-white shadow-petal transition-all hover:-translate-y-0.5 hover:bg-ink
                             disabled:translate-y-0 disabled:opacity-60"
                >
                  {state === "saving" ? "Menyimpan…" : "Simpan Ucapan"}
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </section>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/35 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-rose/20 bg-porcelain p-6 shadow-2xl animate-fadeUp">
            <h3 className="mb-3 font-display text-3xl font-semibold text-roseDark">Kirim ucapan ini?</h3>
            <p className="mb-6 font-display text-lg leading-7 text-ink/75">
              Setelah disimpan, rekaman akan terkirim secara permanen dan tidak dapat
              dihapus lagi. Pastikan kamu sudah mendengarkan hasilnya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="focus-ring flex-1 rounded-xl border border-rose/35 px-4 py-3 font-body
                           text-sm font-semibold text-roseDark transition-colors hover:bg-rose/5"
              >
                Batal
              </button>
              <button
                onClick={handleSimpanConfirmed}
                className="focus-ring flex-1 rounded-xl bg-roseDark px-4 py-3 font-body text-sm
                           font-semibold text-white transition-colors hover:bg-ink"
              >
                Ya, Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF5FB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
