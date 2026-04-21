"use client";

import React from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

/**
 * =========================
 * BACKEND DATA CONTRACT
 * =========================
 *
 * data = {
 *   date: string,
 *   prediction: {
 *     status: string,
 *     type: "HIKE" | "STABLE" | "ROLLBACK",
 *     change: string,
 *     unit: string,
 *     disclaimer: string
 *   },
 *   regression: {
 *     predictionChange: string,
 *     r2Score: string | number,
 *     confidenceLevel: string | number
 *   }
 * }
 */

/** fallback mock */
const mockPredictionData = {
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
};

/** SAFE NORMALIZER */
const normalizePredictionData = (data) => {
  if (!data) return mockPredictionData;

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

/** CONFIG (UNCHANGED UI LOGIC) */
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

export default function PredictionResults(props) {
  const { data } = props;

  const predictionData = normalizePredictionData(data ?? mockPredictionData);

  const currentConfig =
    predictionStatusConfig[predictionData.prediction.type] ||
    predictionStatusConfig.STABLE;

  return (
    <div className="w-[750px] h-123 p-4 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] flex flex-col justify-start items-start gap-2.5">
      {/* HEADER */}
      <div className="self-stretch flex justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <img
            src="/Prediction%20Results.png"
            alt="Prediction Results Logo"
            className="w-9 h-9 object-contain rounded-lg flex-shrink-0"
          />

          <div className="flex flex-col">
            <h1
              className="text-lg font-semibold text-gray-900 leading-tight"
              >
              Prediction Results
            </h1>
            <p
              className="text-[10px] font-inter text-gray-600 mt-0.5">
              Fill in the inputs to generate a prediction.
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-sky-950 rounded-[3px] flex-shrink-0">
          <div
            className={`text-white text-xs font-semibold ${inter.className}`}
          >
            DATE: {predictionData.date}
          </div>
        </div>
      </div>

      {/* BANNER */}
      <div
        className="self-stretch flex-1 py-6 px-6 mb-2 rounded-[5px] flex items-center gap-6"
        style={{ backgroundColor: currentConfig.bannerBgColor }}
      >
        <div
          className="w-20 h-20 rounded-[10px] flex justify-center items-center"
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
            className={`text-lg font-semibold ${inter.className}`}
            style={{ color: currentConfig.textColor }}
          >
            {predictionData.prediction.status}
          </div>

          <div className={`text-[10px] ${inter.className}`}>
            <span className="text-black font-bold">Disclaimer: </span>
            <span className="text-black font-normal">
              {predictionData.prediction.disclaimer}
            </span>
          </div>
        </div>
      </div>

      {/* REGRESSION */}
      <div className="self-stretch flex flex-col gap-2.5">
        <div className="text-sm font-semibold font-inter text-gray-900">
          Regression Output
        </div>

        <div className="self-stretch h-20 bg-slate-100 rounded-[5px] flex justify-between items-center px-8 py-4">
          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Prediction Change
            </div>
            <div
              className={`text-teal-600 text-sm font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.predictionChange}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              R² Score
            </div>
            <div
              className={`text-black text-sm font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.r2Score}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Confidence Level
            </div>
            <div
              className={`text-teal-600 text-sm font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.confidenceLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
