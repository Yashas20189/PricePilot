import { useState } from "react";
import ProductCard from "./ProductCard";
import { Package } from "lucide-react";

function ProductList({
  products,
  history,
  analytics,
  fetchHistory,
  handleUpdatePrice,
  handleDeleteProduct,
}) {
  const [expandedProductId, setExpandedProductId] = useState(null);

  const toggleDetails = async (productId) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      return;
    }

    await fetchHistory(productId);
    setExpandedProductId(productId);
  };

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Your Products
          </h2>

          <p className="mt-1 text-slate-500">
            Manage and monitor all the products you're tracking.
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2">

          <Package
            size={18}
            className="text-indigo-600"
          />

          <span className="font-semibold text-indigo-700">
            {products.length} Products
          </span>

        </div>

      </div>

      {/* Empty State */}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl">
            📦
          </div>

          <h3 className="mt-6 text-xl font-semibold text-slate-900">
            No Products Yet
          </h3>

          <p className="mt-2 max-w-md text-center text-slate-500">
            Start tracking your first product by adding an Amazon or Flipkart product above.
          </p>

        </div>
      ) : (

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              analytics={analytics}
              history={history}
              isExpanded={expandedProductId === product.id}
              toggleDetails={toggleDetails}
              handleUpdatePrice={handleUpdatePrice}
              handleDeleteProduct={handleDeleteProduct}
            />
          ))}

        </div>

      )}

    </section>
  );
}

export default ProductList;