'use client';

import Image from 'next/image';

function Spinner() {
  return (
    <div
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"
      aria-label="Loading"
      role="status"
    />
  );
}

export default function FuelPriceSimulation({
  country,
  setCountry,
  fuelType,
  setFuelType,
  currentPrice,
  setCurrentPrice,
  lastWeekPrice,
  setLastWeekPrice,
  taxPercentage,
  setTaxPercentage,
  brentCrudePrice,
  setBrentCrudePrice,
  predictionDate,
  setPredictionDate,
  onRunPrediction,
  loading = false,
  disabled = false,
}) {

  return (
    <div className="w-full max-w-lg h-123 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-sky-800 rounded-lg flex items-center justify-center shrink-0">
          <Image
            src="/fuel-icon.png"
            alt="Fuel Price"
            width={26}
            height={26}
            className="w-8 h-8"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">Fuel Price Simulation</h1>
          <p className="text-[10px] font-inter text-gray-600 mt-0.5">Fill in the inputs to generate a prediction.</p>
        </div>
      </div>

      {/* Country and Fuel Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Country Dropdown */}
        <div>
          <label className="block text-sm font-semibold font-inter text-gray-700 mb-2">
            Select Country <span className="text-red-500">*</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>Indonesia</option>
            <option>Malaysia</option>
            <option>Myanmar</option>
            <option>Philippines</option>
            <option>Singapore</option>
            <option>Thailand</option>
            <option>Vietnam</option>
          </select>
        </div>

        {/* Fuel Type Dropdown */}
        <div>
          <label className="block text-sm font-semibold font-inter text-gray-700 mb-2">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>LPG</option>
            <option>Diesel</option>
            <option>Petrol</option>
          </select>
        </div>
      </div>

      {/* Local Market Inputs */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold font-inter text-gray-900 mb-3">Local Market Inputs</h3>
        <div className="w-full flex h-16.5 pl-2 pr-3 py-2 items-start gap-5 rounded-[5px] border-[0.5px] border-[#F2F4F9] bg-[#F9FAFB]">
          {/* Current Price */}
          <div className="w-32">
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5 leading-tight">
              Current Price ($/L) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Last Week's Price */}
          <div className="w-32">
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5 leading-tight">
              Last Week&apos;s Price ($/L) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={lastWeekPrice}
              onChange={(e) => setLastWeekPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tax Percentage */}
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5 leading-tight whitespace-nowrap">
              Tax Percentage (%) <span className="text-gray-500 text-[10px] font-normal italic ml-1">optional</span>
            </label>
            <input
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Brent Crude Price Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold font-inter text-gray-900">
            Brent Crude Price (Currency)
            <span className="text-gray-500 text-xs font-normal italic ml-1">optional</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">$</span>
            <input
              type="number"
              value={brentCrudePrice}
              onChange={(e) => setBrentCrudePrice(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.1"
              min="0"
              max="150"
              className="w-20 px-2 py-1 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="150"
          step="0.1"
          value={brentCrudePrice}
          onChange={(e) => setBrentCrudePrice(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0.00</span>
          <span>$150.00</span>
        </div>
      </div>

      {/* Date for Prediction */}
      <div className="mb-4">
        <label className="block text-sm font-semibold font-inter text-gray-700 mb-2">
          Date for Prediction <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={predictionDate}
            onChange={(e) => setPredictionDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Run Prediction Button */}
      <button
        type="button"
        onClick={onRunPrediction}
        disabled={loading || disabled}
        className={`w-full bg-blue-900 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 ${
          loading || disabled
            ? "cursor-not-allowed opacity-70"
            : "hover:bg-blue-800"
        }`}
      >
        {loading ? (
          <>
            <Spinner />
            Running...
          </>
        ) : (
          <>
            <span>▶</span>
            RUN PREDICTION
          </>
        )}
      </button>
    </div>
  );
}
