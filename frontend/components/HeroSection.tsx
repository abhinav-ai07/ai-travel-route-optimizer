import React from "react";

const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-blob opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob opacity-20" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob opacity-20" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto animate-fadeIn">
        {/* Badge */}
        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm font-semibold">
          🚀 Next Generation Travel Planning
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="text-white">Your Perfect</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Travel Route
          </span>
          <br />
          <span className="text-white">Awaits</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Powered by advanced AI and multimodal analysis. Discover flights, trains, and
          combined routes optimized for cost, speed, and comfort.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          {[
            {
              icon: "✈️",
              title: "Multimodal",
              desc: "Flights, trains, and combinations",
            },
            {
              icon: "🤖",
              title: "AI-Powered",
              desc: "Smart recommendations just for you",
            },
            {
              icon: "💰",
              title: "Best Prices",
              desc: "Real-time pricing and comparisons",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="glass p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 card-hover"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Text */}
        <div className="mt-12 pt-8 border-t border-cyan-500/20">
          <p className="text-slate-400 text-sm mb-4">⬇️ Ready to find your route?</p>
          <p className="text-slate-500 text-xs">
            Start planning below and discover amazing travel options
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-cyan-400/50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
