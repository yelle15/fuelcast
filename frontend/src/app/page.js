import BrentCrudevsLocalTrend from "@/app/components/brent-crude-vs-local-trend";
import FuelPriceSimulation from "@/app/components/fuel-price-simulation";
import PredictionResults from "@/app/components/prediction-results";
import ModelVoting from "@/app/components/model-voting";
import PredictionConfidenceDistribution from "@/app/components/prediction-confidence-distribution";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F2F4F9] font-sans pb-15">
      {/* Container for the whole dashboard content */}
      <main className="max-w-[1400px] mx-auto pt-12 px-8 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="mb-10 text-left w-full max-w-[1278px]">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
            Prediction Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Simulate fuel price movements and plan your next fill-up with confidence.
          </p>
        </div>

        {/* Top Section: Inputs (Left) and Main Result (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[512px_734px] justify-items-center gap-8 mb-5 items-start w-full max-w-[1278px]">
          <div className="h-full">
            <FuelPriceSimulation />
          </div>
          <div className="h-full">
            <PredictionResults />
          </div>
        </div>

        {/* Bottom Section: Three-Column Charts & Voting */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[512px_356px_370px] justify-items-center gap-6 items-start w-full max-w-[1278px]">
          <BrentCrudevsLocalTrend />
          <PredictionConfidenceDistribution />
          <ModelVoting />
        </div>

      </main>
    </div>
  );
}