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
} from "recharts";

const normalizeChartData = (data) => {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => ({
      date: item.date ?? item.name ?? "",
      brentCrude: Number(item.brentCrude),
      localFuelPrice: Number(item.localFuelPrice),
    }))
    .filter(
      (item) =>
        item.date &&
        Number.isFinite(item.brentCrude) &&
        Number.isFinite(item.localFuelPrice),
    );
};

const formatDateLabel = (value) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const buildAxisScale = (values, minPad = 1.0) => {
  if (!values.length) {
    return { domain: [0, 1], ticks: [0, 1] };
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  if (minVal === maxVal) {
    const pad = Math.max(minPad, Math.abs(minVal) * 0.05);
    const start = minVal - pad;
    const end = maxVal + pad;
    const step = (end - start) / 5;
    const ticks = Array.from({ length: 6 }, (_, idx) =>
      Number((start + step * idx).toFixed(1)),
    );

    return { domain: [start, end], ticks };
  }

  const range = maxVal - minVal;
  const pad = Math.max(minPad, range * 0.12);
  const start = minVal - pad;
  const end = maxVal + pad;
  const step = (end - start) / 5;
  const ticks = Array.from({ length: 6 }, (_, idx) =>
    Number((start + step * idx).toFixed(1)),
  );

  return { domain: [start, end], ticks };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    return (
      <div className="bg-white p-5 border border-gray-300 rounded-lg shadow-lg">
        <p className="text-xs font-semibold text-gray-700">{formatDateLabel(data?.date)}</p>
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
  const chartData = normalizeChartData(data);
  const hasData = chartData.length > 0;

  const brentScale = buildAxisScale(
    chartData.map((item) => item.brentCrude),
    2.0,
  );
  const localScale = buildAxisScale(
    chartData.map((item) => item.localFuelPrice),
    0.5,
  );

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
        {hasData ? (
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

              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 8, fontFamily: "Inter", fill: "#000" }}
                axisLine={{
                  stroke: "rgba(107, 114, 128, 0.1)",
                  strokeWidth: 0.5,
                }}
                tickLine={false}
                height={20}
                padding={{ left: 10, right: 10 }}
                minTickGap={14}
              />

            <YAxis
              yAxisId="left"
              tick={{ fontSize: 8, fontFamily: "Inter", fill: "#000" }}
              axisLine={{
                stroke: "rgba(107, 114, 128, 0.1)",
                strokeWidth: 0.5,
              }}
              tickLine={false}
              width={30}
              domain={brentScale.domain}
              ticks={brentScale.ticks}
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
              width={30}
              domain={localScale.domain}
              ticks={localScale.ticks}
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
        ) : (
          <div className="h-full w-full rounded-[5px] border border-gray-400/20 bg-white flex items-center justify-center text-gray-500 text-[10px]">
            No trend data yet.
          </div>
        )}
      </div>
    </div>
  );
}
