import React, { createContext, useContext, useState, useEffect } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const finalProducts = typeof parsed === "string" ? JSON.parse(parsed) : parsed;

        if (Array.isArray(finalProducts)) {
          setProducts(finalProducts);
        } else {
          console.warn("Products in localStorage is not an array");
        }
      } catch (err) {
        console.error("Failed to parse products from localStorage", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
