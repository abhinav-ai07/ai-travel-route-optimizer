import React from "react";

const BackgroundGradient: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

      {/* Animated gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(14, 165, 233, 0.1) 25%, rgba(14, 165, 233, 0.1) 26%, transparent 27%, transparent 74%, rgba(14, 165, 233, 0.1) 75%, rgba(14, 165, 233, 0.1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(14, 165, 233, 0.1) 25%, rgba(14, 165, 233, 0.1) 26%, transparent 27%, transparent 74%, rgba(14, 165, 233, 0.1) 75%, rgba(14, 165, 233, 0.1) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      ></div>
    </div>
  );
};

export default BackgroundGradient;
