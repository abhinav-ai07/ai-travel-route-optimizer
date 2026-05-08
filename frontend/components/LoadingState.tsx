import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="space-y-6 py-8">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="glass rounded-2xl p-6 border border-cyan-500/20 animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 flex-1">
              <div className="w-12 h-12 bg-slate-700/50 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-700/50 rounded w-48"></div>
                <div className="h-3 bg-slate-700/30 rounded w-32"></div>
              </div>
            </div>
            <div className="h-8 bg-slate-700/50 rounded-full w-32"></div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-3 mb-6 p-4 bg-slate-900/50 rounded-lg">
            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
            <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
            <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
          </div>

          {/* Price skeleton */}
          <div className="h-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg mb-4"></div>

          {/* Button skeleton */}
          <div className="h-10 bg-slate-700/50 rounded-lg"></div>
        </div>
      ))}

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-3 mt-12">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
        <span className="text-slate-400 text-sm animate-pulse">
          Finding the best routes for you...
        </span>
      </div>
    </div>
  );
};

export default LoadingState;
