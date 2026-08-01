import { Vidaloka } from "next/font/google";
import StartRecordingLink from "@/components/StartRecordingLink";

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
          Satu ucapan darimu akan menjadi kenangan yang tak ternilai bagi kami. Rekam doa dan harapan terbaikmu untuk menemani perjalanan baru Fariz & Lia.
        </p>

        <StartRecordingLink />

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
