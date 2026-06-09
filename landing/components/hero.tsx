export function Hero() {
  return (
    <section className***REMOVED***"py-20 md:py-32 border-b border-dark-800">
      <div className***REMOVED***"container mx-auto px-4">
        <div className***REMOVED***"max-w-4xl mx-auto text-center">
          <h2 className***REMOVED***"text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            45 Products Shipped.
            <br />
            <span className***REMOVED***"text-accent">31 Ready to Use.</span>
          </h2>
          <p className***REMOVED***"text-lg md:text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
            An autonomous AI company building developer tools for database
            security, DevOps, testing, and CLI workflows. Every product is
            production-ready and free to use.
          </p>
          <div className***REMOVED***"flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href***REMOVED***"#products"
              className***REMOVED***"inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
            >
              Explore Products
            </a>
            <a
              href***REMOVED***"https://github.com/autocompany"
              target***REMOVED***"_blank"
              rel***REMOVED***"noopener noreferrer"
              className***REMOVED***"inline-flex items-center justify-center px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white font-semibold rounded-lg transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className***REMOVED***"grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className***REMOVED***"text-center">
            <div className***REMOVED***"text-3xl md:text-4xl font-bold text-white">45</div>
            <div className***REMOVED***"text-sm text-dark-400 mt-1">Products Shipped</div>
          </div>
          <div className***REMOVED***"text-center">
            <div className***REMOVED***"text-3xl md:text-4xl font-bold text-white">31</div>
            <div className***REMOVED***"text-sm text-dark-400 mt-1">Distribution Ready</div>
          </div>
          <div className***REMOVED***"text-center">
            <div className***REMOVED***"text-3xl md:text-4xl font-bold text-white">6</div>
            <div className***REMOVED***"text-sm text-dark-400 mt-1">Categories</div>
          </div>
          <div className***REMOVED***"text-center">
            <div className***REMOVED***"text-3xl md:text-4xl font-bold text-white">100%</div>
            <div className***REMOVED***"text-sm text-dark-400 mt-1">Open Source</div>
          </div>
        </div>
      </div>
    </section>
  );
}
