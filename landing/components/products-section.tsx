"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./product-card";
import { products } from "@/lib/products";
import { Category, CATEGORIES } from "@/lib/types";

export function ProductsSection() {
  const [selectedCategory, setSelectedCategory] ***REMOVED*** useState<Category>("all");
  const [searchQuery, setSearchQuery] ***REMOVED*** useState("");

  const filteredProducts ***REMOVED*** useMemo(() ***REMOVED***> {
    return products.filter((product) ***REMOVED***> {
      const matchesCategory ***REMOVED***
        selectedCategory ***REMOVED******REMOVED******REMOVED*** "all" || product.category ***REMOVED******REMOVED******REMOVED*** selectedCategory;
      const matchesSearch ***REMOVED***
        searchQuery ***REMOVED******REMOVED******REMOVED*** "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id***REMOVED***"products" className***REMOVED***"py-16 md:py-24">
      <div className***REMOVED***"container mx-auto px-4">
        <div className***REMOVED***"mb-12">
          <h2 className***REMOVED***"text-3xl md:text-4xl font-bold text-white mb-4">
            Products
          </h2>
          <p className***REMOVED***"text-dark-400 max-w-2xl">
            Browse our catalog of developer tools. Filter by category or search
            by name to find what you need.
          </p>
        </div>

        {/* Search */}
        <div className***REMOVED***"mb-8">
          <input
            type***REMOVED***"search"
            placeholder***REMOVED***"Search products..."
            value***REMOVED***{searchQuery}
            onChange***REMOVED***{(e) ***REMOVED***> setSearchQuery(e.target.value)}
            className***REMOVED***"w-full md:w-96 px-4 py-3 bg-dark-900 border border-dark-800 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className***REMOVED***"flex flex-wrap gap-2 mb-8">
          {Object.entries(CATEGORIES).map(([key, label]) ***REMOVED***> (
            <button
              key***REMOVED***{key}
              onClick***REMOVED***{() ***REMOVED***> setSelectedCategory(key as Category)}
              className***REMOVED***{`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory ***REMOVED******REMOVED******REMOVED*** key
                  ? "bg-accent text-white"
                  : "bg-dark-900 text-dark-400 hover:bg-dark-800 hover:text-dark-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className***REMOVED***"mb-6 text-sm text-dark-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>

        {/* Product Grid */}
        <div className***REMOVED***"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) ***REMOVED***> (
            <ProductCard key***REMOVED***{product.id} product***REMOVED***{product} />
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length ***REMOVED******REMOVED******REMOVED*** 0 && (
          <div className***REMOVED***"text-center py-16">
            <p className***REMOVED***"text-dark-400 text-lg">
              No products found matching your criteria.
            </p>
            <button
              onClick***REMOVED***{() ***REMOVED***> {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className***REMOVED***"mt-4 text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
