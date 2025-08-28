import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hotel, token, loading: authLoading } = useAuth();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/hotel/products?hotelId=${hotel.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data.products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      const stored = localStorage.getItem("products");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProducts(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse stored products", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (!authLoading && hotel?.id && token) {
    fetchProducts();
  } else if (!authLoading && (!hotel?.id || !token)) {
    setLoading(false);
  }
}, [authLoading, hotel?.id, token]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  return (
    <ProductContext.Provider value={{ products,setProducts, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);