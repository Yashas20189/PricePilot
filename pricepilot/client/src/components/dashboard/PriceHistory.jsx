import PropTypes from "prop-types";

function PriceHistory({ history }) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white border rounded-xl p-4">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Price History
      </h3>

      <div className="space-y-2 max-h-60 overflow-y-auto">

        {history.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-2"
          >
            <span className="font-medium text-gray-700">
              ₹{item.price}
            </span>

            <span className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

PriceHistory.propTypes = {
  history: PropTypes.array.isRequired,
};

export default PriceHistory;