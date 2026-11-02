
import { useEffect, useState } from "react";
import axios from "axios";

import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsSection from "../components/dashboard/StatsSection";
import AddProductForm from "../components/dashboard/AddProductForm";
import ProductList from "../components/dashboard/ProductList";
import ProductFilters from "../components/dashboard/ProductFilters";
import DashboardLayout from "../components/layout/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL;

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

  const token = localStorage.getItem("token");

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const platform = product.url?.includes("amazon")
      ? "amazon"
      : product.url?.includes("flipkart")
      ? "flipkart"
      : "";

    const matchesSearch =
      product.name?.toLowerCase().includes(search) ||
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
        matchesFilter =
          product.currentPrice != null &&
          product.currentPrice <= product.targetPrice;
        break;

      case "below":
        matchesFilter =
          product.currentPrice != null &&
          product.currentPrice < product.targetPrice;
        break;

      case "above":
        matchesFilter =
          product.currentPrice != null &&
          product.currentPrice > product.targetPrice;
        break;

      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const savedToken = localStorage.getItem("token");

        if (!savedToken) return;

        const response = await axios.get(
          `${API_URL}/profile`,
          {
            headers: {
              Authorization: savedToken,
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.error("Profile error:", error.response?.data || error.message);
      }
    };

    fetchProfile();
  }, []);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const savedToken = localStorage.getItem("token");

        if (!savedToken) return;

        const response = await axios.get(
          `${API_URL}/products`,
          {
            headers: {
              Authorization: savedToken,
            },
          }
        );

        setProducts(response.data);
      } catch (error) {
        console.error("Products error:", error.response?.data || error.message);
      }
    };

    fetchProducts();
  }, []);

  // ADD PRODUCT
  const handleAddProduct = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/products`,
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

      setProducts((prev) => [
        ...prev,
        response.data.product,
      ]);

      alert("Product Added Successfully");

      setName("");
      setUrl("");
      setTargetPrice("");
      setCurrentPrice("");
    } catch (error) {
      console.error("Add product error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  // UPDATE PRODUCT PRICE
  const handleUpdatePrice = async (id) => {
    try {
      const newPrice = prompt("Enter new price");

      if (newPrice === null || newPrice.trim() === "") return;

      const price = Number(newPrice);

      if (!Number.isFinite(price) || price < 0) {
        alert("Please enter a valid price");
        return;
      }

      await axios.put(
        `${API_URL}/products/${id}/price`,
        {
          price,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id
            ? { ...product, currentPrice: price }
            : product
        )
      );

      alert("Price Updated");
    } catch (error) {
      console.error("Update price error:", error.response?.data || error.message);
      alert("Failed to update price");
    }
  };

  // FETCH PRICE HISTORY
  const fetchHistory = async (productId) => {
    try {
      const response = await axios.get(
        `${API_URL}/products/${productId}/history`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const historyData = response.data;

      setHistory((prev) => ({
        ...prev,
        [productId]: historyData,
      }));

      if (historyData.length === 0) {
        setAnalytics((prev) => ({
          ...prev,
          [productId]: null,
        }));
        return;
      }

      const prices = historyData.map((item) => item.price);

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
      console.error("History error:", error.response?.data || error.message);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/products/${id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );

      alert("Product Deleted");
    } catch (error) {
      console.error("Delete product error:", error.response?.data || error.message);
      alert("Failed to delete product");
    }
  };

  return (
    <DashboardLayout
      user={user}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      <WelcomeSection user={user} />

      <StatsSection products={filteredProducts} />

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
