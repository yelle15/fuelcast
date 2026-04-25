"use client";

import React, { useState, useEffect } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

// ============================================================================
// MOCK ML PREDICTION DATA SERVICE
// ============================================================================
// This section contains mock ML prediction data that simulates API responses.
// Replace this with actual API calls to the backend ML service in the future.
// The structure must match: { date, prediction, regression }

const mockMLPredictionService = {
  // Default mock prediction data
  defaultData: {
    date: "OCTOBER 20",
    prediction: {
      status: "POSSIBLE PRICE HIKE",
      type: "HIKE",
      change: "+₱0.32",
      unit: "/Liter",
      disclaimer:
        "This predictive analysis is NOT a primary source of truth. Actual fuel prices may vary due to unforeseen market events, government adjustments, or global oil price fluctuations.",
    },
    regression: {
      predictionChange: "+₱0.32 /Liter",
      r2Score: "0.918",
      confidenceLevel: "92.3%",
    },
  },

  // Alternative mock scenarios for testing different prediction types
  scenarios: {
    HIKE: {
      date: "OCTOBER 20",
      prediction: {
        status: "POSSIBLE PRICE HIKE",
        type: "HIKE",
        change: "+₱0.32",
        unit: "/Liter",
        disclaimer:
          "This predictive analysis is NOT a primary source of truth. Actual fuel prices may vary due to unforeseen market events, government adjustments, or global oil price fluctuations.",
      },
      regression: {
        predictionChange: "+₱0.32 /Liter",
        r2Score: "0.918",
        confidenceLevel: "92.3%",
      },
    },
    STABLE: {
      date: "OCTOBER 20",
      prediction: {
        status: "PRICE STABLE",
        type: "STABLE",
        change: "±₱0.00",
        unit: "/Liter",
        disclaimer:
          "This predictive analysis is NOT a primary source of truth. Actual fuel prices may vary due to unforeseen market events, government adjustments, or global oil price fluctuations.",
      },
      regression: {
        predictionChange: "±₱0.00 /Liter",
        r2Score: "0.856",
        confidenceLevel: "88.5%",
      },
    },
    ROLLBACK: {
      date: "OCTOBER 20",
      prediction: {
        status: "POSSIBLE PRICE ROLLBACK",
        type: "ROLLBACK",
        change: "-₱0.25",
        unit: "/Liter",
        disclaimer:
          "This predictive analysis is NOT a primary source of truth. Actual fuel prices may vary due to unforeseen market events, government adjustments, or global oil price fluctuations.",
      },
      regression: {
        predictionChange: "-₱0.25 /Liter",
        r2Score: "0.902",
        confidenceLevel: "90.1%",
      },
    },
  },

  // Simulate async API call - replace with real API in the future
  fetchPrediction: async (params = {}) => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const scenario = params.scenario || "HIKE";
        resolve(mockMLPredictionService.scenarios[scenario]);
      }, 500);
    });
  },
};

// ============================================================================
// DATA NORMALIZATION & VALIDATION
// ============================================================================
// Ensures consistent data structure and provides fallbacks for missing values

const normalizePredictionData = (data) => {
  if (!data) return mockMLPredictionService.defaultData;

  return {
    date: data.date ?? "",
    prediction: {
      status: data.prediction?.status ?? "UNKNOWN",
      type: data.prediction?.type ?? "STABLE",
      change: data.prediction?.change ?? "",
      unit: data.prediction?.unit ?? "",
      disclaimer: data.prediction?.disclaimer ?? "",
    },
    regression: {
      predictionChange: data.regression?.predictionChange ?? "",
      r2Score: data.regression?.r2Score ?? "0",
      confidenceLevel: data.regression?.confidenceLevel ?? "0%",
    },
  };
};

// ============================================================================
// UI CONFIGURATION & STYLING
// ============================================================================
// Maps prediction types to their corresponding visual configurations
// Maintains consistent styling across all prediction scenarios

const predictionStatusConfig = {
  HIKE: {
    icon: "/Hike.png",
    bannerBgColor: "#FED7D799",
    iconBoxBgColor: "#EF4444",
    textColor: "#EF4444",
    displayText: "POSSIBLE PRICE HIKE",
  },
  STABLE: {
    icon: "/Stable.png",
    bannerBgColor: "#FEE8C1",
    iconBoxBgColor: "#FF7A00",
    textColor: "#FF7A00",
    displayText: "PRICE STABLE",
  },
  ROLLBACK: {
    icon: "/rollback.png",
    bannerBgColor: "#C7ECE7",
    iconBoxBgColor: "#027D58",
    textColor: "#027D58",
    displayText: "POSSIBLE PRICE ROLLBACK",
  },
};

