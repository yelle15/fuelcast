import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-[#003152] border-b border-[#003152] flex flex-row items-center h-[86.2805px] py-4 px-8">
      <div className="w-full flex flex-row items-center justify-between">

        <div className="flex items-center">
          <Image
            src="/fuelcast-logo.png"
            alt="Fuelcast"
            width={180}
            height={48}
            priority
            className="h-10 w-auto"
          />
        </div>

      </div>
    </header>
  );
}