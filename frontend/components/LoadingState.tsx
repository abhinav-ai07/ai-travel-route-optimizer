import React, { useState, useEffect } from "react";

const loadingMessages = [
  "🔍 Analyzing available flights...",
  "🚆 Checking train routes...",
  "🤖 Running AI optimization...",
  "📊 Comparing multimodal options...",
  "💰 Finding best prices...",
  "✨ Preparing your results...",
];

const LoadingState: React.FC = () => {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      {/* Animated travel illustration */}
      <div className="loading-visual">
        <div className="loading-track">
          <div className="loading-path"></div>
          <div className="loading-plane">✈️</div>
        </div>
        <div className="loading-dots-row">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="loading-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Loading message */}
      <div className="loading-message">
        <p className="loading-text">{loadingMessages[messageIdx]}</p>
        <p className="loading-subtext">This usually takes 5-10 seconds</p>
      </div>

      {/* Skeleton cards */}
      <div className="skeleton-grid">
        {[1, 2, 3].map((item) => (
          <div key={item} className="skeleton-card" style={{ animationDelay: `${item * 0.15}s` }}>
            <div className="skeleton-header">
              <div className="skeleton-icon"></div>
              <div className="skeleton-lines">
                <div className="skeleton-line w-32"></div>
                <div className="skeleton-line w-20 short"></div>
              </div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-body">
              <div className="skeleton-line w-full"></div>
              <div className="skeleton-line w-3/4"></div>
            </div>
            <div className="skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
