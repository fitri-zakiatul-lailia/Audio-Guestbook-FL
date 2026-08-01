import Image from "next/image";

const flowers = [
  { src: "/assets/flowers/flower-01-ranunculus.png", position: "flower-01", priority: true },
  { src: "/assets/flowers/flower-02-anemone.png", position: "flower-02", priority: true },
  { src: "/assets/flowers/flower-03-cosmos.png", position: "flower-03" },
  { src: "/assets/flowers/flower-04-garden-rose.png", position: "flower-04" },
  { src: "/assets/flowers/flower-05-peony.png", position: "flower-05" },
  { src: "/assets/flowers/flower-06-camellia.png", position: "flower-06" },
  { src: "/assets/flowers/flower-07-cherry-blossom.png", position: "flower-07" },
];

export default function PetalBackdrop() {
  return (
    <div className="botanical-backdrop" aria-hidden="true">
      <div className="botanical-stage">
        {flowers.map((flower) => (
          <span
            key={flower.src}
            className={`botanical-flower botanical-flower--${flower.position}`}
          >
            <Image
              src={flower.src}
              alt=""
              width={512}
              height={512}
              sizes="(max-width: 640px) 18vw, 5rem"
              className="botanical-flower-art"
              priority={flower.priority}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
