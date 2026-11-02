import PropTypes from "prop-types";
import {
  Package,
  Link,
  IndianRupee,
  Plus,
} from "lucide-react";

function AddProductForm({
  name,
  setName,
  url,
  setUrl,
  targetPrice,
  setTargetPrice,
  currentPrice,
  setCurrentPrice,
  handleAddProduct,
}) {
  return (
    <section className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-8">

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Plus
            size={28}
            className="text-indigo-600"
          />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Add Product
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Start tracking any Amazon or Flipkart product.
        </p>

      </div>

      {/* Form */}

      <div className="space-y-5">

        {/* Product Name */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Product Name
          </label>

          <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-indigo-500">

            <Package
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="ml-3 flex-1 bg-transparent outline-none"
            />

          </div>

        </div>

        {/* Product URL */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Product URL
          </label>

          <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-indigo-500">

            <Link
              size={18}
              className="text-slate-400"
            />

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Amazon / Flipkart URL"
              className="ml-3 flex-1 bg-transparent outline-none"
            />

          </div>

        </div>

        {/* Target Price */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Target Price
          </label>

          <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-indigo-500">

            <IndianRupee
              size={18}
              className="text-slate-400"
            />

            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price"
              className="ml-3 flex-1 bg-transparent outline-none"
            />

          </div>

        </div>

        {/* Current Price */}

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            Current Price
          </label>

          <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-indigo-500">

            <IndianRupee
              size={18}
              className="text-slate-400"
            />

            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="Enter current price"
              className="ml-3 flex-1 bg-transparent outline-none"
            />

          </div>

        </div>

      </div>

      {/* Button */}

      <div className="mt-8">

        <button
          onClick={handleAddProduct}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Plus size={18} />

          Add Product
        </button>

      </div>

    </section>
  );
}

AddProductForm.propTypes = {
  name: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  setUrl: PropTypes.func.isRequired,
  targetPrice: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  setTargetPrice: PropTypes.func.isRequired,
  currentPrice: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  setCurrentPrice: PropTypes.func.isRequired,
  handleAddProduct: PropTypes.func.isRequired,
};

export default AddProductForm;