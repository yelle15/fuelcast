"use client";

import React from "react";

const mockModelPredictions = [
  { id: 1, model: "Linear Regression", prediction: "HIKE", confidence: 98 },
  { id: 2, model: "XGBoost", prediction: "ROLLBACK", confidence: 94 },
  { id: 3, model: "SVM", prediction: "STABLE", confidence: 89 },
];

const mockMajorityVote = {
  prediction: "HIKE",
  confidence: 98,
};

const normalizePredictions = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => ({
    id: item.id ?? index,
    model: item.model ?? "Unknown Model",
    prediction: item.prediction ?? "STABLE",
    confidence: Number(item.confidence) || 0,
  }));
};

const normalizeMajorityVote = (data) => {
  if (!data) return { prediction: "STABLE", confidence: 0 };

  return {
    prediction: data.prediction ?? "STABLE",
    confidence: Number(data.confidence) || 0,
  };
};

const PredictionBadge = ({ type }) => {
  const badgeConfig = {
    HIKE: { bgColor: "bg-rose-200", textColor: "text-red-500", label: "HIKE" },
    STABLE: {
      bgColor: "bg-yellow-100",
      textColor: "text-orange-500",
      label: "STABLE",
    },
    ROLLBACK: {
      bgColor: "bg-teal-100",
      textColor: "text-emerald-700",
      label: "ROLLBACK",
    },
  };

  const config = badgeConfig[type] || badgeConfig.STABLE;

  return (
    <div className={`${config.bgColor} rounded-[5px] px-2 py-1 inline-flex`}>
      <div className={`${config.textColor} text-[8px] font-bold text-center`}>
        {config.label}
      </div>
    </div>
  );
};

/** MAIN COMPONENT */
export default function ModelVoting({ predictions, majorityVote }) {
  const safePredictions = normalizePredictions(
    predictions?.length ? predictions : mockModelPredictions,
  );

  const safeMajorityVote = normalizeMajorityVote(
    majorityVote ?? mockMajorityVote,
  );

  return (
    <div className="w-full max-w-[369px] h-[268px] p-4 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] font-inter">
      {/* Header */}
      <div className="flex justify-start items-center gap-2 mb-4">
        <img
          src="/Model%20Voting.png"
          alt="Model Voting Logo"
          className="w-7 h-6 object-contain"
        />
        <h3 className="text-black text-base font-semibold">Model Voting</h3>
      </div>

      {/* Table Header */}
      <div className="w-full h-9 bg-slate-100 rounded-t-[5px] border border-gray-400/20 flex items-center px-4">
        <span className="text-black text-[8px] font-semibold w-24">Model</span>
        <span className="text-black text-[8px] font-semibold flex-1 text-center">
          Prediction
        </span>
        <span className="text-black text-[8px] font-semibold w-16 text-center">
          Confidence
        </span>
      </div>

      {/* Rows */}
      {safePredictions.map((row, index) => (
        <div
          key={row.id}
          className={`w-full h-9 bg-white border-x border-t border-gray-400/20 flex items-center px-4 ${
            index === safePredictions.length - 1
              ? "rounded-b-[5px] border-b"
              : ""
          }`}
        >
          <span className="text-black text-[8px] font-medium w-24 truncate">
            {row.model}
          </span>

          <div className="flex-1 flex justify-center">
            <PredictionBadge type={row.prediction} />
          </div>

          <span className="text-black text-[8px] font-medium w-16 text-center">
            {row.confidence}%
          </span>
        </div>
      ))}

      {/* Majority Vote */}
      <div className="w-full mt-3 px-6 py-2 bg-slate-100 rounded-[5px] border border-gray-400/20 flex justify-center">
        <div className="text-center text-[8px]">
          <span className="text-black font-bold">MAJORITY VOTE: </span>
          <span className="text-red-500 font-bold">
            {safeMajorityVote.prediction}
          </span>
        </div>
      </div>
    </div>
  );
}
