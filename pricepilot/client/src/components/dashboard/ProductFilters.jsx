function ProductFilters({ filter, setFilter }) {
  const filters = [
    { id: "all", label: "All" },
    { id: "amazon", label: "Amazon" },
    { id: "flipkart", label: "Flipkart" },
    { id: "target", label: "Target Reached" },
    { id: "below", label: "Below Target" },
    { id: "above", label: "Above Target" },
  ];

  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {filters.map((item) => (
        <button
          key={item.id}
          onClick={() => setFilter(item.id)}
          className={`rounded-xl border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
            filter === item.id
              ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default ProductFilters;