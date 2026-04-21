import BrentCrudevsLocalTrend from "@/app/components/brent-crude-vs-local-trend";
import FuelPriceSimulation from "@/app/components/fuel-price-simulation";
import PredictionResults from "@/app/components/prediction-results";
import ModelVoting from "@/app/components/model-voting";
import PredictionConfidenceDistribution from "@/app/components/prediction-confidence-distribution";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-center py-32 px-16">
        <BrentCrudevsLocalTrend />
        <FuelPriceSimulation />
        <PredictionResults />
        <ModelVoting />   
        <PredictionConfidenceDistribution />
      </main>
    </div>
  );
}
