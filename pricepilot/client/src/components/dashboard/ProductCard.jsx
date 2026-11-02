import PropTypes from "prop-types";
import {
  Package,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";

import Analytics from "./Analytics";
import PriceChart from "./PriceChart";
import PriceHistory from "./PriceHistory";

function ProductCard({
  product,
  analytics,
  history,
  isExpanded,
  toggleDetails,
  handleUpdatePrice,
  handleDeleteProduct,
}) {
  let platform = "Unknown";

  if (product?.url?.includes("amazon")) {
    platform = "Amazon";
  } else if (product?.url?.includes("flipkart")) {
    platform = "Flipkart";
  }

  const currentPrice = product.currentPrice ?? 0;
  const targetPrice = product.targetPrice ?? 0;

  const difference = Math.abs(currentPrice - targetPrice);

  const reachedTarget = currentPrice <= targetPrice;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* ================= Header ================= */}

      <div className="flex items-start justify-between">

        <div className="flex-1">

          <h3 className="text-xl font-bold text-slate-900">
            {product.name}
          </h3>

          <span
            className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
              platform === "Amazon"
                ? "bg-yellow-100 text-yellow-700"
                : platform === "Flipkart"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {platform}
          </span>

        </div>

        {/* Placeholder */}

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">

          <Package
            size={34}
            className="text-slate-500"
          />

        </div>

      </div>

      {/* ================= Prices ================= */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-emerald-50 p-5">

          <p className="text-sm text-slate-500">
            Current Price
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            ₹{currentPrice}
          </p>

        </div>

        <div className="rounded-2xl bg-indigo-50 p-5">

          <p className="text-sm text-slate-500">
            Target Price
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            ₹{targetPrice}
          </p>

        </div>

      </div>

      {/* ================= Status ================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

        <div className="flex items-center justify-between">

          <span className="text-sm font-medium text-slate-500">
            Status
          </span>

          {reachedTarget ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              🎉 Target Reached
            </span>
          ) : (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              ₹{difference} Above Target
            </span>
          )}

        </div>

      </div>

      {/* ================= Actions ================= */}

      <div className="mt-6 grid grid-cols-3 gap-3">

        <button
          onClick={() => toggleDetails(product.id)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {isExpanded ? (
            <>
              <EyeOff size={18} />
              Hide
            </>
          ) : (
            <>
              <Eye size={18} />
              Details
            </>
          )}
        </button>

        <button
          onClick={() => handleUpdatePrice(product.id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Pencil size={18} />
          Update
        </button>

        <button
          onClick={() => handleDeleteProduct(product.id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100"
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

      {/* ================= Expandable Section ================= */}

      {isExpanded && (
        <div className="mt-8 space-y-6 border-t border-slate-200 pt-6">

          <Analytics
            product={product}
            analytics={analytics}
          />

          <PriceChart
            history={history[product.id]}
          />

          <PriceHistory
            history={history[product.id]}
          />

        </div>
      )}

    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
    currentPrice: PropTypes.number,
    targetPrice: PropTypes.number.isRequired,
  }).isRequired,

  analytics: PropTypes.object.isRequired,

  history: PropTypes.object.isRequired,

  isExpanded: PropTypes.bool.isRequired,

  toggleDetails: PropTypes.func.isRequired,

  handleUpdatePrice: PropTypes.func.isRequired,

  handleDeleteProduct: PropTypes.func.isRequired,
};

export default ProductCard;