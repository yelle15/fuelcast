"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockConfidenceData = [
  { confidence: "80%", frequency: 4 },
  { confidence: "85%", frequency: 12 },
  { confidence: "90%", frequency: 12 },
  { confidence: "92%", frequency: 20 },
  { confidence: "95%", frequency: 16 },
  { confidence: "100%", frequency: 7 },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded-lg shadow-lg font-inter">
        <p className="text-xs font-semibold text-black">
          Confidence Level: {payload[0]?.payload?.confidence}
        </p>
        <p className="text-xs text-blue-500 font-semibold">
          Frequency: {payload[0]?.value}
        </p>
      </div>
    );
  }
  return null;
};

export default function PredictionConfidenceDistribution({
  data = mockConfidenceData,
  rangeDisplay = "0.28 - 0.35 / Liter",
}) {
  return (
    <div className="w-full max-w-[333px] h-[268px] p-4 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] font-inter">
      {/* Header */}
      <div className="flex justify-start items-center gap-2 mb-3 ">
        <img
          src="/Prediction%20Confidence%20Distribution.png"
          alt="Prediction Confidence Distribution Logo"
          className="w-7 h-6 object-contain"
        />
        <h3 className="text-black text-base font-semibold">
          Prediction Confidence Distribution
        </h3>
      </div>

      {/* Labels */}
      <div className="flex justify-start items-center gap-24 mb-3">
        <span className="text-black text-[10px] font-bold flex items-center gap-2">
          Range:
          <span className="text-teal-600 text-[8px] font-medium font-mono ml-1">
            {rangeDisplay}
          </span>
        </span>
      </div>

      {/* Chart */}
      {/* <div className="w-full h-[200px]"> */}
      <ResponsiveContainer width="100%" height="88%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
        >
          {/* Grid (clean solid lines) */}
          <CartesianGrid
            stroke="rgba(107, 114, 128, 0.2)"
            horizontal={true}
            vertical={false}
            strokeWidth={0.5}
          />

          {/* X-axis */}
          <XAxis
            dataKey="confidence"
            tick={{ fontSize: 8, fill: "#000" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
          />

          {/* Y-axis (even spacing) */}
          <YAxis
            tick={{ fontSize: 8, fill: "#000" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(107, 114, 128, 0.2)" }}
            width={25}
            domain={[0, 25]}
            ticks={[0, 5, 10, 15, 20, 25]}
          />

          {/* Tooltip (NO cursor highlight anymore) */}
          <Tooltip content={<CustomTooltip />} cursor={false} />

          {/* Bars */}
          <Bar dataKey="frequency" fill="#3B82F6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    // </div>
  );
}