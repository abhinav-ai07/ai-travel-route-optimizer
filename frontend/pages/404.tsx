import React from "react";
import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <div className="mb-6 inline-block p-4 rounded-full bg-red-500/20 border border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          404 Not Found
        </h1>

        <p className="text-slate-400 mb-8">
          We couldn't find the page you're looking for. Let's get you back on track!
        </p>

        <Link href="/">
          <button className="btn-primary flex items-center justify-center gap-2 w-full">
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