// Dynamic React component that renders prediction data with proper state management

export default function PredictionResults(props) {
  const { data, scenario = null } = props;

  // State management for dynamic behavior
  const [predictionData, setPredictionData] = useState(() =>
    normalizePredictionData(data ?? mockMLPredictionService.defaultData),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Effect: Load mock prediction data when component mounts or scenario changes
  useEffect(() => {
    const loadPrediction = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace this with actual API call when backend is ready
        // Example: const response = await fetch('/api/predictions', { ... });
        const mockData = await mockMLPredictionService.fetchPrediction({
          scenario,
        });
        setPredictionData(normalizePredictionData(mockData));
      } catch (error) {
        console.error("Error loading prediction:", error);
        setPredictionData(
          normalizePredictionData(mockMLPredictionService.defaultData),
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (scenario || data) {
      loadPrediction();
    }
  }, [scenario, data]);

  const currentConfig =
    predictionStatusConfig[predictionData.prediction.type] ||
    predictionStatusConfig.STABLE;

  return (
    <div className="w-[726px] h-[405px] p-5 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] flex flex-col justify-start items-start gap-2.5">
      {/* HEADER */}
      <div className="self-stretch flex justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <img
            src="/Prediction%20Results.png"
            alt="Prediction Results Logo"
            className="w-9 h-9 object-contain flex-shrink-0"
          />

          <div className="flex flex-col">
            <h3
              className={`text-black text-base font-semibold ${inter.className}`}
            >
              Prediction Results
            </h3>
            <div
              className={`text-black text-[8px] font-light ${inter.className}`}
            >
              Fill in the inputs to generate a prediction.
            </div>
          </div>
        </div>

        <div className="px-3 py-1 bg-sky-950 rounded-[3px] flex-shrink-0">
          <div
            className={`text-white text-[8px] font-semibold ${inter.className}`}
          >
            DATE: {predictionData.date}
          </div>
        </div>
      </div>

      {/* BANNER - DYNAMICALLY RENDERED BASED ON PREDICTION TYPE */}
      <div
        className="self-stretch flex-1 py-6 px-6 mb-2 rounded-[5px] flex items-center gap-6 transition-colors duration-300"
        style={{ backgroundColor: currentConfig.bannerBgColor }}
      >
        <div
          className="w-20 h-20 rounded-[10px] flex justify-center items-center transition-colors duration-300"
          style={{ backgroundColor: currentConfig.iconBoxBgColor }}
        >
          <img
            src={currentConfig.icon}
            alt={predictionData.prediction.type}
            className="w-full h-full object-contain p-2"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <div
            className={`text-2xl font-semibold transition-colors duration-300 ${inter.className}`}
            style={{ color: currentConfig.textColor }}
          >
            {isLoading ? "Loading..." : predictionData.prediction.status}
          </div>

          <div className={`text-[8px] ${inter.className}`}>
            <span className="text-black font-bold">Disclaimer: </span>
            <span className="text-black font-normal">
              {predictionData.prediction.disclaimer}
            </span>
          </div>
        </div>
      </div>

      {/* REGRESSION OUTPUT - DYNAMIC METRICS FROM ML MODEL */}
      <div className="self-stretch flex flex-col gap-2.5">
        <div className={`text-black text-xs font-bold ${inter.className}`}>
          Regression Output
        </div>

        <div className="self-stretch h-20 bg-slate-100 rounded-[5px] flex justify-between items-center px-8 py-4">
          {/* Prediction Change - Dynamic value from ML model */}
          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Prediction Change
            </div>
            <div
              className={`text-teal-600 text-base font-medium ${jetbrainsMono.className}`}
            >
              {isLoading ? "—" : predictionData.regression.predictionChange}
            </div>
          </div>

          {/* R² Score - Model accuracy metric */}
          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              R² Score
            </div>
            <div
              className={`text-black text-base font-medium ${jetbrainsMono.className}`}
            >
              {isLoading ? "—" : predictionData.regression.r2Score}
            </div>
          </div>

          {/* Confidence Level - Model confidence percentage */}
          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Confidence Level
            </div>
            <div
              className={`text-teal-600 text-base font-medium ${jetbrainsMono.className}`}
            >
              {isLoading ? "—" : predictionData.regression.confidenceLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
