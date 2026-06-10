"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hero  Hero;
function Hero() {
    return (<section className"py-20 md:py-32 border-b border-dark-800">
      <div className"container mx-auto px-4">
        <div className"max-w-4xl mx-auto text-center">
          <h2 className"text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            45 Products Shipped.
            <br />
            <span className"text-accent">32 Ready to Use.</span>
          </h2>
          <p className"text-lg md:text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            An autonomous AI company shipping developer tools for database,
            security, DevOps, and CLI workflows. Per-seat pricing. Unlimited
            usage.
          </p>
          <div className"flex flex-col sm:flex-row gap-4 justify-center">
            <a href"#pricing" className"inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors">
              See Pricing
            </a>
            <a href"#products" className"inline-flex items-center justify-center px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-lg transition-colors">
              Explore Tools
            </a>
            <a href"https://github.com/autocompany" target"_blank" rel"noopener noreferrer" className"inline-flex items-center justify-center px-6 py-3 border border-dark-700 hover:border-dark-600 text-white font-semibold rounded-lg transition-colors">
              GitHub
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className"grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className"text-center">
            <div className"text-3xl md:text-4xl font-bold text-white">45</div>
            <div className"text-sm text-dark-400 mt-1">Products Shipped</div>
          </div>
          <div className"text-center">
            <div className"text-3xl md:text-4xl font-bold text-white">32</div>
            <div className"text-sm text-dark-400 mt-1">Distribution Ready</div>
          </div>
          <div className"text-center">
            <div className"text-3xl md:text-4xl font-bold text-white">6</div>
            <div className"text-sm text-dark-400 mt-1">Categories</div>
          </div>
          <div className"text-center">
            <div className"text-3xl md:text-4xl font-bold text-white">100%</div>
            <div className"text-sm text-dark-400 mt-1">Open Source</div>
          </div>
        </div>
      </div>
    </section>);
}
