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
  distribution_data,
  data,
  rangeDisplay,
}) {
  const chartData = Array.isArray(distribution_data)
    ? distribution_data
    : Array.isArray(data)
      ? data
      : [];
  const hasData = chartData.length > 0;

  return (
    <div className="w-full max-w-[360px] h-[275px] p-4 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] font-inter flex flex-col">
      {/* Header */}
      <div className="flex justify-start items-center gap-2 mb-3 ">
        <img
          src="/Prediction%20Confidence%20Distribution.png"
          alt="Prediction Confidence Distribution Logo"
          className="w-9 h-9 object-contain rounded-lg"
        />
        <h3 className="text-black text-ms font-semibold">
          Prediction Confidence Distribution
        </h3>
      </div>

      {/* Labels */}
      <div className="flex justify-start items-center gap-24 mb-3">
        <span className="text-black text-[12px] font-bold flex items-center gap-1">
          Range:
          <span className="text-teal-600 text-[12px] font-medium font-mono ml-1">
            {hasData ? (rangeDisplay ?? "—") : "—"}
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="w-full flex-1 min-h-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
        ) : (
          <div className="h-full w-full min-h-0 rounded-[5px] border border-gray-400/20 bg-white flex items-center justify-center text-gray-500 text-[10px]">
            No confidence distribution yet.
          </div>
        )}
      </div>
    </div>
  );
}