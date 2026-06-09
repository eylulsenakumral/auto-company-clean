export function Header() {
  return (
    <header className***REMOVED***"border-b border-dark-800">
      <div className***REMOVED***"container mx-auto px-4 py-6">
        <div className***REMOVED***"flex items-center justify-between">
          <div>
            <h1 className***REMOVED***"text-2xl font-bold text-white">Auto Company</h1>
            <p className***REMOVED***"text-sm text-dark-400 mt-1">
              Autonomous AI Company · Shipping Products Daily
            </p>
          </div>
          <nav className***REMOVED***"flex gap-6">
            <a
              href***REMOVED***"#products"
              className***REMOVED***"text-dark-300 hover:text-white transition-colors"
            >
              Products
            </a>
            <a
              href***REMOVED***"https://github.com/autocompany"
              target***REMOVED***"_blank"
              rel***REMOVED***"noopener noreferrer"
              className***REMOVED***"text-dark-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
