"use client";

import React, { useState, useEffect } from "react";

// ============================================================================
// MOCK MODEL VOTING API SERVICE
// ============================================================================
// This section contains mock model voting data that simulates API responses.
// Replace this with actual API calls to the backend when available.
// The structure must match: { individual_votes, consensus_vote }

const mockModelVotingService = {
  // Mock API response with individual model predictions
  mockResponse: {
    individual_votes: [
      {
        id: 1,
        model: "Linear Regression",
        prediction: "HIKE",
        confidence: 98,
      },
      { id: 2, model: "XGBoost", prediction: "ROLLBACK", confidence: 94 },
      { id: 3, model: "SVM", prediction: "STABLE", confidence: 89 },
    ],
    consensus_vote: {
      prediction: "HIKE",
      confidence: 98,
    },
  },

  // Alternative mock scenarios for testing
  scenarios: {
    HIKE_CONSENSUS: {
      individual_votes: [
        {
          id: 1,
          model: "Linear Regression",
          prediction: "HIKE",
          confidence: 98,
        },
        { id: 2, model: "XGBoost", prediction: "HIKE", confidence: 96 },
        { id: 3, model: "SVM", prediction: "HIKE", confidence: 94 },
      ],
      consensus_vote: {
        prediction: "HIKE",
        confidence: 96,
      },
    },
    STABLE_CONSENSUS: {
      individual_votes: [
        {
          id: 1,
          model: "Linear Regression",
          prediction: "STABLE",
          confidence: 87,
        },
        { id: 2, model: "XGBoost", prediction: "STABLE", confidence: 89 },
        { id: 3, model: "SVM", prediction: "STABLE", confidence: 91 },
      ],
      consensus_vote: {
        prediction: "STABLE",
        confidence: 89,
      },
    },
    ROLLBACK_CONSENSUS: {
      individual_votes: [
        {
          id: 1,
          model: "Linear Regression",
          prediction: "ROLLBACK",
          confidence: 92,
        },
        { id: 2, model: "XGBoost", prediction: "ROLLBACK", confidence: 95 },
        { id: 3, model: "SVM", prediction: "ROLLBACK", confidence: 90 },
      ],
      consensus_vote: {
        prediction: "ROLLBACK",
        confidence: 92,
      },
    },
    MIXED_VOTES: {
      individual_votes: [
        {
          id: 1,
          model: "Linear Regression",
          prediction: "HIKE",
          confidence: 98,
        },
        { id: 2, model: "XGBoost", prediction: "ROLLBACK", confidence: 94 },
        { id: 3, model: "SVM", prediction: "STABLE", confidence: 89 },
      ],
      consensus_vote: {
        prediction: "HIKE",
        confidence: 98,
      },
    },
  },

  // Simulate async API call - replace with real API in the future
  fetchModelVotes: async (scenario = "MIXED_VOTES") => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          mockModelVotingService.scenarios[scenario] ||
            mockModelVotingService.mockResponse,
        );
      }, 500);
    });
  },
};

// ============================================================================
// DATA NORMALIZATION & VALIDATION
// ============================================================================
// Ensures consistent data structure for individual votes

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

// ============================================================================
// PREDICTION BADGE COMPONENT
// ============================================================================
// Renders prediction type badges with dynamic colors based on prediction result

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

// ============================================================================
// MODEL VOTING COMPONENT
// ============================================================================
// Dynamic React component that renders individual model predictions and consensus vote

export default function ModelVoting({ predictions, majorityVote, scenario }) {
  // State management for dynamic data from API
  const [safePredictions, setSafePredictions] = useState(() =>
    normalizePredictions(
      predictions || mockModelVotingService.mockResponse.individual_votes,
    ),
  );
  const [safeMajorityVote, setSafeMajorityVote] = useState(() =>
    normalizeMajorityVote(
      majorityVote || mockModelVotingService.mockResponse.consensus_vote,
    ),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Effect: Load model voting data when component mounts or scenario changes
  useEffect(() => {
    const loadModelVotes = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace this with actual API call when backend is ready
        // Example: const response = await fetch('/api/model-votes', { ... });
        const apiData = await mockModelVotingService.fetchModelVotes(scenario);
        setSafePredictions(normalizePredictions(apiData.individual_votes));
        setSafeMajorityVote(normalizeMajorityVote(apiData.consensus_vote));
      } catch (error) {
        console.error("Error loading model votes:", error);
        // Fallback to default data
        setSafePredictions(
          normalizePredictions(
            mockModelVotingService.mockResponse.individual_votes,
          ),
        );
        setSafeMajorityVote(
          normalizeMajorityVote(
            mockModelVotingService.mockResponse.consensus_vote,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Load data if scenario prop is provided or component receives new props
    if (scenario || predictions || majorityVote) {
      loadModelVotes();
    }
  }, [scenario, predictions, majorityVote]);

  return (
    <div className="w-full max-w-[370px] h-[275px] p-4 bg-white rounded-lg shadow-[0px_0px_6px_0px_rgba(0,0,0,0.20)] font-inter">
      {/* Header */}
      <div className="flex justify-start items-center gap-2 mb-4">
        <img
          src="/Model%20Voting.png"
          alt="Model Voting Logo"
          className="w-9 h-9 object-contain rounded-lg"
        />
        <h3 className="text-black text-ms font-semibold">Model Voting</h3>
      </div>

      {/* Table Header */}
      <div className="w-full h-9 bg-slate-100 rounded-t-[5px] border border-gray-400/20 flex items-center px-4">
        <span className="text-black text-[9px] font-semibold w-24">Model</span>
        <span className="text-black text-[9px] font-semibold flex-1 text-center">
          Prediction
        </span>
        <span className="text-black text-[9px] font-semibold w-16 text-center">
          Confidence
        </span>
      </div>

      {/* Dynamically Rendered Model Prediction Rows - from individual_votes array */}
      {isLoading ? (
        <div className="w-full h-9 bg-white border border-gray-400/20 flex items-center justify-center text-gray-500 text-[9px]">
          Loading...
        </div>
      ) : (
        safePredictions.map((row, index) => (
          <div
            key={row.id}
            className={`w-full h-9 bg-white border-x border-t border-gray-400/20 flex items-center px-4 ${
              index === safePredictions.length - 1
                ? "rounded-b-[5px] border-b"
                : ""
            }`}
          >
            <span className="text-black text-[9px] font-medium w-24 truncate">
              {row.model}
            </span>

            <div className="flex-1 flex justify-center">
              <PredictionBadge type={row.prediction} />
            </div>

            <span className="text-black text-[9px] font-medium w-16 text-center">
              {row.confidence}%
            </span>
          </div>
        ))
      )}

      {/* Majority Vote / Consensus Vote */}
      <div className="w-full mt-3 px-6 py-2 bg-slate-100 rounded-[5px] border border-gray-400/20 flex justify-center">
        <div className="text-center text-[12px]">
          <span className="text-black font-bold">MAJORITY VOTE: </span>
          <span className="text-red-500 font-bold">
            {isLoading ? "—" : safeMajorityVote.prediction}
          </span>
        </div>
      </div>
    </div>
  );
}
