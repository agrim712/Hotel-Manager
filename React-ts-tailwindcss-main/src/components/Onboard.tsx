import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import axios from "axios";
import { useState, useEffect } from "react";

type OptionType = { value: string; label: string };

interface FormData {
  propertyName: string;
  address: string;
  city: OptionType | null;
  country: OptionType | null;
  yourName: string;
  phoneCode: OptionType | null;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  propertyType: string;
  totalRooms: string;
  products: string[];
  currency: OptionType | null;
  rooms: {
    roomName: string;
    numOfRooms: string;
    maxGuests: string;
    rateType: OptionType | null;
    rate: string;
    extraAdultRate: string;
    roomNumbers: string;
  }[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/onboard";
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = "https://api.countrystatecity.in/v1/countries/[ciso]/cities";
const PHONE_CODE_API_URL = "https://restcountries.com/v3.1/all";
const API_KEY = "UlNueDJhekJaTVRsdHFqZ0tiNHdrT0JVZUdnOTZIdVA4VTgyMnFXcg==";
const currencyOptions: OptionType[] = [
  { value: "USD", label: "💵 USD - US Dollar" },
  { value: "INR", label: "🇮🇳 INR - Indian Rupee" },
  { value: "EUR", label: "💶 EUR - Euro" },
  { value: "GBP", label: "💷 GBP - British Pound" },
  { value: "JPY", label: "💴 JPY - Japanese Yen" },
];

const mealPlanOptions: OptionType[] = [
  { value: "Room Only", label: "Room Only" },
  { value: "Bed & Breakfast", label: "Bed & Breakfast" },
  { value: "Half Board", label: "Half Board" },
  { value: "Full Board", label: "Full Board" },
  { value: "All Inclusive", label: "All Inclusive" },
];


const PropertyForm: React.FC = () => {
  const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      rooms: [{ roomName: "", numOfRooms: "", maxGuests: "", rateType: null, rate: "", extraAdultRate: "", roomNumbers: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // State for dynamic options
  const [countryOptions, setCountryOptions] = useState<OptionType[]>([]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState<OptionType[]>([]);

  // Fetch countries and phone codes on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRY_API_URL, {
          headers: {
            "X-CSCAPI-KEY": API_KEY,
          },
        });
        setCountryOptions(
          response.data.map((country: any) => ({
            value: country.iso2,
            label: country.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    const fetchPhoneCodes = async () => {
      try {
        const response = await axios.get(PHONE_CODE_API_URL);
        const phoneCodes = response.data.map((country: any) => ({
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

  // Fetch cities based on selected country
  const fetchCities = async (countryCode: string) => {
    try {
      const response = await axios.get(CITY_API_URL.replace("[ciso]", countryCode), {
        headers: {
          "X-CSCAPI-KEY": API_KEY,
        },
      });
      setCityOptions(
        response.data.map((city: any) => ({
          value: city.name,
          label: city.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  // Watch for country changes
  const selectedCountry = watch("country");
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry.value);
    }
  }, [selectedCountry]);

  const products = watch("products") || [];

  const handleCheckboxChange = (value: string) => {
    const updatedProducts = products.includes(value)
      ? products.filter((item) => item !== value)
      : [...products, value];
    setValue("products", updatedProducts);
  };

  const onSubmit = async (data: FormData) => {
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
          roomNumbers: room.roomNumbers
            ? room.roomNumbers.split(",").map((num) => num.trim())
            : [],
        })),
      };

      console.log("📤 Sending Data:", JSON.stringify(formattedData, null, 2));
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
      <h2 className="text-2xl font-bold mb-4 bg-red-700 text-white p-3">Onboard Your Property</h2>

      {message && <div className={`p-2 text-white rounded-md ${message.includes("✅") ? "bg-green-500" : "bg-red-500"}`}>{message}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input {...register("propertyName", { required: "Property Name is required" })} placeholder="Property Name *" className="p-2 border rounded-md w-full" disabled={loading} />
            {errors.propertyName && <span className="text-red-500">{errors.propertyName.message}</span>}
          </div>
          <input {...register("address", { required: "Address is required" })} placeholder="Address" className="p-2 border rounded-md" disabled={loading} />
          <Controller
            name="country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <Select {...field} options={countryOptions} placeholder="Country *" isClearable isDisabled={loading} />
            )}
          />
          <Controller
            name="city"
            control={control}
            rules={{ required: "City is required" }}
            render={({ field }) => (
              <Select {...field} options={cityOptions} placeholder="City *" isClearable isDisabled={loading} />
            )}
          />
          <input {...register("yourName", { required: "Your Name is required" })} placeholder="Your Name *" className="p-2 border rounded-md" disabled={loading} />
          <div className="flex space-x-2">
            <Controller
              name="phoneCode"
              control={control}
              rules={{ required: "Phone Code is required" }}
              render={({ field }) => (
                <Select {...field} options={phoneCodeOptions} placeholder="Code" isClearable isDisabled={loading} />
              )}
            />
            <input
              {...register("phoneNumber", {
                required: "Phone Number is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Invalid phone number",
                },
              })}
              type="tel"
              placeholder="Phone No *"
              className="flex-1 p-2 border rounded-md"
              disabled={loading}
            />
          </div>
          <input
            {...register("whatsappNumber", {
              pattern: {
                value: /^\d+$/,
                message: "Invalid WhatsApp number",
              },
            })}
            type="tel"
            placeholder="WhatsApp Number"
            className="p-2 border rounded-md"
            disabled={loading}
          />
          <input
            {...register("totalRooms", { required: "Total rooms is required" })}
            type="number"
            placeholder="Total Rooms *"
            className="p-2 border rounded-md"
            disabled={loading}
          />
          {errors.totalRooms && <span className="text-red-500">{errors.totalRooms.message}</span>}
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            type="email"
            placeholder="Email *"
            className="p-2 border rounded-md"
            disabled={loading}
          />
        </div>

        {/* Property Type (Radio Buttons) */}
        <div>
          <label className="font-medium">Property Type *</label>
          <div className="flex space-x-4">
            <label><input {...register("propertyType", { required: "Property Type is required" })} type="radio" value="Hotel" disabled={loading} /> Hotel</label>
            <label><input {...register("propertyType", { required: "Property Type is required" })} type="radio" value="Vacation Rental" disabled={loading} /> Vacation Rental</label>
          </div>
          {errors.propertyType && <span className="text-red-500">{errors.propertyType.message}</span>}
        </div>

        {/* Products (Checkboxes) */}
        <div>
          <label className="font-medium">Select Products *</label>
          <div className="flex space-x-4">
            <label>
              <input
                type="checkbox"
                checked={products.includes("PMS")}
                onChange={() => handleCheckboxChange("PMS")}
                disabled={loading}
              />{" "}
              Property Management System
            </label>
            <label>
              <input
                type="checkbox"
                checked={products.includes("Channel Manager")}
                onChange={() => handleCheckboxChange("Channel Manager")}
                disabled={loading}
              />{" "}
              Channel Manager
            </label>
            <label>
              <input
                type="checkbox"
                checked={products.includes("RMS")}
                onChange={() => handleCheckboxChange("RMS")}
                disabled={loading}
              />{" "}
              Revenue Management System
            </label>
            <label>
              <input
                type="checkbox"
                checked={products.includes("All in One")}
                onChange={() => handleCheckboxChange("All in One")}
                disabled={loading}
              />{" "}
              All in One
            </label>
          </div>
        </div>

        <Controller
          name="currency"
          control={control}
          rules={{ required: "Currency is required" }}
          render={({ field }) => (
            <Select {...field} options={currencyOptions} placeholder="Currency *" isClearable isDisabled={loading} />
          )}
        />

        <h2 className="text-xl font-bold mt-6">Room Details</h2>
        {fields.map((room, index) => (
          <div key={room.id} className="grid grid-cols-4 gap-4 border p-4">
            <input {...register(`rooms.${index}.roomName`, { required: "Room Name is required" })} placeholder="Room Name *" className="p-2 border rounded-md" disabled={loading} />
            <input {...register(`rooms.${index}.numOfRooms`, { required: "Number of Rooms is required" })} type="number" placeholder="No. of Rooms *" className="p-2 border rounded-md" disabled={loading} />
            <input {...register(`rooms.${index}.maxGuests`, { required: "Max Guests is required" })} type="number" placeholder="Max Guests *" className="p-2 border rounded-md" disabled={loading} />
            <Controller
              name={`rooms.${index}.rateType`}
              control={control}
              rules={{ required: "Rate Type is required" }}
              render={({ field }) => (
                <Select {...field} options={mealPlanOptions} placeholder="Rate Type *" isClearable isDisabled={loading} />
              )}
            />
            <input {...register(`rooms.${index}.rate`, { required: "Rate is required" })} type="number" placeholder="Rate *" className="p-2 border rounded-md" disabled={loading} />
            <input {...register(`rooms.${index}.extraAdultRate`)} type="number" placeholder="Extra Adult Rate" className="p-2 border rounded-md" disabled={loading} />
            <input
              {...register(`rooms.${index}.roomNumbers`, {
                validate: (value) =>
                  !value || value.split(",").every((num) => /^\d+$/.test(num.trim())) || "Invalid room numbers",
              })}
              type="text"
              placeholder="Room Numbers"
              className="p-2 border rounded-md"
              disabled={loading}
            />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="bg-red-500 text-white p-2 rounded-md" disabled={loading}>
                ❌
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => append({ roomName: "", numOfRooms: "", maxGuests: "", rateType: null, rate: "", extraAdultRate: "", roomNumbers: "" })} className="bg-green-500 text-white p-2 rounded-md" disabled={loading}>
          + Add Room
        </button>

        <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md mt-4" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;