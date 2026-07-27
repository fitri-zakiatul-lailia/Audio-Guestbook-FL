import Link from "next/link";
import WaveformFlourish from "@/components/WaveformFlourish";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="animate-fadeUp max-w-md">
        <p className="uppercase tracking-[0.3em] text-xs text-pine/70 font-body font-medium mb-6">
          Welcome to
        </p>

        <h1 className="font-display italic text-5xl sm:text-6xl text-pine leading-tight">
          Fariz <span className="text-gold not-italic">&amp;</span> Lia
        </h1>

        <div className="flex justify-center my-8">
          <WaveformFlourish className="w-64 sm:w-80" />
        </div>

        <p className="font-body text-ink/70 text-base sm:text-lg leading-relaxed mb-10">
          Titipkan suara dan doa terbaikmu untuk hari bahagia kami.
          Rekamanmu akan menjadi kenangan yang kami dengarkan bertahun-tahun
          ke depan.
        </p>

        <Link
          href="/rekam"
          className="focus-ring inline-flex items-center gap-3 bg-pine text-ivory font-body font-medium
                     px-8 py-4 rounded-full shadow-lg shadow-pine/20
                     transition-transform duration-200 hover:scale-[1.03] hover:bg-pineDark"
        >
          <MicIcon />
          Mulai Merekam Ucapan
        </Link>

        <p className="mt-6 text-xs text-ink/50 font-body">
          Rekaman berdurasi maksimal 60 detik
        </p>
      </div>
    </main>
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
