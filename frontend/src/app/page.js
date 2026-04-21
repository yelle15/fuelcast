import PredictionConfidenceDistribution from "@/components/brent-crude-vs-local-trend";
import FuelPriceSimulation from "@/app/components/fuel-price-simulation";
import PredictionResults from "@/app/components/prediction-results";
>>>>>>> main

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-32 px-16">
        <PredictionConfidenceDistribution />
        <FuelPriceSimulation />
        <PredictionResults />
      </main>
    </div>
  );
}
