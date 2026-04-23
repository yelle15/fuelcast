"use client";

import { useEffect, useMemo, useState } from "react";

import BrentCrudevsLocalTrend from "@/app/components/brent-crude-vs-local-trend";
import FuelPriceSimulation from "@/app/components/fuel-price-simulation";
import ModelVoting from "@/app/components/model-voting";
import PredictionConfidenceDistribution from "@/app/components/prediction-confidence-distribution";
import PredictionResults from "@/app/components/prediction-results";

export default function Home() {
  // Input states (lifted from FuelPriceSimulation)
  const [country, setCountry] = useState("Philippines");
  const [fuelType, setFuelType] = useState("Diesel");
  const [currentPrice, setCurrentPrice] = useState("62.50");
  const [lastWeekPrice, setLastWeekPrice] = useState("61.90");
  const [taxPercentage, setTaxPercentage] = useState("12.00");

  // Required: Brent Crude slider state in page.js
  const [brentCrudePrice, setBrentCrudePrice] = useState(62.5);

  const [predictionDate, setPredictionDate] = useState("2025-10-20");

  // Output state
  const [predictionData, setPredictionData] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedApiBaseUrl = apiBaseUrl?.replace(/\/$/, "");

  useEffect(() => {
    if (!normalizedApiBaseUrl) {
      console.warn(
        "NEXT_PUBLIC_API_URL is not set. Create frontend/.env.local (e.g. NEXT_PUBLIC_API_URL=http://localhost:8000/api).",
      );
    }
  }, [normalizedApiBaseUrl]);

  // Required: gather all states and POST to `${NEXT_PUBLIC_API_URL}/predict`
  const handleRunPrediction = async () => {
    if (!normalizedApiBaseUrl || loading) return;

    setLoading(true);
    try {
      const payload = {
        country,
        fuelType,
        currentPrice: Number(currentPrice),
        lastWeekPrice: Number(lastWeekPrice),
        taxPercentage:
          taxPercentage === "" || taxPercentage == null
            ? null
            : Number(taxPercentage),
        brentCrudePrice,
        predictionDate,
      };

      const response = await fetch(`${normalizedApiBaseUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Prediction request failed (${response.status})`);
      }

      const json = await response.json();
      setPredictionData(json);
    } catch (error) {
      // Keep UX unchanged (no new error UI); just log for now.
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const derived = useMemo(() => {
    const data = predictionData;

    return {
      predictionResults: data?.predictionResults ?? data,
      trend: data?.trend ?? data?.chartData,
      modelPredictions: data?.modelPredictions ?? data?.predictions,
      majorityVote: data?.majorityVote,
      confidenceDistribution: data?.confidenceDistribution,
      confidenceRangeDisplay: data?.confidenceRangeDisplay,
    };
  }, [predictionData]);

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
            Simulate fuel price movements and plan your next fill-up with
            confidence.
          </p>
        </div>

        {/* Top Section: Inputs (Left) and Main Result (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[512px_734px] justify-items-center gap-8 mb-5 items-start w-full max-w-[1278px]">
          <div className="h-full">
            <FuelPriceSimulation
              country={country}
              setCountry={setCountry}
              fuelType={fuelType}
              setFuelType={setFuelType}
              currentPrice={currentPrice}
              setCurrentPrice={setCurrentPrice}
              lastWeekPrice={lastWeekPrice}
              setLastWeekPrice={setLastWeekPrice}
              taxPercentage={taxPercentage}
              setTaxPercentage={setTaxPercentage}
              brentCrudePrice={brentCrudePrice}
              setBrentCrudePrice={setBrentCrudePrice}
              predictionDate={predictionDate}
              setPredictionDate={setPredictionDate}
              onRunPrediction={handleRunPrediction}
              loading={loading}
              disabled={!normalizedApiBaseUrl}
            />
          </div>
          <div className="h-full">
            <PredictionResults data={derived.predictionResults} />
          </div>
        </div>

        {/* Bottom Section: Three-Column Charts & Voting */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[512px_356px_370px] justify-items-center gap-6 items-start w-full max-w-[1278px]">
          <BrentCrudevsLocalTrend data={derived.trend} />
          <PredictionConfidenceDistribution
            data={derived.confidenceDistribution}
            rangeDisplay={
              derived.confidenceRangeDisplay ?? "0.28 - 0.35 / Liter"
            }
          />
          <ModelVoting
            predictions={derived.modelPredictions}
            majorityVote={derived.majorityVote}
          />
        </div>
      </main>
    </div>
  );
}
