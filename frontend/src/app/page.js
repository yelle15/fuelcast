import BrentCrudevsLocalTrend from "@/app/components/prediction-confidence-distribution";
import FuelPriceSimulation from "@/app/components/fuel-price-simulation";
import PredictionResults from "@/app/components/prediction-results";
import PredictionConfidenceDistribution from "@/app/components/prediction-confidence-distribution";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-[#F2F4F9] font-sans">
      <main className="flex flex-1 w-full flex-col items-center justify-center px-6 py-16 md:px-16 md:py-24">
        <FuelPriceSimulation />
        <PredictionResults />
        <BrentCrudevsLocalTrend />
        <PredictionConfidenceDistribution />
      </main>
    </div>
  );
}
