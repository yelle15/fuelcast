'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function FuelPriceSimulation() {
  const [country, setCountry] = useState('Philippines');
  const [fuelType, setFuelType] = useState('Diesel');
  const [currentPrice, setCurrentPrice] = useState('62.50');
  const [lastWeekPrice, setLastWeekPrice] = useState('61.90');
  const [taxPercentage, setTaxPercentage] = useState('12.00');
  const [brentCrudePrice, setBrentCrudePrice] = useState(62.50);
  const [predictionDate, setPredictionDate] = useState('2025-10-20');

  const handleRunPrediction = () => {
    // TODO: Implement prediction logic
    console.log({
      country,
      fuelType,
      currentPrice,
      lastWeekPrice,
      taxPercentage,
      brentCrudePrice,
      predictionDate,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 bg-sky-800 rounded-lg flex items-center justify-center flex-shrink-0">
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
          <p className="text-sm text-gray-600 mt-0.5">Fill in the inputs to generate a prediction.</p>
        </div>
      </div>

      {/* Country and Fuel Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Country Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Country <span className="text-red-500">*</span>
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>LPG</option>
            <option>Diesel</option>
            <option>Petrol</option>
          </select>
        </div>
      </div>

      {/* Local Market Inputs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Local Market Inputs</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Current Price */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
              Current Price ($/L) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Last Week's Price */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
              Last Week's Price ($/L) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={lastWeekPrice}
              onChange={(e) => setLastWeekPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tax Percentage */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 h-8">
              Tax Percentage (%)
              <span className="text-gray-500 text-xs font-normal ml-1">optional</span>
            </label>
            <input
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Brent Crude Price Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-gray-900">
            Brent Crude Price (Currency)
            <span className="text-gray-500 text-xs font-normal ml-1">optional</span>
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
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date for Prediction <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            value={predictionDate}
            onChange={(e) => setPredictionDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Run Prediction Button */}
      <button
        onClick={handleRunPrediction}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <span>▶</span>
        RUN PREDICTION
      </button>
    </div>
  );
}
