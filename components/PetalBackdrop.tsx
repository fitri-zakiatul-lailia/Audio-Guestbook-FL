import Image from "next/image";

export default function PetalBackdrop() {
  return (
    <div className="botanical-backdrop" aria-hidden="true">
      <Image
        src="/assets/floral-edge.png"
        alt=""
        width={941}
        height={1672}
        sizes="(max-width: 640px) 100vw, 42rem"
        className="floral-edge-art"
        priority
      />
    </div>
  );
}
