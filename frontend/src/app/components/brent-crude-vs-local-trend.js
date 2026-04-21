"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/** placeholder only */
const mockChartData = [
  { date: "Jun 01", brentCrude: 95, localFuelPrice: 68.5 },
  { date: "Jun 06", brentCrude: 93, localFuelPrice: 67.8 },
  { date: "Jun 11", brentCrude: 98, localFuelPrice: 69.2 },
  { date: "Jun 16", brentCrude: 105, localFuelPrice: 70.1 },
  { date: "Jun 21", brentCrude: 108, localFuelPrice: 70.5 },
  { date: "Jun 26", brentCrude: 102, localFuelPrice: 69.8 },
  { date: "Jun 30", brentCrude: 100, localFuelPrice: 69.2 },
];

const normalizeChartData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    date: item.date ?? "",
    brentCrude: Number(item.brentCrude) || 0,
    localFuelPrice: Number(item.localFuelPrice) || 0,
  }));
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    return (
      <div className="bg-white p-5 border border-gray-300 rounded-lg shadow-lg">
        <p className="text-xs font-semibold text-gray-700">{data?.date}</p>
        <p className="text-xs text-blue-500 font-semibold">
          Brent Crude: ${data?.brentCrude?.toFixed(2)}
        </p>
        <p className="text-xs text-teal-600 font-semibold">
          Local Price: ₱{data?.localFuelPrice?.toFixed(2)}/L
        </p>
      </div>
    );
  }
  return null;
};

/** Custom Legend */
const CustomLegend = () => {
  return (
    <div className="flex justify-between items-center mb-2 font-inter">
      <span className="text-[10px] font-semibold text-blue-500 font-inter mt-2">
        USD
      </span>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-0.5 bg-blue-500 rounded-full"></div>
          <span className="text-[8px] font-semibold text-black font-inter">
            Brent Crude (USD)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-2.5 h-0.5 bg-teal-600 rounded-full"></div>
          <span className="text-[8px] font-semibold text-black font-inter">
            Local Fuel Price (₱/L)
          </span>
        </div>
      </div>

      <span className="text-[10px] font-semibold text-teal-600 font-inter">
        (₱/L)
      </span>
    </div>
  );
};

export default function BrentCrudeVsLocalTrend({
  data, // 👈 backend will pass this
}) {
  const chartData = normalizeChartData(data?.length ? data : mockChartData);

  const gridLines = [70, 80, 90, 100, 110, 120];
  const pesoGridLines = [60, 62, 64, 66, 68, 70];

  return (
    <div className="w-full max-w-lg h-[275px] p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex justify-start items-center gap-3 mb-4">
        <img
          src="/Brent%20Crude%20vs.%20Local%20Trend.png"
          alt="Brent Crude vs. Local Trend Logo"
          className="w-9 h-9 object-contain rounded-lg"
        />
        <h3 className="text-black text-ms font-semibold font-inter">
          Brent Crude vs. Local Trend
        </h3>
      </div>

      {/* Legend */}
      <CustomLegend />

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 0, left: 0, bottom: 4 }}
          >
          <CartesianGrid
            stroke="rgba(107,114,128,0.2)"
            vertical={false}
            horizontal={false}
          />

          {gridLines.map((value) => (
            <ReferenceLine
              key={value}
              y={value}
              yAxisId="left"
              stroke="rgba(107,114,128,0.2)"
              strokeWidth={0.5}
            />
          ))}

            <XAxis
              dataKey="date"
              tick={{ fontSize: 8, fontFamily: "Inter", fill: "#000" }}
              axisLine={{
                stroke: "rgba(107, 114, 128, 0.1)",
                strokeWidth: 0.5,
              }}
              tickLine={false}
              height={20}
              padding={{ left: 10, right: 10 }}
            />

          <YAxis
            yAxisId="left"
            tick={{ fontSize: 8, fontFamily: "Inter", fill: "#000" }}
            axisLine={{
              stroke: "rgba(107, 114, 128, 0.1)",
              strokeWidth: 0.5,
            }}
            tickLine={false}
            width={25}
            domain={[70, 120]}
            ticks={gridLines}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 8, fontFamily: "Inter", fill: "#000" }}
            axisLine={{
              stroke: "rgba(107, 114, 128, 0.1)",
              strokeWidth: 0.5,
            }}
            tickLine={false}
            width={25}
            domain={[60, 70]}
            ticks={pesoGridLines}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="brentCrude"
            stroke="#3B82F6"
            dot={{ fill: "#3B82F6", r: 3 }}
            activeDot={{ r: 5, fill: "#3B82F6" }}
            strokeWidth={2}
            isAnimationActive
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="localFuelPrice"
            stroke="#00A896"
            dot={{ fill: "#00A896", r: 3 }}
            activeDot={{ r: 5, fill: "#00A896" }}
            strokeWidth={2}
            isAnimationActive
          />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
