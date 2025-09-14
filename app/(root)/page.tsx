// import { Button } from "@/components/ui/button";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";

const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} />
      )}
      <ProductList data={latestProducts} title="Newest Arrivals" />
    </>
  );
};

export default Homepage;
