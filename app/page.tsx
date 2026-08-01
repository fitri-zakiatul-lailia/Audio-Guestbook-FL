import Link from "next/link";
import { Vidaloka } from "next/font/google";

const vidaloka = Vidaloka({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function HomePage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-12 text-center sm:px-8 sm:py-16">
      <div className="relative w-full max-w-[22rem] animate-fadeUp sm:max-w-md">
        <p className="mb-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-roseDark/85 sm:mb-8">
          The Wedding of
        </p>

        <h1 className={`${vidaloka.className} mb-3 whitespace-nowrap text-[3rem] font-normal leading-none tracking-[-0.045em] text-roseDark sm:text-6xl`}>
          Fariz <span className="px-1 text-petal">&amp;</span> Lia
        </h1>

        <NameDivider />

        <p className="mx-7 mb-10 max-w-[21rem] font-display font-medium leading-1 text-ink/70 sm:mb-11 sm:max-w-sm sm:text-[1.4rem] sm:leading-9">
          Titipkan suara dan doa terbaikmu untuk hari bahagia kami. Rekamanmu
          akan menjadi kenangan yang kami dengarkan bertahun-tahun ke depan.
        </p>

        <Link
          href="/rekam"
          className="focus-ring inline-flex w-full items-center justify-center gap-3 rounded-full bg-roseDark
                     px-7 py-4 font-body text-sm font-semibold text-white shadow-petal transition-all
                     duration-200 hover:-translate-y-0.5 hover:bg-ink hover:shadow-romantic sm:w-auto sm:px-9"
        >
          <MicIcon />
          Mulai Merekam Ucapan
        </Link>

        <p className="mt-7 font-body text-[0.72rem] text-muted sm:mt-8">
          #digaRIZkanuntukLIA
        </p>
      </div>
    </main>
  );
}

function NameDivider() {
  return (
    <div className="mb-5 flex justify-center text-rose/70 sm:mb-8" aria-hidden="true">
      <svg viewBox="0 0 180 18" className="h-[18px] w-[9.5rem] sm:w-[11rem]" fill="none">
        <path d="M3 9H72" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <circle cx="78" cy="9" r="1.25" fill="currentColor" />
        <path d="M90 3.5 95.5 9 90 14.5 84.5 9 90 3.5Z" stroke="currentColor" strokeWidth="1" />
        <circle cx="102" cy="9" r="1.25" fill="currentColor" />
        <path d="M108 9H177" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
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
