import PropTypes from "prop-types";

function Analytics({ product, analytics }) {
  const data = analytics[product.id];

  // Don't render until analytics are available
  if (!data) return null;

  const shouldBuy =
    (product.currentPrice ?? 0) <= data.averagePrice;

  return (
    <div className="mt-6 bg-slate-50 rounded-xl p-4 border">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Price Analytics
      </h3>

      <div className="grid grid-cols-3 gap-4">

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Lowest
          </p>

          <p className="text-lg font-bold text-green-600">
            ₹{data.lowestPrice}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Highest
          </p>

          <p className="text-lg font-bold text-red-600">
            ₹{data.highestPrice}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Average
          </p>

          <p className="text-lg font-bold text-blue-600">
            ₹{data.averagePrice.toFixed(2)}
          </p>
        </div>

      </div>

      <div className="mt-6 flex justify-center">

        <span
          className={`px-5 py-2 rounded-lg text-white font-semibold ${
            shouldBuy
              ? "bg-green-600"
              : "bg-orange-500"
          }`}
        >
          {shouldBuy ? "✅ BUY NOW" : "⏳ WAIT"}
        </span>

      </div>

    </div>
  );
}

Analytics.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    currentPrice: PropTypes.number,
  }).isRequired,

  analytics: PropTypes.objectOf(
    PropTypes.shape({
      lowestPrice: PropTypes.number.isRequired,
      highestPrice: PropTypes.number.isRequired,
      averagePrice: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Analytics;