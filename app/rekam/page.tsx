"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MAX_SECONDS = 60;

type RecState = "idle" | "recording" | "paused" | "preview" | "saving" | "saved";

export default function RekamPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadError, setUploadError] = useState("");

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

      const barCount = 28;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = w / barCount - 3;

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step] || 0;
        const barHeight = Math.max(3, (value / 255) * h);
        const x = i * (barWidth + 3);
        const y = h - barHeight;
        ctx.fillStyle = i % 7 === 3 ? "#C9A227" : "#1F3A2E";
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

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

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
      drawVisualizer();

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
    drawVisualizer();
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
      setTimeout(() => router.push("/"), 1800);
    } catch (err) {
      setUploadError("Gagal menyimpan rekaman. Periksa koneksi internet dan coba lagi.");
      setState("preview");
    }
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const progress = Math.min(elapsed / MAX_SECONDS, 1);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="focus-ring text-xs text-pine/60 hover:text-pine font-body inline-flex items-center gap-1 mb-8"
        >
          ← Kembali
        </Link>

        {state === "saved" ? (
          <div className="text-center animate-fadeUp">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pine flex items-center justify-center">
              <CheckIcon />
            </div>
            <h2 className="font-display text-2xl text-pine mb-2">Terima kasih, {name}!</h2>
            <p className="text-ink/60 font-body text-sm">
              Ucapanmu sudah tersimpan. Mengalihkan ke halaman utama…
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-display italic text-3xl text-pine mb-1">Ucapan untukmu</h2>
            <p className="text-ink/60 font-body text-sm mb-8">
              Fariz &amp; Lia akan mendengarkan setiap kata darimu.
            </p>

            {state === "idle" && (
              <div className="mb-8">
                <label className="block text-xs uppercase tracking-wide text-ink/50 font-body mb-2">
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
                  className="focus-ring w-full rounded-xl border border-pine/20 bg-white/60 px-4 py-3
                             font-body text-ink placeholder:text-ink/30 outline-none"
                />
                {nameError && <p className="text-red-600 text-xs mt-2 font-body">{nameError}</p>}
              </div>
            )}

            {(state === "idle") && (
              <button
                onClick={handleStart}
                className="focus-ring w-full flex items-center justify-center gap-3 bg-pine text-ivory
                           font-body font-medium px-6 py-4 rounded-full shadow-lg shadow-pine/20
                           transition-transform hover:scale-[1.02] hover:bg-pineDark"
              >
                <MicIcon /> Mulai Merekam
              </button>
            )}

            {(state === "recording" || state === "paused") && (
              <div className="animate-fadeUp">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-sm text-ink/60">
                    {state === "recording" ? "Sedang merekam…" : "Dijeda"}
                  </span>
                  <span className="font-display text-lg text-pine tabular-nums">
                    {mm}:{ss} <span className="text-ink/40 text-sm">/ 01:00</span>
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-pine/10 mb-6 overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <canvas
                  ref={canvasRef}
                  width={400}
                  height={80}
                  className="w-full h-20 mb-6 rounded-xl bg-white/50"
                />

                <div className="flex gap-3">
                  {state === "recording" ? (
                    <button
                      onClick={handlePause}
                      className="focus-ring flex-1 border border-pine/30 text-pine font-body font-medium
                                 px-4 py-3 rounded-full hover:bg-pine/5 transition-colors"
                    >
                      Jeda
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="focus-ring flex-1 border border-pine/30 text-pine font-body font-medium
                                 px-4 py-3 rounded-full hover:bg-pine/5 transition-colors"
                    >
                      Lanjutkan
                    </button>
                  )}
                  <button
                    onClick={handleStop}
                    className="focus-ring flex-1 bg-pine text-ivory font-body font-medium
                               px-4 py-3 rounded-full hover:bg-pineDark transition-colors"
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

                <div className="rounded-xl bg-white/60 border border-pine/10 p-5 mb-6 flex items-center gap-4">
                  <button
                    onClick={handleDengarkan}
                    disabled={state === "saving"}
                    className="focus-ring w-12 h-12 shrink-0 rounded-full bg-pine text-ivory flex items-center
                               justify-center hover:bg-pineDark transition-colors disabled:opacity-50"
                    aria-label={isPlaying ? "Jeda pemutaran" : "Dengarkan rekaman"}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <div>
                    <p className="font-body text-sm text-ink/80">Rekaman siap didengarkan</p>
                    <p className="font-body text-xs text-ink/50">
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
                    className="focus-ring flex-1 border border-pine/30 text-pine font-body font-medium
                               px-4 py-3 rounded-full hover:bg-pine/5 transition-colors disabled:opacity-50"
                  >
                    Ulangi
                  </button>
                  <button
                    onClick={handleHapus}
                    disabled={state === "saving"}
                    className="focus-ring flex-1 border border-red-300 text-red-500 font-body font-medium
                               px-4 py-3 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={state === "saving"}
                  className="focus-ring w-full bg-gold text-ink font-body font-semibold px-6 py-4 rounded-full
                             shadow-lg shadow-gold/20 transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {state === "saving" ? "Menyimpan…" : "Simpan Ucapan"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 px-6">
          <div className="bg-ivory rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeUp">
            <h3 className="font-display text-xl text-pine mb-3">Kirim ucapan ini?</h3>
            <p className="font-body text-sm text-ink/70 mb-6 leading-relaxed">
              Setelah disimpan, rekaman akan terkirim secara permanen dan tidak dapat
              dihapus lagi. Pastikan kamu sudah mendengarkan hasilnya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="focus-ring flex-1 border border-pine/30 text-pine font-body font-medium
                           px-4 py-3 rounded-full hover:bg-pine/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSimpanConfirmed}
                className="focus-ring flex-1 bg-pine text-ivory font-body font-medium
                           px-4 py-3 rounded-full hover:bg-pineDark transition-colors"
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAF6EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
