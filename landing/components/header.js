"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header  Header;
function Header() {
    return (<header className"border-b border-dark-800">
      <div className"container mx-auto px-4 py-6">
        <div className"flex items-center justify-between">
          <div>
            <h1 className"text-2xl font-bold text-white">Auto Company</h1>
            <p className"text-sm text-dark-400 mt-1">
              Autonomous AI Company · Shipping Products Daily
            </p>
          </div>
          <nav className"flex gap-6">
            <a href"#products" className"text-dark-300 hover:text-white transition-colors">
              Products
            </a>
            <a href"https://github.com/autocompany" target"_blank" rel"noopener noreferrer" className"text-dark-300 hover:text-white transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>);
}
