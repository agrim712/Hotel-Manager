import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/onboard";
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = "https://api.countrystatecity.in/v1/countries/[ciso]/cities";
const PHONE_CODE_API_URL = "https://restcountries.com/v3.1/all";
const API_KEY = "UlNueDJhekJaTVRsdHFqZ0tiNHdrT0JVZUdnOTZIdVA4VTgyMnFXcg==";

const currencyOptions = [
  { value: "USD", label: "💵 USD - US Dollar" },
  { value: "INR", label: "🇮🇳 INR - Indian Rupee" },
  { value: "EUR", label: "💶 EUR - Euro" },
  { value: "GBP", label: "💷 GBP - British Pound" },
  { value: "JPY", label: "💴 JPY - Japanese Yen" },
];

const mealPlanOptions = [
  { value: "Room Only", label: "Room Only" },
  { value: "Bed & Breakfast", label: "Bed & Breakfast" },
  { value: "Half Board", label: "Half Board" },
  { value: "Full Board", label: "Full Board" },
  { value: "All Inclusive", label: "All Inclusive" },
];

function PropertyForm() {
  const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      rooms: [{ roomName: "", numOfRooms: "", maxGuests: "", rateType: null, rate: "", extraAdultRate: "", roomNumbers: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "rooms" });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRY_API_URL, {
          headers: { "X-CSCAPI-KEY": API_KEY },
        });
        setCountryOptions(response.data.map((country) => ({ value: country.iso2, label: country.name })));
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    const fetchPhoneCodes = async () => {
      try {
        const response = await axios.get(PHONE_CODE_API_URL);
        const phoneCodes = response.data.map((country) => ({
          value: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          label: `${country.flag} ${country.idd?.root}${country.idd?.suffixes?.[0] || ""}`,
        }));
        setPhoneCodeOptions(phoneCodes);
      } catch (error) {
        console.error("Failed to fetch phone codes:", error);
      }
    };

    fetchCountries();
    fetchPhoneCodes();
  }, []);

  const fetchCities = async (countryCode) => {
    try {
      const response = await axios.get(CITY_API_URL.replace("[ciso]", countryCode), {
        headers: { "X-CSCAPI-KEY": API_KEY },
      });
      setCityOptions(response.data.map((city) => ({ value: city.name, label: city.name })));
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const selectedCountry = watch("country");
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry.value);
    }
  }, [selectedCountry]);

  const products = watch("products") || [];

  const handleCheckboxChange = (value) => {
    const updatedProducts = products.includes(value)
      ? products.filter((item) => item !== value)
      : [...products, value];
    setValue("products", updatedProducts);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const formattedData = {
        ...data,
        country: data.country?.value || "",
        city: data.city?.value || "",
        phoneCode: data.phoneCode?.value || "",
        currency: data.currency?.value || "",
        totalRooms: parseInt(data.totalRooms, 10),
        products: Array.isArray(data.products) ? data.products : [],
        rooms: data.rooms.map((room) => ({
          ...room,
          rateType: room.rateType?.value || "",
          numOfRooms: parseInt(room.numOfRooms, 10),
          maxGuests: parseInt(room.maxGuests, 10),
          rate: parseFloat(room.rate),
          extraAdultRate: parseFloat(room.extraAdultRate),
          roomNumbers: room.roomNumbers ? room.roomNumbers.split(",").map((num) => num.trim()) : [],
        })),
      };

      await axios.post(API_URL, formattedData);
      setMessage("✅ Property onboarded successfully!");
      reset();
    } catch (error) {
      setMessage("❌ Failed to onboard property. Check your input and try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Property Onboarding Form</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block">Hotel Name</label>
          <input className="input" {...register("hotelName", { required: true })} />
          {errors.hotelName && <p className="text-red-500">Hotel name is required</p>}
        </div>

        <div>
          <label className="block">Country</label>
          <Controller
            name="country"
            control={control}
            render={({ field }) => <Select options={countryOptions} {...field} />}
          />
        </div>

        <div>
          <label className="block">City</label>
          <Controller
            name="city"
            control={control}
            render={({ field }) => <Select options={cityOptions} {...field} />}
          />
        </div>

        <div>
          <label className="block">Phone Code</label>
          <Controller
            name="phoneCode"
            control={control}
            render={({ field }) => <Select options={phoneCodeOptions} {...field} />}
          />
        </div>

        <div>
          <label className="block">Currency</label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => <Select options={currencyOptions} {...field} />}
          />
        </div>

        <div>
          <label className="block">Meal Plan</label>
          <Controller
            name="mealPlan"
            control={control}
            render={({ field }) => <Select options={mealPlanOptions} {...field} />}
          />
        </div>

        <div>
          <label className="block">Total Rooms</label>
          <input className="input" type="number" {...register("totalRooms", { required: true })} />
          {errors.totalRooms && <p className="text-red-500">Total rooms is required</p>}
        </div>

        <div>
          <label className="block">Products</label>
          {["Channel Manager", "Booking Engine", "Revenue Management", "PMS"].map((product) => (
            <label key={product} className="block">
              <input
                type="checkbox"
                value={product}
                checked={products.includes(product)}
                onChange={() => handleCheckboxChange(product)}
              />{" "}
              {product}
            </label>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Rooms</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 mb-2 rounded">
              <input placeholder="Room Name" className="input" {...register(`rooms.${index}.roomName`)} />
              <input placeholder="No. of Rooms" className="input" type="number" {...register(`rooms.${index}.numOfRooms`)} />
              <input placeholder="Max Guests" className="input" type="number" {...register(`rooms.${index}.maxGuests`)} />
              <Controller
                name={`rooms.${index}.rateType`}
                control={control}
                render={({ field }) => <Select options={[{ value: "Per Night", label: "Per Night" }]} {...field} />}
              />
              <input placeholder="Rate" className="input" type="number" step="0.01" {...register(`rooms.${index}.rate`)} />
              <input placeholder="Extra Adult Rate" className="input" type="number" step="0.01" {...register(`rooms.${index}.extraAdultRate`)} />
              <input placeholder="Room Numbers (comma-separated)" className="input" {...register(`rooms.${index}.roomNumbers`)} />
              <button type="button" className="text-red-500 mt-2" onClick={() => remove(index)}>Remove Room</button>
            </div>
          ))}
          <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => append({})}>
            Add Room
          </button>
        </div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {message && <p className="mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default PropertyForm;
