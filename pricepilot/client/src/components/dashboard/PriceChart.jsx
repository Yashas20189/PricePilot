import PropTypes from "prop-types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function PriceChart({ history }) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white border rounded-xl p-4">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Price Trend
      </h3>

      <div className="w-full h-72">

        <ResponsiveContainer>
          <LineChart data={history}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="createdAt"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString()
              }
            />

            <YAxis />

            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleString()
              }
            />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={3}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

PriceChart.propTypes = {
  history: PropTypes.array.isRequired,
};

export default PriceChart;