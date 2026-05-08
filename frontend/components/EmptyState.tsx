import React from "react";
import { Plane, Search, MapPin } from "lucide-react";

interface EmptyStateProps {
  type?: "no-results" | "error" | "initial";
  message?: string;
  onRetry?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = "no-results",
  message,
  onRetry,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-visual">
        {type === "error" ? (
          <div className="empty-icon empty-icon-error">⚠️</div>
        ) : (
          <div className="empty-icon-group">
            <div className="empty-icon-plane">
              <Plane className="w-12 h-12 text-slate-600" />
            </div>
            <div className="empty-icon-dots">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="empty-dot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <div className="empty-icon-pin">
              <MapPin className="w-10 h-10 text-slate-600" />
            </div>
          </div>
        )}
      </div>

      <h3 className="empty-title">
        {type === "error"
          ? "Something went wrong"
          : "No routes found"}
      </h3>

      <p className="empty-description">
        {message ||
          (type === "error"
            ? "We encountered an error while searching for routes. Please try again."
            : "We couldn't find any routes matching your criteria. Try adjusting your search.")}
      </p>

      <div className="empty-suggestions">
        <p className="empty-suggestions-title">💡 Suggestions:</p>
        <ul className="empty-suggestions-list">
          <li>Try different source or destination cities</li>
          <li>Check if the city name is spelled correctly</li>
          <li>Remove or increase the budget limit</li>
          <li>Try a different travel date</li>
        </ul>
      </div>

      {onRetry && (
        <button onClick={onRetry} className="empty-retry-btn">
          <Search className="w-4 h-4" />
          Try Another Search
        </button>
      )}
    </div>
  );
};

export default EmptyState;
