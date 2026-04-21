"use client";

import React from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function PredictionResults() {
  // Mock data - Will be replaced with backend integration
  const predictionData = {
    date: "OCTOBER 20",
    prediction: {
      status: "POSSIBLE PRICE HIKE",
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

  return (
    <div className="w-[726px] h-96 p-5 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] flex flex-col justify-start items-start gap-2.5">
      {/* Header Section */}
      <div className="self-stretch flex justify-between items-start gap-4">
        {/* Left Group: Icon + Title + Subtitle */}
        <div className="flex items-start gap-3">
          {/* Icon Button */}
          <div className="w-9 h-9 bg-sky-950 rounded-[3px] shadow-[inset_0px_3px_3px_0px_rgba(0,0,0,0.25)] flex justify-center items-center flex-shrink-0">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
            </svg>
          </div>

          <div className="flex flex-col justify-start items-start">
            <div
              className={`text-black text-base font-semibold ${inter.className}`}
            >
              Prediction Results
            </div>
            <div
              className={`text-black text-[8px] font-light ${inter.className}`}
            >
              Fill in the inputs to generate a prediction.
            </div>
          </div>
        </div>

        {/* Date Button */}
        <div className="px-3 py-1 bg-sky-950 rounded-[3px] flex-shrink-0">
          <div
            className={`text-center text-white text-[8px] font-semibold whitespace-nowrap ${inter.className}`}
          >
            DATE: {predictionData.date}
          </div>
        </div>
      </div>

      {/* Alert Banner Section */}
      <div className="self-stretch flex-1 py-4 px-6 bg-rose-200/60 rounded-[5px] flex flex-col justify-center items-start gap-2.5 min-h-0">
        <div className="flex justify-start items-center gap-6">
          {/* Icon Box */}
          <div className="w-20 h-20 bg-red-500 rounded-[10px] flex-shrink-0"></div>

          {/* Alert Content */}
          <div className="flex flex-col justify-start items-start gap-1 flex-1 min-w-0">
            {/* Alert Title */}
            <div
              className={`text-red-500 text-2xl font-semibold ${inter.className}`}
            >
              {predictionData.prediction.status}
            </div>

            {/* Disclaimer Text */}
            <div className={`text-[8px] ${inter.className}`}>
              <span className="text-black font-bold">Disclaimer: </span>
              <span className="text-black font-normal">
                {predictionData.prediction.disclaimer}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Regression Output Section */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
        {/* Section Title */}
        <div className={`text-black text-xs font-semibold ${inter.className}`}>
          Regression Output
        </div>

        {/* Metrics Container */}
        <div className="self-stretch h-20 bg-slate-100 rounded-[5px] flex justify-between items-center px-8 py-4">
          {/* Prediction Change */}
          <div className="flex flex-col justify-center items-start gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Prediction Change
            </div>
            <div
              className={`text-teal-600 text-base font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.predictionChange}
            </div>
          </div>

          {/* R² Score */}
          <div className="flex flex-col justify-center items-start gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              R² Score
            </div>
            <div
              className={`text-black text-base font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.r2Score}
            </div>
          </div>

          {/* Confidence Level */}
          <div className="flex flex-col justify-center items-start gap-1">
            <div
              className={`text-black text-[10px] font-medium ${inter.className}`}
            >
              Confidence Level
            </div>
            <div
              className={`text-teal-600 text-base font-medium ${jetbrainsMono.className}`}
            >
              {predictionData.regression.confidenceLevel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
