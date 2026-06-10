"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default  Home;
var header_1  require("@/components/header");
var hero_1  require("@/components/hero");
var pricing_section_1  require("@/components/pricing-section");
var products_section_1  require("@/components/products-section");
var footer_1  require("@/components/footer");
function Home() {
    return (<div className"min-h-screen flex flex-col">
      <header_1.Header />
      <main className"flex-1">
        <hero_1.Hero />
        <pricing_section_1.PricingSection />
        <products_section_1.ProductsSection />
      </main>
      <footer_1.Footer />
    </div>);
}
