import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/layout/Navbar";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsSection from "../components/dashboard/StatsSection";
import AddProductForm from "../components/dashboard/AddProductForm";
import ProductList from "../components/dashboard/ProductList";
import ProductFilters from "../components/dashboard/ProductFilters";

import DashboardLayout from "../components/layout/DashboardLayout";

function Dashboard() {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredProducts = products.filter((product) => {
  const search = searchTerm.toLowerCase();

  const platform = product.url?.includes("amazon")
    ? "amazon"
    : product.url?.includes("flipkart")
    ? "flipkart"
    : "";

  const matchesSearch =
    product.name.toLowerCase().includes(search) ||
    platform.includes(search);

  let matchesFilter = true;

  switch (filter) {
    case "amazon":
      matchesFilter = platform === "amazon";
      break;

    case "flipkart":
      matchesFilter = platform === "flipkart";
      break;

    case "target":
      matchesFilter = product.currentPrice <= product.targetPrice;
      break;

    case "below":
      matchesFilter = product.currentPrice < product.targetPrice;
      break;

    case "above":
      matchesFilter = product.currentPrice > product.targetPrice;
      break;

    default:
      matchesFilter = true;
  }

  return matchesSearch && matchesFilter;
});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/profile",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/products",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        setProducts(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/products",
        {
          name,
          url,
          targetPrice: Number(targetPrice),
          currentPrice: Number(currentPrice),
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setProducts([
        ...products,
        response.data.product,
      ]);

      alert("Product Added Successfully");

      setName("");
      setUrl("");
      setTargetPrice("");
      setCurrentPrice("");

    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdatePrice = async (id) => {
  try {
    const newPrice = prompt("Enter new price");

    if (!newPrice) return;

    const token = localStorage.getItem("token");

    await axios.put(
      `http://localhost:5000/products/${id}/price`,
      {
        price: Number(newPrice),
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    setProducts(
      products.map((product) =>
        product.id === id
          ? {
              ...product,
              currentPrice: Number(newPrice),
            }
          : product
      )
    );

    alert("Price Updated");

  } catch (error) {
    console.log(error);
  }
};

const fetchHistory = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `http://localhost:5000/products/${productId}/history`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    setHistory((prev) => ({
      ...prev,
      [productId]: response.data,
    }));

    const prices = response.data.map(
  (item) => item.price
);

const lowestPrice = Math.min(...prices);

const highestPrice = Math.max(...prices);

const averagePrice =
  prices.reduce((sum, price) => sum + price, 0) /
  prices.length;

setAnalytics((prev) => ({
  ...prev,
  [productId]: {
    lowestPrice,
    highestPrice,
    averagePrice,
  },
}));

  } catch (error) {
    console.log(error);
  }
};

  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/products/${id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setProducts(
        products.filter(
          (product) => product.id !== id
        )
      );

      alert("Product Deleted");

    } catch (error) {
      console.log(error);
    }
  };

 return (
  <DashboardLayout
    user={user}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
  >
      {/* Welcome */}
      <WelcomeSection user={user} />

      {/* Statistics */}
      <StatsSection products={filteredProducts} />

      {/* Add Product */}
      <AddProductForm
  name={name}
  setName={setName}
  url={url}
  setUrl={setUrl}
  targetPrice={targetPrice}
  setTargetPrice={setTargetPrice}
  currentPrice={currentPrice}
  setCurrentPrice={setCurrentPrice}
  handleAddProduct={handleAddProduct}
/>

<ProductFilters
  filter={filter}
  setFilter={setFilter}
/>

<ProductList
  products={filteredProducts}
  history={history}
  analytics={analytics}
  fetchHistory={fetchHistory}
  handleUpdatePrice={handleUpdatePrice}
  handleDeleteProduct={handleDeleteProduct}
/>

    </DashboardLayout>
);
}

export default Dashboard;