import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProductsSection } from "@/components/products-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className***REMOVED***"min-h-screen flex flex-col">
      <Header />
      <main className***REMOVED***"flex-1">
        <Hero />
        <ProductsSection />
      </main>
      <Footer />
    </div>
  );
}
