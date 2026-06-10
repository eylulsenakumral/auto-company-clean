"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsSection  ProductsSection;
var react_1  require("react");
var product_card_1  require("./product-card");
var products_1  require("@/lib/products");
var types_1  require("@/lib/types");
function ProductsSection() {
    var _a  (0, react_1.useState)("all"), selectedCategory  _a[0], setSelectedCategory  _a[1];
    var _b  (0, react_1.useState)(""), searchQuery  _b[0], setSearchQuery  _b[1];
    var filteredProducts  (0, react_1.useMemo)(function () {
        return products_1.products.filter(function (product) {
            var matchesCategory  selectedCategory  "all" || product.category  selectedCategory;
            var matchesSearch  searchQuery  "" ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);
    return (<section id"products" className"py-16 md:py-24">
      <div className"container mx-auto px-4">
        <div className"mb-12">
          <h2 className"text-3xl md:text-4xl font-bold text-white mb-4">
            Products
          </h2>
          <p className"text-dark-400 max-w-2xl">
            Browse our catalog of developer tools. Filter by category or search
            by name to find what you need.
          </p>
        </div>

        {/* Search */}
        <div className"mb-8">
          <input type"search" placeholder"Search products..." value{searchQuery} onChange{function (e) { return setSearchQuery(e.target.value); }} className"w-full md:w-96 px-4 py-3 bg-dark-900 border border-dark-800 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent transition-colors"/>
        </div>

        {/* Category Filters */}
        <div className"flex flex-wrap gap-2 mb-8">
          {Object.entries(types_1.CATEGORIES).map(function (_a) {
            var key  _a[0], label  _a[1];
            return (<button key{key} onClick{function () { return setSelectedCategory(key); }} className{"px-4 py-2 rounded-lg font-medium transition-colors ".concat(selectedCategory  key
                    ? "bg-accent text-white"
                    : "bg-dark-900 text-dark-400 hover:bg-dark-800 hover:text-dark-300")}>
              {label}
            </button>);
        })}
        </div>

        {/* Results Count */}
        <div className"mb-6 text-sm text-dark-500">
          Showing {filteredProducts.length} of {products_1.products.length} products
        </div>

        {/* Product Grid */}
        <div className"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(function (product) { return (<product_card_1.ProductCard key{product.id} product{product}/>); })}
        </div>

        {/* No Results */}
        {filteredProducts.length  0 && (<div className"text-center py-16">
            <p className"text-dark-400 text-lg">
              No products found matching your criteria.
            </p>
            <button onClick{function () {
                setSearchQuery("");
                setSelectedCategory("all");
            }} className"mt-4 text-accent hover:underline">
              Clear filters
            </button>
          </div>)}
      </div>
    </section>);
}
