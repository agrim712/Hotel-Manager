import React from "react";

import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";

const productOptions = [
  {
    value: "Starter PMS",
    label: "Starter PMS",
    group: "core",
    features: "Dashboard, Stay View, Guests, Companies, Rooms View, Folio",
    monthly: {
      INR: { "0–10": "₹3,500", "11–30": "₹5,000", "31–50": "₹6,500", "50+": "₹8,000" },
      USD: { "0–10": "$42", "11–30": "$60", "31–50": "$78", "50+": "$96" }
    }
  },
  {
    value: "Pro PMS",
    label: "Pro PMS",
    group: "core",
    features: "Starter PMS + Reservation, Housekeeping, Reports, Expenses",
    monthly: {
      INR: { "0–10": "₹7,000", "11–30": "₹9,000", "31–50": "₹11,500", "50+": "₹14,000" },
      USD: { "0–10": "$84", "11–30": "$108", "31–50": "$138", "50+": "$169" }
    }
  },
  {
    value: "Enterprise PMS",
    label: "Enterprise PMS",
    group: "core",
    features: "Pro PMS + Rate Mgmt, Operations, Sales, HR, Accounting",
    monthly: {
      INR: { "0–10": "₹12,000", "11–30": "₹16,000", "31–50": "₹20,000", "50+": "₹25,000" },
      USD: { "0–10": "$145", "11–30": "$193", "31–50": "$241", "50+": "$301" }
    }
  },
  {
    value: "Revenue Suite",
    label: "Revenue Suite",
    group: "addons",
    features: "Revenue Manager + Reports + Rate Management",
    monthly: {
      INR: { "0–10": "₹4,500", "11–30": "₹6,000", "31–50": "₹8,000", "50+": "₹10,000" },
      USD: { "0–10": "$54", "11–30": "$72", "31–50": "$96", "50+": "$120" }
    }
  },
  {
    value: "Booking Engine Suite",
    label: "Booking Engine Suite",
    group: "addons",
    features: "Booking Engine + Folio + Guests + Reservation",
    monthly: {
      INR: { "0–10": "₹5,500", "11–30": "₹7,500", "31–50": "₹9,500", "50+": "₹12,000" },
      USD: { "0–10": "$66", "11–30": "$90", "31–50": "$115", "50+": "$145" }
    }
  },
  {
    value: "POS Suite",
    label: "POS Suite",
    group: "addons",
    features: "POS (Restaurant, Spa, Bar) + Bar Management",
    monthly: {
      INR: { "0–10": "₹3,500", "11–30": "₹5,000", "31–50": "₹6,500", "50+": "₹8,000" },
      USD: { "0–10": "$42", "11–30": "$60", "31–50": "$78", "50+": "$96" }
    }
  },
  {
    value: "All-in-One PMS",
    label: "All-in-One PMS",
    group: "allinone",
    features: "Full Suite: PMS, Revenue, Booking Engine, POS, Restaurant, Spa, Bar, HR, Finance",
    monthly: {
      INR: { "0–10": "₹20,000", "11–30": "₹28,000", "31–50": "₹36,000", "50+": "₹45,000" },
      USD: { "0–10": "$278", "11–30": "$383", "31–50": "$497", "50+": "$602" }
    }
  }
];

const exclusivePMS = ["Starter PMS", "Pro PMS", "Enterprise PMS"];

const getTierPrice = (monthly, currency, noOfRooms) => {
  const tiers = monthly[currency];
  if (noOfRooms <= 10) return tiers["0–10"];
  if (noOfRooms <= 30) return tiers["11–30"];
  if (noOfRooms <= 50) return tiers["31–50"];
  return tiers["50+"];
};
const ProductsSection = ({ control, errors, loading, currency, noOfRooms, setValue }) => {
    const { fields, append, remove, replace } = useFieldArray({
      control,
      name: "products"
    });
  
    const isSelected = (value) => fields.some((f) => f.product === value);
  
    const toggleProduct = (value) => {
      const selected = isSelected(value);
  
      if (selected) {
        const idx = fields.findIndex((f) => f.product === value);
        remove(idx);
      } else {
        if (value === "All-in-One PMS") {
          replace([{ product: "All-in-One PMS" }]);
        } else {
          if (isSelected("All-in-One PMS")) {
            replace([{ product: value }]);
            return;
          }
          if (exclusivePMS.includes(value)) {
            const others = fields.filter((f) => !exclusivePMS.includes(f.product));
            replace([...others, { product: value }]);
            return;
          }
          append({ product: value });
        }
      }
    };
  
    const totalPrice = fields.reduce((sum, f) => {
      const product = productOptions.find((p) => p.value === f.product);
      if (!product) return sum;
  
      const priceStr = getTierPrice(product.monthly, currency, noOfRooms);
      if (!priceStr || priceStr === "-") return sum;
  
      const num = parseFloat(priceStr.replace(/[^\d.]/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  
    const annualPrice = totalPrice * 12 * 0.8; // 20% discount
  
    useEffect(() => {
      setValue("totalMonthlyPrice", totalPrice);
      setValue("totalAnnualPrice", annualPrice);
    }, [fields, currency, noOfRooms, setValue, totalPrice, annualPrice]);
  
    const formatCurrency = (num) => {
      if (currency === "INR") return `₹${num.toLocaleString()}`;
      return `$${num}`;
    };
  
    const formattedMonthly = formatCurrency(totalPrice);
    const formattedAnnual = formatCurrency(annualPrice);
  
    const renderGroup = (title, group) => (
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {productOptions.filter((p) => p.group === group).map((product) => {
            const selected = isSelected(product.value);
            const price = getTierPrice(product.monthly, currency, noOfRooms);
            return (
              <div
                key={product.value}
                onClick={() => toggleProduct(product.value)}
                className={`cursor-pointer border rounded-xl p-5 transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-400 hover:shadow"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-semibold text-gray-900">{product.label}</h4>
                  {selected && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.features}</p>
                <p className="text-sm font-medium text-gray-800">
                  Monthly Price ({currency}):{" "}
                  <span className="font-bold">{price}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  
    return (
      <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
            8
          </span>
          Products & Services
        </h2>
  
        {renderGroup("Core PMS Packages", "core")}
        {renderGroup("Additional Modules", "addons")}
        {renderGroup("All-in-One Package", "allinone")}
  
        {errors.products && (
          <p className="text-red-500 text-xs mt-3">{errors.products.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Tap on a card to add/remove products. Core PMS allows only one, All-in-One overrides everything.
        </p>
  
        {fields.length > 0 && (
          <div className="mt-6 p-4 bg-white border rounded-xl shadow-sm text-right">
            <p className="text-lg font-semibold text-gray-800">
              Total Monthly Price:{" "}
              <span className="text-blue-600">{formattedMonthly}</span>
            </p>
            <p className="text-md font-medium text-gray-700 mt-1">
              Annual Price (20% off):{" "}
              <span className="text-green-600">{formattedAnnual}</span>
            </p>
          </div>
        )}
      </div>
    );
  };
  
  export default ProductsSection;