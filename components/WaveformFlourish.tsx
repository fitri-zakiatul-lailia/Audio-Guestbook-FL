// Decorative signature element: a voice-waveform rendered as an
// ornamental flourish, echoing the site's purpose (recorded voices)
// in the visual language of a wedding invitation.
export default function WaveformFlourish({ className = "" }: { className?: string }) {
  // Bar heights hand-tuned to read as a calm, symmetrical waveform
  // rather than a literal audio-app widget.
  const heights = [4, 7, 11, 16, 10, 22, 14, 28, 18, 34, 40, 34, 18, 28, 14, 22, 10, 16, 11, 7, 4];
  const width = 320;
  const height = 48;
  const gap = width / heights.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      {heights.map((h, i) => {
        const x = i * gap + gap / 2;
        const isCenter = i === Math.floor(heights.length / 2);
        return (
          <rect
            key={i}
            x={x - 1.5}
            y={height / 2 - h / 2}
            width={3}
            height={h}
            rx={1.5}
            fill={isCenter ? "#C9A227" : "#1F3A2E"}
            opacity={isCenter ? 1 : 0.55 - Math.abs(i - heights.length / 2) * 0.015}
          />
        );
      })}
    </svg>
  );
}
