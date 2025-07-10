import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import Select from "react-select";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/hotel/onboard";
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = "https://api.countrystatecity.in/v1/countries/[ciso]/cities";
const PHONE_CODE_API_URL = "https://restcountries.com/v3.1/all";
const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = "http://localhost:5000/api"
const currencyOptions = [
  { value: "USD", label: "💵 USD - US Dollar" },
  { value: "INR", label: "🇮🇳 INR - Indian Rupee" },
  { value: "EUR", label: "💶 EUR - Euro" },
  { value: "GBP", label: "💷 GBP - British Pound" },
  { value: "JPY", label: "💴 JPY - Japanese Yen" },
];

const mealPlanOptions = [
  { value: "EP", label: "Room Only (EP - European Plan)" },
  { value: "CP", label: "Bed & Breakfast (CP - Continental Plan)" },
  { value: "MAP", label: "Half Board (MAP - Modified American Plan)" },
  { value: "AP", label: "Full Board (AP - American Plan)" },
  { value: "AI", label: "All Inclusive (AI)" },
  { value: "UAI", label: "Ultra All Inclusive (UAI)" },
];

const timezoneOptions = [
  { value: "GMT", label: "GMT (Greenwich Mean Time)" },
  { value: "IST", label: "IST (Indian Standard Time)" },
  { value: "EST", label: "EST (Eastern Standard Time)" },
  { value: "PST", label: "PST (Pacific Standard Time)" },
  { value: "CET", label: "CET (Central European Time)" },
];

const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
];
const amenitiesOptions = [
  {
    label: "Technology & Entertainment",
    options: [
      { value: "tv", label: "Television (Smart/Flat-screen)" },
      { value: "cable_tv", label: "Cable/Satellite Channels" },
      { value: "wifi", label: "High-Speed WiFi" },
      { value: "bluetooth_speaker", label: "Bluetooth Speaker" },
      { value: "in_room_tablet", label: "In-Room Tablet Control" },
      { value: "usb_ports", label: "USB Charging Ports" },
      { value: "alarm_clock", label: "Alarm Clock with Charger" },
      { value: "telephone", label: "Telephone (Service Dial)" },
      { value: "cd_dvd_player", label: "CD/DVD Player" },
    ],
  },
  {
    label: "Comfort & Climate",
    options: [
      { value: "ac", label: "Air Conditioning" },
      { value: "heater", label: "Heating" },
      { value: "blackout_curtains", label: "Blackout Curtains" },
      { value: "soundproofing", label: "Soundproofing" },
      { value: "air_purifier", label: "Air Purifier" },
      { value: "fireplace", label: "Fireplace" },
    ],
  },
  {
    label: "Bath & Toiletries",
    options: [
      { value: "bathtub", label: "Bathtub" },
      { value: "rain_shower", label: "Rain Shower" },
      { value: "heated_floors", label: "Heated Bathroom Floors" },
      { value: "toiletries", label: "Luxury Toiletries" },
      { value: "hairdryer", label: "Hair Dryer" },
      { value: "bathrobes_slippers", label: "Bathrobes & Slippers" },
      { value: "magnifying_mirror", label: "Magnifying Mirror" },
      { value: "dental_kit", label: "Dental Kit" },
      { value: "shaving_kit", label: "Shaving Kit" },
      { value: "shower_cap", label: "Shower Cap & Vanity Kit" },
    ],
  },
  {
    label: "Refreshments",
    options: [
      { value: "minibar", label: "Minibar" },
      { value: "coffee_tea", label: "Coffee/Tea Making Facilities" },
      { value: "bottled_water", label: "Complimentary Bottled Water" },
      { value: "welcome_snacks", label: "Welcome Snacks / Drinks" },
      { value: "room_service", label: "Room Service (24-hour)" },
    ],
  },
  {
    label: "Furnishings & Storage",
    options: [
      { value: "safe", label: "In-Room Safe" },
      { value: "wardrobe", label: "Wardrobe / Closet" },
      { value: "iron_board", label: "Iron & Ironing Board" },
      { value: "luggage_rack", label: "Luggage Rack" },
      { value: "desk_chair", label: "Desk & Chair" },
      { value: "stationery", label: "Stationery Set" },
      { value: "laundry_bag", label: "Laundry Bag & Price List" },
    ],
  },
  {
    label: "Specialty Amenities",
    options: [
      { value: "balcony", label: "Private Balcony with View" },
      { value: "hot_tub", label: "In-Room Hot Tub" },
      { value: "chaise_lounge", label: "Chaise Lounge / Seating Area" },
      { value: "kitchenette", label: "Kitchenette (Microwave, Sink, Stove)" },
      { value: "washer_dryer", label: "Washer & Dryer" },
      { value: "personalized_gifts", label: "Personalized Welcome Gifts" },
    ],
  },
];


const hotelAmenitiesOptions = [
  {
    label: "Essential In-Room Amenities",
    options: [
      { value: "high_quality_bedding", label: "High-Quality Bedding" },
      { value: "toiletries", label: "Toiletries (Shampoo, Conditioner, etc.)" },
      { value: "hairdryer", label: "Hairdryer" },
      { value: "bathrobes_slippers", label: "Bathrobes & Slippers" },
      { value: "dental_shaving_kit", label: "Dental/Shaving Kit" },
      { value: "wardrobe", label: "Wardrobe" },
      { value: "safe", label: "Safe Deposit Box" },
      { value: "desk_chair", label: "Desk & Chair" },
      { value: "flat_screen_tv", label: "Flat-Screen TV" },
      { value: "usb_ports", label: "USB Charging Ports" },
      { value: "wifi", label: "High-Speed Wi-Fi" },
      { value: "minibar", label: "Minibar" },
      { value: "coffee_tea_station", label: "Coffee/Tea Station" },
      { value: "complimentary_water", label: "Complimentary Water" },
    ],
  },
  {
    label: "Wellness & Fitness",
    options: [
      { value: "spa", label: "Spa Services" },
      { value: "gym", label: "Gym / Fitness Center" },
      { value: "yoga", label: "Yoga Mats / Guided Yoga" },
      { value: "swimming_pool", label: "Swimming Pool" },
      { value: "jacuzzi", label: "Hot Tub / Jacuzzi" },
      { value: "sauna", label: "Sauna / Steam Room" },
    ],
  },
  {
    label: "Dining & Beverage",
    options: [
      { value: "restaurant", label: "Restaurant" },
      { value: "room_service", label: "24-Hour Room Service" },
      { value: "bar", label: "Bar / Rooftop Bar" },
      { value: "breakfast_buffet", label: "Breakfast Buffet" },
      { value: "welcome_basket", label: "Local Flavor Welcome Basket" },
    ],
  },
  {
    label: "Business & Tech",
    options: [
      { value: "conference_room", label: "Conference Room" },
      { value: "business_center", label: "Business Center" },
      { value: "coworking_lounge", label: "Coworking Lounge" },
      { value: "av_equipment", label: "A/V Equipment & Projectors" },
      { value: "mobile_checkin", label: "Mobile Check-in / Keyless Entry" },
      { value: "smart_controls", label: "In-Room Tablet / Smart Controls" },
    ],
  },
  {
    label: "Leisure & Entertainment",
    options: [
      { value: "game_room", label: "Game Room" },
      { value: "movie_screenings", label: "Movie Screenings" },
      { value: "kids_club", label: "Kids' Club" },
      { value: "bike_rentals", label: "Bike Rentals / Tours" },
      { value: "golf_simulator", label: "Golf Simulator" },
      { value: "art_gallery", label: "Onsite Art Gallery" },
    ],
  },
  {
    label: "Luxury & Boutique Add-Ons",
    options: [
      { value: "butler_service", label: "Butler Service" },
      { value: "private_balcony", label: "Private Balcony" },
      { value: "chauffeur_car", label: "Chauffeur-Driven Car" },
      { value: "welcome_gift", label: "Welcome Gift (Fruit/Champagne)" },
      { value: "eco_amenities", label: "Eco-Friendly Toiletries" },
      { value: "energy_lighting", label: "Energy-Efficient Lighting" },
    ],
  },
  {
    label: "Family & Pet-Friendly",
    options: [
      { value: "cribs", label: "Cribs / Infant Supplies" },
      { value: "strollers", label: "Strollers" },
      { value: "pet_beds", label: "Pet Beds & Bowls" },
      { value: "pet_grooming", label: "Pet Grooming Services" },
      { value: "themed_rooms", label: "Family / Themed Rooms" },
    ],
  },
  {
    label: "Accessibility & Convenience",
    options: [
      { value: "roll_in_showers", label: "Roll-in Showers" },
      { value: "accessible_ramps", label: "Accessible Ramps & Entrances" },
      { value: "visual_alarms", label: "Visual Fire Alarms" },
      { value: "laundry", label: "Laundry / Ironing Service" },
      { value: "luggage_storage", label: "Luggage Storage" },
      { value: "concierge", label: "Concierge Services" },
      { value: "free_parking", label: "Free Parking" },
      { value: "airport_shuttle", label: "Airport Shuttle" },
    ],
  },
];


  const productOptions = [
    { value: "Spa Management", label: "Spa Management" },
    { value: "PMS", label: "Property Management System (PMS)" },
    { value: "RMS", label: "Revenue Management System (RMS)" },
    { value: "Bar Management", label: "Bar Management" },
    { value: "Restaurant Management", label: "Restaurant Management" },
    { value: "Laundry Management", label: "Laundry Management" },
    { value: "Cab/Travel Management", label: "Cab/Travel Management" },
  ];
const PropertyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);
  const [activeSection, setActiveSection] = useState("basic");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  // Default form values
  const getDefaultValues = () => ({
    // Basic Information
    propertyName: "",
    brandAffiliation: "",
    hotelCategory: "",
    registeredAddress: "",
    operationalAddress: "",
    country: null,
    state: "",
    city: null,
    pinCode: "",
    timeZone: null,
    preferredLanguage: null,
    hotelAmenities: [],
    website: "",
    googleMapsLink: "",

    // Contact Information
    yourName: "",
    phoneCode: null,
    phoneNumber: "",
    reservationNumber: "",
    managementNumber: "",
    email: "",
    reservationEmail: "",
    managementEmail: "",
    whatsappNumber: "",

    // Government & Tax Details
    panNumber: "",
    gstin: "",
    fssaiLicense: "",
    fireSafetyCert: "",
    tradeLicense: "",
    alcoholLicense: "",
    tourismRegistration: "",
    companyRegistration: "",

    // Property Details
    totalRooms: "",
    propertyType: "",
    currency: null,

    // Rooms
    rooms: [{ 
      name: "", 
      numOfRooms: "", 
      maxGuests: "", 
      rateType: null, 
      rate: "", 
      extraAdultRate: "", 
      roomNumbers: "",
      amenities: [],
      smoking: "non-smoking",
      extraBedPolicy: "",
      childPolicy: "",
      roomImages: []
    }],

    // Operations
    checkInTime: "",
    checkOutTime: "",
    earlyCheckInPolicy: "",
    lateCheckOutPolicy: "",
    cancellationPolicy: "",
    noShowPolicy: "",

    // Accounting
    invoiceFormat: "",
    bankAccounts: [{
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "",
      branch: ""
    }],
    paymentModes: [],

    // OTA
    otas: [],
    channelManager: "",
    bookingEngine: "",

    // Products
    products: []
  });

  const { 
    register, 
    handleSubmit, 
    control, 
    reset, 
    formState: { errors }, 
    watch, 
    setValue 
  } = useForm({
    defaultValues: getDefaultValues()
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control,
    name: "rooms",
  });

  const { fields: bankAccountsFields, append: appendBankAccount, remove: removeBankAccount } = useFieldArray({
    control,
    name: "bankAccounts",
  });

  // Data transformation functions
  // Data transformation functions
const transformSavedData = (savedData) => {
  if (!savedData) return getDefaultValues();

  const normalizeSelectValue = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return { label: value, value: value };
      }
    }
    return null;
  };

  // Function to find amenity option by value
  const findAmenityOption = (value) => {
    for (const group of hotelAmenitiesOptions) {
      const found = group.options.find(opt => opt.value === value);
      if (found) return found;
    }
    return { label: value, value: value };
  };

  const transformRoomImages = (images) => {
    if (!Array.isArray(images)) return [];
    
    return images.map(img => {
      // Handle already processed objects
      if (img?.preview || img?.url) return img;
      
      // Handle string paths from saved data
      if (typeof img === 'string' || img?.path) {
        const imgPath = img.path || img;
        return {
          path: imgPath,
          name: imgPath.split('/').pop(),
          preview: `${API_BASE_URL}/hotel/photos/${imgPath}`,
          url: `${API_BASE_URL}/hotel/photos/${imgPath}`
        };
      }
      
      // Default fallback
      return {
        path: 'invalid-image',
        name: 'invalid-image',
        preview: '/placeholder-image.jpg'
      };
    });
  };


  return {
    ...getDefaultValues(),
    ...savedData,
    country: normalizeSelectValue(savedData.country),
    city: normalizeSelectValue(savedData.city),
    timeZone: normalizeSelectValue(savedData.timeZone),
    preferredLanguage: normalizeSelectValue(savedData.preferredLanguage),
    currency: normalizeSelectValue(savedData.currency),
    
    // Handle hotel amenities transformation
    hotelAmenities: Array.isArray(savedData.hotelAmenities) 
      ? savedData.hotelAmenities.map(value => {
          if (typeof value === 'object') return value;
          return findAmenityOption(value);
        })
      : [],
    
    rooms: Array.isArray(savedData.rooms) 
      ? savedData.rooms.map(room => ({
          ...room,
          rateType: normalizeSelectValue(room.rateType),
          amenities: Array.isArray(room.amenities) 
            ? room.amenities.map(value => {
                if (typeof value === 'object') return value;
                return { label: value, value: value };
              })
            : [],
          // Transform room images
          roomImages: transformRoomImages(room.roomImages)
        }))
      : getDefaultValues().rooms,
    
    bankAccounts: Array.isArray(savedData.bankAccounts) 
      ? savedData.bankAccounts 
      : getDefaultValues().bankAccounts,
    
    paymentModes: Array.isArray(savedData.paymentModes) ? savedData.paymentModes : [],
    otas: Array.isArray(savedData.otas) ? savedData.otas : [],
    products: Array.isArray(savedData.products) ? savedData.products : []
  };
};

// Add this cleanup effect in your component (outside transformSavedData)
useEffect(() => {
  return () => {
    // Clean up object URLs when component unmounts
    watch('rooms')?.forEach(room => {
      room.roomImages?.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    });
  };
}, [watch]);

  const prepareDataForSave = (formData) => {
    const simplifySelectValue = (value) => {
      if (!value) return null;
      return typeof value === 'object' ? value : null;
    };

    return {
      ...formData,
      country: simplifySelectValue(formData.country),
      city: simplifySelectValue(formData.city),
      timeZone: simplifySelectValue(formData.timeZone),
      preferredLanguage: simplifySelectValue(formData.preferredLanguage),
      currency: simplifySelectValue(formData.currency),
      rooms: formData.rooms.map(room => ({
        ...room,
        rateType: simplifySelectValue(room.rateType),
        roomImages: room.roomImages?.map(img => img.path || img.name) || [],
        amenities: room.amenities.map(amenity => 
          typeof amenity === 'object' ? amenity.value : amenity
        )
      })),
      hotelAmenities: formData.hotelAmenities.map(amenity => 
        typeof amenity === 'object' ? amenity.value : amenity
      )
    };
  };

  // Fetch initial data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRY_API_URL, {
          headers: { "X-CSCAPI-KEY": API_KEY },
        });
        setCountryOptions(
          response.data.map((country) => ({
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

  // Fetch saved form data
useEffect(() => {
  const fetchSavedForm = async () => {
    try {
      setIsLoadingSavedData(true); // Set loading state at start
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/hotel/get-saved-form`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const saved = response.data?.data;

      if (saved?.formData) {
        const transformedData = transformSavedData(saved.formData);
        
        reset(transformedData, {
          keepDefaultValues: false,
          keepValues: false,
        });

        // Clear and re-add rooms
        removeRoom();
        if (transformedData.rooms && transformedData.rooms.length > 0) {
          appendRoom(transformedData.rooms);
        }

        // Clear and re-add bank accounts
        removeBankAccount();
        if (transformedData.bankAccounts && transformedData.bankAccounts.length > 0) {
          appendBankAccount(transformedData.bankAccounts);
        }

        setActiveSection(saved.currentSection || "basic");
        setUploadedFiles(saved.uploadedFiles || {});
      }
    } catch (error) {
      console.error("Failed to fetch saved form:", error);
    } finally {
      setIsLoadingSavedData(false);
      setLoading(false);
    }
  };

  fetchSavedForm();
}, [reset, appendRoom, removeRoom, appendBankAccount, removeBankAccount]);



  const fetchCities = async (countryCode) => {
    try {
      const response = await axios.get(CITY_API_URL.replace("[ciso]", countryCode), {
        headers: { "X-CSCAPI-KEY": API_KEY },
      });
      setCityOptions(
        response.data.map((city) => ({
          value: city.name,
          label: city.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  const selectedCountry = watch("country");
  useEffect(() => {
    if (selectedCountry?.value) {
      fetchCities(selectedCountry.value);
    }
  }, [selectedCountry]);

const handleFileUpload = (fieldName, file) => {
  if (!file) {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
    return;
  }

  // Common validation for all files
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    setMessage(`❌ Invalid file type for ${fieldName}. Please upload JPG, PNG, or PDF.`);
    return;
  }

  if (file.size > maxSize) {
    setMessage(`❌ File too large for ${fieldName}. Maximum size is 2MB.`);
    return;
  }

  setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
};
const handleRoomImageUpload = async (roomIndex, files) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('images', file));

    const response = await axios.post(
      `${API_BASE_URL}/hotel/upload-room-images`, 
      formData, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Create new image objects with previews
    const newImages = response.data.images.map(img => ({
      path: img.filename,
      url: img.url,
      preview: img.url, // Use the server URL as preview
      name: img.filename
    }));

    // Get current images and add new ones
    const currentImages = watch(`rooms.${roomIndex}.roomImages`) || [];
    const updatedImages = [...currentImages, ...newImages];

    // Validate total count
    if (updatedImages.length < 4 || updatedImages.length > 7) {
      alert("Please ensure total images are between 4 to 7");
      return;
    }

    // Update form state
    setValue(`rooms.${roomIndex}.roomImages`, updatedImages);

  } catch (error) {
    console.error('Upload failed:', error);
    setMessage("❌ Failed to upload images: " + (error.response?.data?.message || error.message));
  }
};
const sectionValidations = {
  basic: (data) => {
    const errors = [];
    if (!data.propertyName) errors.push("Hotel Name is required");
    if (!data.hotelCategory) errors.push("Hotel Category is required");
    if (!data.registeredAddress) errors.push("Registered Address is required");
    if (!data.country) errors.push("Country is required");
    if (!data.state) errors.push("State is required");
    if (!data.city) errors.push("City is required");
    if (!data.pinCode) errors.push("Pin Code is required");
    if (!data.timeZone) errors.push("Time Zone is required");
    if (!data.preferredLanguage) errors.push("Preferred Language is required");
    return errors;
  },
  contact: (data) => {
    const errors = [];
    if (!data.yourName) errors.push("Contact Person is required");
    if (!data.phoneNumber) errors.push("Phone Number is required");
    if (!data.email) errors.push("Email is required");
    return errors;
  },
  government: (data) => {
    const errors = [];
    if (!data.panNumber) errors.push("PAN Number is required");
    return errors;
  },
  rooms: (data) => {
    const errors = [];
    if (!data.totalRooms) errors.push("Total Rooms is required");
    if (!data.currency) errors.push("Currency is required");
    
    data.rooms.forEach((room, index) => {
      if (!room.name) errors.push(`Room ${index + 1}: Name is required`);
      if (!room.numOfRooms) errors.push(`Room ${index + 1}: Number of rooms is required`);
      if (!room.maxGuests) errors.push(`Room ${index + 1}: Max guests is required`);
      if (!room.rateType) errors.push(`Room ${index + 1}: Rate type is required`);
      if (!room.rate) errors.push(`Room ${index + 1}: Rate is required`);
      if (!room.roomNumbers) errors.push(`Room ${index + 1}: Room numbers are required`);
      
      if (!room.roomImages || room.roomImages.length < 4 || room.roomImages.length > 7) {
        errors.push(`Room ${index + 1}: 4-7 images are required`);
      }
    });
    
    return errors;
  },
  operations: (data) => {
    const errors = [];
    if (!data.checkInTime) errors.push("Check-in time is required");
    if (!data.checkOutTime) errors.push("Check-out time is required");
    if (!data.cancellationPolicy) errors.push("Cancellation policy is required");
    return errors;
  },
  accounting: (data) => {
    const errors = [];
    if (!data.bankAccounts || data.bankAccounts.length === 0) {
      errors.push("At least one bank account is required");
    } else {
      data.bankAccounts.forEach((account, index) => {
        if (!account.accountHolderName) errors.push(`Bank Account ${index + 1}: Account holder name is required`);
        if (!account.bankName) errors.push(`Bank Account ${index + 1}: Bank name is required`);
        if (!account.accountNumber) errors.push(`Bank Account ${index + 1}: Account number is required`);
        if (!account.ifscCode) errors.push(`Bank Account ${index + 1}: IFSC code is required`);
        if (!account.accountType) errors.push(`Bank Account ${index + 1}: Account type is required`);
        if (!account.branch) errors.push(`Bank Account ${index + 1}: Branch is required`);
      });
    }
    if (!data.paymentModes || data.paymentModes.length === 0) {
      errors.push("At least one payment mode is required");
    }
    return errors;
  },
  uploads: (data) => {
    const errors = [];
    if (!uploadedFiles.panCard) errors.push("PAN Card copy is required");
    if (!uploadedFiles.cancelledCheque) errors.push("Cancelled Cheque is required");
    if (!uploadedFiles.idProof) errors.push("ID Proof is required");
    return errors;
  },
  // Add empty validators for optional sections
  ota: () => [], // No validation for OTA section
  products: () => [] // No validation for Products section
};
  const saveFormData = async (data, section) => {
    setLoading(true);
    try {
          // Validate the current section
    const validationErrors = sectionValidations[section](data);
        if (validationErrors.length > 0) {
      setMessage(`❌ Please fix these errors: ${validationErrors.join(", ")}`);
      setLoading(false);
      return;
    }
      const token = localStorage.getItem('token');
      const dataToSave = prepareDataForSave(data);
      
      await axios.post(
        `${API_BASE_URL}/hotel/save-form`, 
        { 
          data: dataToSave,
          currentSection: section,
          uploadedFiles 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsFormSaved(true);
      setMessage("✅ Progress saved successfully!");
      
      const currentIndex = sections.findIndex(s => s.id === activeSection);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
      }
    } catch (error) {
      setMessage("❌ Failed to save progress: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
      const sections = [
    { id: "basic", name: "Basic Info" },
    { id: "contact", name: "Contact Info" },
    { id: "government", name: "Govt & Tax" },
    { id: "rooms", name: "Room Setup" },
    { id: "operations", name: "Operations" },
    { id: "accounting", name: "Accounting" },
    { id: "ota", name: "OTA" },
    { id: "products", name: "Products" },
    { id: "uploads", name: "Documents" }
  ];

const onSubmit = async (formData) => {
  setLoading(true);
  setMessage("");

  try {
    // Validate all required sections
    const allErrors = [];
    sections.forEach(section => {
      if (section.id !== "products" && section.id !== "ota") {
        const errors = sectionValidations[section.id](formData);
        allErrors.push(...errors);
      }
    });

    // Validate uploaded files
    const requiredFiles = ["panCard", "cancelledCheque", "idProof"];
    requiredFiles.forEach(file => {
      if (!uploadedFiles[file]) {
        allErrors.push(`${file} is required`);
      }
    });

    if (allErrors.length > 0) {
      setMessage(`❌ Please fix these errors: ${allErrors.join(", ")}`);
      setLoading(false);
      return;
    }

    // Prepare the formatted data for backend
    const formattedData = {
      name: formData.propertyName,
      brandAffiliation: formData.brandAffiliation,
      hotelCategory: formData.hotelCategory,
      registeredAddress: formData.registeredAddress,
      operationalAddress: formData.operationalAddress || formData.registeredAddress,
      country: formData.country?.label || "",
      state: formData.state,
      city: formData.city?.label || "",
      pinCode: formData.pinCode,
      timeZone: formData.timeZone?.value || "",
      preferredLanguage: formData.preferredLanguage?.value || "",
      hotelAmenities: formData.hotelAmenities?.map(a => a.value) || [],
      contactPerson: formData.yourName,
      phoneCode: formData.phoneCode?.value || "",
      phoneNumber: formData.phoneNumber,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email,
      website: formData.website,
      googleMapsLink: formData.googleMapsLink,
      totalRooms: parseInt(formData.totalRooms, 10),
      propertyType: formData.propertyType,
      currency: formData.currency?.value || "",
      panNumber: formData.panNumber,
      gstin: formData.gstin,
      fssaiLicense: formData.fssaiLicense,
      fireSafetyCert: formData.fireSafetyCert,
      tradeLicense: formData.tradeLicense,
      alcoholLicense: formData.alcoholLicense,
      tourismRegistration: formData.tourismRegistration,
      companyRegistration: formData.companyRegistration,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      earlyCheckInPolicy: formData.earlyCheckInPolicy,
      lateCheckOutPolicy: formData.lateCheckOutPolicy,
      cancellationPolicy: formData.cancellationPolicy,
      noShowPolicy: formData.noShowPolicy,
      invoiceFormat: formData.invoiceFormat,
      bankAccounts: formData.bankAccounts,
      paymentModes: formData.paymentModes,
      otas: formData.otas,
      channelManager: formData.channelManager,
      rooms: formData.rooms.map((room) => ({
        name: room.name,
        numOfRooms: parseInt(room.numOfRooms, 10),
        maxGuests: parseInt(room.maxGuests, 10),
        rateType: room.rateType?.value || room.rateType || "",
        rate: parseFloat(room.rate),
        extraAdultRate: parseFloat(room.extraAdultRate),
        roomNumbers: room.roomNumbers.split(",").map(num => num.trim()),
        amenities: room.amenities.map(a => a.value),
        smoking: room.smoking,
        extraBedPolicy: room.extraBedPolicy,
        childPolicy: room.childPolicy,
        roomImages: room.roomImages?.map(img => img.path || img.name) || []
      })),
      products: formData.products || []
    };

    console.log("🟢 formattedData:", formattedData);

    // Build submissionFormattedData to log what is being sent
    const submissionFormattedData = {
      ...formattedData,
      uploadedFiles: {
        hotelLogo: uploadedFiles.hotelLogo?.name || null,
        panCard: uploadedFiles.panCard?.name || null,
        cancelledCheque: uploadedFiles.cancelledCheque?.name || null,
        idProof: uploadedFiles.idProof?.name || null,
        propertyImages: Array.isArray(uploadedFiles.propertyImages)
          ? uploadedFiles.propertyImages.map(f => f.name)
          : []
      }
    };

    console.log("📦 submissionFormattedData:", submissionFormattedData);

    // Build the FormData for transmission
    const submissionFormData = new FormData();

    // Attach main data blob
    const jsonBlob = new Blob([JSON.stringify(formattedData)], { type: 'application/json' });
    submissionFormData.append('data', jsonBlob);

    // Attach uploaded files
    Object.entries(uploadedFiles).forEach(([key, file]) => {
      if (file) {
        if (Array.isArray(file)) {
          file.forEach((f, index) => {
            submissionFormData.append(`${key}[${index}]`, f);
          });
        } else {
          submissionFormData.append(key, file);
        }
      }
    });

    // Attach room images
    formattedData.rooms.forEach((room, roomIndex) => {
      if (room.roomImages && Array.isArray(room.roomImages)) {
        room.roomImages.forEach((img, imgIndex) => {
          if (img instanceof File) {
            submissionFormData.append(`rooms[${roomIndex}][images][${imgIndex}]`, img);
          } else if (img.path) {
            submissionFormData.append(`rooms[${roomIndex}][imagePaths][${imgIndex}]`, img.path);
          }
        });
      }
    });

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/hotel/onboard`,
      submissionFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setMessage(`Uploading: ${percentCompleted}%`);
        }
      }
    );

    setMessage("✅ Property onboarded successfully!");
    reset();
    navigate('/payment', { state: formattedData });

  } catch (error) {
    console.error("❌ Submission error:", error);

    let errorMessage = "❌ Failed to onboard property";
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "❌ Session expired. Please log in again.";
        localStorage.removeItem("token");
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.response.data?.message) {
        errorMessage = `❌ ${error.response.data.message}`;
      } else if (error.response.data?.error) {
        errorMessage = `❌ ${error.response.data.error}`;
      }
    } else if (error.message) {
      errorMessage = `❌ ${error.message}`;
    }

    setMessage(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const renderSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Name - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                <input 
                  {...register("propertyName", { required: "Hotel Name is required" })} 
                  placeholder="Enter your hotel name" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.propertyName && <span className="text-red-500 text-sm mt-1">{errors.propertyName.message}</span>}
              </div>
              
              {/* Brand Affiliation - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand/Group Affiliation</label>
                <input 
                  {...register("brandAffiliation")} 
                  placeholder="Enter brand/group name if any" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
              </div>

              {/* Hotel Category - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Category *</label>
                <select
                  {...register("hotelCategory", { required: "Hotel Category is required" })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                >
                  <option value="">Select category</option>
                  <option value="Budget">Budget</option>
                  <option value="3-Star">3-Star</option>
                  <option value="4-Star">4-Star</option>
                  <option value="5-Star">5-Star</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Resort">Resort</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Business">Business</option>
                </select>
                {errors.hotelCategory && <span className="text-red-500 text-sm mt-1">{errors.hotelCategory.message}</span>}
              </div>

              {/* Registered Address - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registered Address *</label>
                <input 
                  {...register("registeredAddress", { required: "Registered Address is required" })} 
                  placeholder="Enter registered address" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.registeredAddress && <span className="text-red-500 text-sm mt-1">{errors.registeredAddress.message}</span>}
              </div>

              {/* Operational Address - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operational Address (if different)</label>
                <input 
                  {...register("operationalAddress")} 
                  placeholder="Enter operational address if different" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
              </div>

              {/* Country - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: "Country is required" }}
                  render={({ field }) => (
                    <Select 
                      {...field} 
                      options={countryOptions} 
                      placeholder="Select country" 
                      isClearable 
                      isDisabled={loading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.country && <span className="text-red-500 text-sm mt-1">{errors.country.message}</span>}
              </div>

              {/* State - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input 
                  {...register("state", { required: "State is required" })} 
                  placeholder="Enter state" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.state && <span className="text-red-500 text-sm mt-1">{errors.state.message}</span>}
              </div>

              {/* City - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <Select 
                      {...field} 
                      options={cityOptions} 
                      placeholder="Select city" 
                      isClearable 
                      isDisabled={loading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.city && <span className="text-red-500 text-sm mt-1">{errors.city.message}</span>}
              </div>

              {/* Pin Code - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code *</label>
                <input 
                  {...register("pinCode", { 
                    required: "Pin Code is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Invalid Pin Code (must be 6 digits)"
                    }
                  })} 
                  placeholder="Enter pin code" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.pinCode && <span className="text-red-500 text-sm mt-1">{errors.pinCode.message}</span>}
              </div>

              {/* Time Zone - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone *</label>
                <Controller
                  name="timeZone"
                  control={control}
                  rules={{ required: "Time Zone is required" }}
                  render={({ field }) => (
                    <Select 
                      {...field} 
                      options={timezoneOptions} 
                      placeholder="Select time zone" 
                      isClearable 
                      isDisabled={loading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.timeZone && <span className="text-red-500 text-sm mt-1">{errors.timeZone.message}</span>}
              </div>

              {/* Preferred Language - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language *</label>
                <Controller
                  name="preferredLanguage"
                  control={control}
                  rules={{ required: "Language is required" }}
                  render={({ field }) => (
                    <Select 
                      {...field} 
                      options={languageOptions} 
                      placeholder="Select language" 
                      isClearable 
                      isDisabled={loading}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.preferredLanguage && <span className="text-red-500 text-sm mt-1">{errors.preferredLanguage.message}</span>}
              </div>

              {/* Hotel Amenities - Optional */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Amenities</label>
  <Controller
    name="hotelAmenities"
    control={control}
    render={({ field }) => (
      <CreatableSelect
        {...field}
        options={hotelAmenitiesOptions}
        placeholder="Select or type to add amenities"
        isMulti
        isClearable
        isDisabled={loading}
        className="react-select-container"
        classNamePrefix="react-select"
        isValidNewOption={(inputValue) => {
  const currentAmenities = field.value || [];
  return !currentAmenities.some(
    opt =>
      typeof opt?.value === 'string' &&
      opt.value.toLowerCase() === inputValue.toLowerCase()
  );
}}
        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: '44px',
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 9999,
          }),
        }}
      />
    )}
  />
</div>

              {/* Website - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input 
                  {...register("website", {
                    pattern: {
                      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: "Invalid website URL"
                    }
                  })} 
                  placeholder="Enter website URL" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.website && <span className="text-red-500 text-sm mt-1">{errors.website.message}</span>}
              </div>

              {/* Google Maps Link - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                <input 
                  {...register("googleMapsLink", {
                    pattern: {
                      value: /^(https?:\/\/)?(www\.)?google\.[a-z]+\/maps\/.+$/,
                      message: "Invalid Google Maps link"
                    }
                  })} 
                  placeholder="Enter Google Maps link" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.googleMapsLink && <span className="text-red-500 text-sm mt-1">{errors.googleMapsLink.message}</span>}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Person - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                <input 
                  {...register("yourName", { required: "Contact Person is required" })} 
                  placeholder="Enter contact person name" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                  disabled={loading} 
                />
                {errors.yourName && <span className="text-red-500 text-sm mt-1">{errors.yourName.message}</span>}
              </div>

              {/* Front Desk Number - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Front Desk Number *</label>
                <div className="flex space-x-2">
                  <Controller
                    name="phoneCode"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        {...field} 
                        options={phoneCodeOptions} 
                        placeholder="+91" 
                        isClearable 
                        isDisabled={loading}
                        className="react-select-container flex-1"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                  <input
                    {...register("phoneNumber", {
                      required: "Phone Number is required",
                      pattern: { value: /^\d+$/, message: "Invalid phone number" },
                    })}
                    type="tel"
                    placeholder="Enter phone number"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                </div>
                {errors.phoneNumber && <span className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</span>}
              </div>

              {/* Reservation Number - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Number</label>
                <input
                  {...register("reservationNumber", {
                    pattern: { value: /^\d+$/, message: "Invalid phone number" },
                  })}
                  type="tel"
                  placeholder="Enter reservation number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.reservationNumber && <span className="text-red-500 text-sm mt-1">{errors.reservationNumber.message}</span>}
              </div>

              {/* Management Number - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Management Number</label>
                <input
                  {...register("managementNumber", {
                    pattern: { value: /^\d+$/, message: "Invalid phone number" },
                  })}
                  type="tel"
                  placeholder="Enter management number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.managementNumber && <span className="text-red-500 text-sm mt-1">{errors.managementNumber.message}</span>}
              </div>

              {/* Official Email - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Official Email *</label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                  type="email"
                  placeholder="Enter official email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
              </div>

              {/* Reservation Email - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Email</label>
                <input
                  {...register("reservationEmail", {
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                  type="email"
                  placeholder="Enter reservation email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.reservationEmail && <span className="text-red-500 text-sm mt-1">{errors.reservationEmail.message}</span>}
              </div>

              {/* Management Email - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Management Email</label>
                <input
                  {...register("managementEmail", {
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                  type="email"
                  placeholder="Enter management email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.managementEmail && <span className="text-red-500 text-sm mt-1">{errors.managementEmail.message}</span>}
              </div>

              {/* WhatsApp Number - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  {...register("whatsappNumber", {
                    pattern: { value: /^\d+$/, message: "Invalid WhatsApp number" },
                  })}
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.whatsappNumber && <span className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</span>}
              </div>
            </div>
          </div>
        );

      case "government":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
              Government & Tax Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PAN Number - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number *</label>
                <input
                  {...register("panNumber", {
                    required: "PAN Number is required",
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "Invalid PAN format (e.g., ABCDE1234F)"
                    }
                  })}
                  placeholder="Enter PAN number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.panNumber && <span className="text-red-500 text-sm mt-1">{errors.panNumber.message}</span>}
              </div>

              {/* GSTIN - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                <input
                  {...register("gstin", {
                    pattern: {
                      value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                      message: "Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)"
                    }
                  })}
                  placeholder="Enter GSTIN"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.gstin && <span className="text-red-500 text-sm mt-1">{errors.gstin.message}</span>}
              </div>

              {/* FSSAI License - Optional if no F&B */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License (for F&B)</label>
                <input
                  {...register("fssaiLicense")}
                  placeholder="Enter FSSAI license number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Fire Safety Certificate - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fire Safety Certificate </label>
                <input
                  {...register("fireSafetyCert")}
                  placeholder="Enter fire safety certificate number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.fireSafetyCert && <span className="text-red-500 text-sm mt-1">{errors.fireSafetyCert.message}</span>}
              </div>

              {/* Trade License - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade License </label>
                <input
                  {...register("tradeLicense")}
                  placeholder="Enter trade license number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.tradeLicense && <span className="text-red-500 text-sm mt-1">{errors.tradeLicense.message}</span>}
              </div>

              {/* Alcohol License - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alcohol License (if applicable)</label>
                <input
                  {...register("alcoholLicense")}
                  placeholder="Enter alcohol license number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Tourism Registration - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tourism Registration Certificate</label>
                <input
                  {...register("tourismRegistration")}
                  placeholder="Enter tourism registration number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Company Registration - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Registration (if Pvt Ltd/LLP)</label>
                <input
                  {...register("companyRegistration")}
                  placeholder="Enter company registration number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

      case "rooms":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
              Room & Inventory Setup
            </h2>
            <div className="space-y-6">
              {/* Total Rooms - Mandatory */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-gray-800 mb-4">General Room Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Number of Rooms *</label>
                    <input
                      {...register("totalRooms", { required: "Total rooms is required" })}
                      type="number"
                      placeholder="Enter total number of rooms"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      disabled={loading}
                    />
                    {errors.totalRooms && <span className="text-red-500 text-sm mt-1">{errors.totalRooms.message}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                    <Controller
                      name="currency"
                      control={control}
                      rules={{ required: "Currency is required" }}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          options={currencyOptions} 
                          placeholder="Select currency" 
                          isClearable 
                          isDisabled={loading}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                    {errors.currency && <span className="text-red-500 text-sm mt-1">{errors.currency.message}</span>}
                  </div>
                </div>
              </div>

              {/* Room Types - Dynamic */}
              {roomFields.map((room, index) => (
                <div key={room.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Room Type {index + 1}</h3>
                    {roomFields.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeRoom(index)} 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors" 
                        disabled={loading}
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Room Name - Mandatory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name *</label>
                      <input 
                        {...register(`rooms.${index}.name`, { required: "Room Name is required" })} 
                        placeholder="e.g., Deluxe Suite" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                      {errors.rooms?.[index]?.name && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].name.message}</span>
                      )}
                    </div>

                    {/* Number of Rooms - Mandatory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms *</label>
                      <input 
                        {...register(`rooms.${index}.numOfRooms`, { 
                          required: "Number of Rooms is required",
                          min: { value: 1, message: "Must be at least 1" }
                        })} 
                        type="number" 
                        placeholder="e.g., 5" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                      {errors.rooms?.[index]?.numOfRooms && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].numOfRooms.message}</span>
                      )}
                    </div>

                    {/* Max Guests - Mandatory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
                      <input 
                        {...register(`rooms.${index}.maxGuests`, { 
                          required: "Max Guests is required",
                          min: { value: 1, message: "Must be at least 1" }
                        })} 
                        type="number" 
                        placeholder="e.g., 2" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                      {errors.rooms?.[index]?.maxGuests && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].maxGuests.message}</span>
                      )}
                    </div>

                    {/* Rate Type - Mandatory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate Type *</label>
                      <Controller
                        name={`rooms.${index}.rateType`}
                        control={control}
                        rules={{ required: "Rate Type is required" }}
                        render={({ field }) => (
                          <Select 
                            {...field} 
                            options={mealPlanOptions} 
                            placeholder="Select rate type" 
                            isClearable 
                            isDisabled={loading}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        )}
                      />
                      {errors.rooms?.[index]?.rateType && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].rateType.message}</span>
                      )}
                    </div>

                    {/* Rate - Mandatory */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate *</label>
                      <input 
                        {...register(`rooms.${index}.rate`, { 
                          required: "Rate is required",
                          min: { value: 0, message: "Must be positive" }
                        })} 
                        type="number" 
                        placeholder="e.g., 1500" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                      {errors.rooms?.[index]?.rate && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].rate.message}</span>
                      )}
                    </div>

                    {/* Extra Adult Rate - Optional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Extra Adult Rate</label>
                      <input 
                        {...register(`rooms.${index}.extraAdultRate`, { 
                          min: { value: 0, message: "Must be positive" }
                        })} 
                        type="number" 
                        placeholder="e.g., 500" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                      {errors.rooms?.[index]?.extraAdultRate && (
                        <span className="text-red-500 text-sm mt-1">{errors.rooms[index].extraAdultRate.message}</span>
                      )}
                    </div>

                    {/* Room Numbers - Mandatory */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers (with floor) *</label>
                      <input
                        {...register(`rooms.${index}.roomNumbers`, {
                          required: "Room numbers are required",
                          validate: (value) => {
                            if (!value) return false;
                            return value.split(",").every(num => {
                              const parts = num.trim().split("-");
                              return parts.length === 2 && 
                                    /^\d+$/.test(parts[0]) && 
                                    /^\d+$/.test(parts[1]);
                            }) || "Format: floor-roomnumber (e.g., 1-101, 1-102)";
                          }
                        })}
                        type="text"
                        placeholder="e.g., 1-101, 1-102, 2-201 (floor-roomnumber)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                      />
                      {errors.rooms?.[index]?.roomNumbers && (
                        <span className="text-red-500 text-sm mt-1">
                          {errors.rooms[index].roomNumbers.message}
                        </span>
                      )}
                    </div>

                    {/* Amenities - Optional */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Amenities</label>
                      <Controller
                        name={`rooms.${index}.amenities`}
                        control={control}
                        render={({ field }) => (
                          <Select 
                            {...field} 
                            options={amenitiesOptions} 
                            placeholder="Select amenities" 
                            isMulti
                            isClearable 
                            isDisabled={loading}
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        )}
                      />
                    </div>

                    {/* Room Images - Optional */}
{/* Room Images Section - Replace your existing code with this: */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Room Images (4-7 images required) *
  </label>
  <input
  type="file"
  multiple
  onChange={(e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleRoomImageUpload(index, e.target.files);
    }
    e.target.value = ''; // Reset input to allow re-uploading same files
  }}
  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
  disabled={loading}
  accept="image/*"
  required
/>
  
  {/* Add this preview section: */}
<div className="flex flex-wrap gap-2 mt-2">
  {watch(`rooms.${index}.roomImages`)?.map((img, imgIndex) => (
    <div key={imgIndex} className="relative group">
      <img 
        src={img.preview || img.url || `${API_BASE_URL}/hotel/photos/${img.path}`}
        alt={`Room image ${imgIndex + 1}`}
        className="w-16 h-16 object-cover rounded border border-gray-200"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg';
        }}
      />
      <button
        type="button"
        onClick={() => {
          const updatedImages = [...watch(`rooms.${index}.roomImages`)];
          updatedImages.splice(imgIndex, 1);
          setValue(`rooms.${index}.roomImages`, updatedImages);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  ))}
</div>

  {/* Keep your existing status message: */}
  {watch(`rooms.${index}.roomImages`)?.length > 0 ? (
    <span className="text-green-600 text-sm mt-1">
      ✓ {watch(`rooms.${index}.roomImages`).length} images selected
      {watch(`rooms.${index}.roomImages`).length < 4 && (
        <span className="text-red-500 ml-2">(Minimum 4 required)</span>
      )}
    </span>
  ) : (
    <span className="text-red-500 text-sm mt-1">Please upload 4-7 images</span>
  )}
</div>

                    {/* Smoking/Non-Smoking - Optional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Policy</label>
                      <select
                        {...register(`rooms.${index}.smoking`)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                      >
                        <option value="non-smoking">Non-Smoking</option>
                        <option value="smoking">Smoking</option>
                        <option value="both">Both Available</option>
                      </select>
                    </div>

                    {/* Extra Bed Policy - Optional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Extra Bed Policy</label>
                      <input 
                        {...register(`rooms.${index}.extraBedPolicy`)} 
                        placeholder="e.g., ₹500 per extra bed" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                    </div>

                    {/* Child Policy - Optional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Child Policy</label>
                      <input 
                        {...register(`rooms.${index}.childPolicy`)} 
                        placeholder="e.g., Children under 5 stay free" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors" 
                        disabled={loading} 
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Room Button */}
              <button 
                type="button" 
                onClick={() => appendRoom({ 
                  name: "", 
                  numOfRooms: "", 
                  maxGuests: "", 
                  rateType: null, 
                  rate: "", 
                  extraAdultRate: "", 
                  roomNumbers: "",
                  amenities: [],
                  smoking: "non-smoking",
                  extraBedPolicy: "",
                  childPolicy: "",
                  roomImages: []
                })} 
                className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors" 
                disabled={loading}
              >
                ➕ Add Another Room Type
              </button>
            </div>
          </div>
        );

      case "operations":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">5</span>
              Operations Setup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-In Time - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Check-In Time *</label>
                <input
                  {...register("checkInTime", { required: "Check-in time is required" })}
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.checkInTime && <span className="text-red-500 text-sm mt-1">{errors.checkInTime.message}</span>}
              </div>

              {/* Check-Out Time - Mandatory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Check-Out Time *</label>
                <input
                  {...register("checkOutTime", { required: "Check-out time is required" })}
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
                {errors.checkOutTime && <span className="text-red-500 text-sm mt-1">{errors.checkOutTime.message}</span>}
              </div>

              {/* Early Check-In Policy - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Early Check-In Policy</label>
                <textarea
                  {...register("earlyCheckInPolicy")}
                  placeholder="e.g., 50% of room rate if before 8 AM"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Late Check-Out Policy - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Late Check-Out Policy</label>
                <textarea
                  {...register("lateCheckOutPolicy")}
                  placeholder="e.g., 50% of room rate if after 2 PM"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Cancellation Policy - Mandatory */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Policy *</label>
                <textarea
                  {...register("cancellationPolicy", { required: "Cancellation policy is required" })}
                  placeholder="e.g., Free cancellation until 24 hours before check-in"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  rows={3}
                />
                {errors.cancellationPolicy && <span className="text-red-500 text-sm mt-1">{errors.cancellationPolicy.message}</span>}
              </div>

              {/* No-Show Policy - Optional */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">No-Show Policy</label>
                <textarea
                  {...register("noShowPolicy")}
                  placeholder="e.g., Full night charge for no-shows"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  rows={3}
                />
              </div>

            </div>
          </div>
        );

      

      case "accounting":
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">7</span>
        Accounting & Billing Setup
      </h2>
      <div className="space-y-6">
        {/* Bank Accounts - Dynamic */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Bank Account Details *</h3>
            <button
              type="button"
              onClick={() => appendBankAccount({})}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              disabled={loading}
            >
              ➕ Add Bank Account
            </button>
          </div>

          {bankAccountsFields.map((account, index) => (
            <div key={account.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Bank Account {index + 1}</h4>
                {bankAccountsFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBankAccount(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    disabled={loading}
                  >
                    ❌ Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name *</label>
                  <input
                    {...register(`bankAccounts.${index}.accountHolderName`, {
                      required: "Account holder name is required"
                    })}
                    placeholder="Name as in bank account"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.bankAccounts?.[index]?.accountHolderName && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountHolderName.message}</span>
                  )}
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input
                    {...register(`bankAccounts.${index}.bankName`, {
                      required: "Bank name is required"
                    })}
                    placeholder="Bank name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.bankAccounts?.[index]?.bankName && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].bankName.message}</span>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    {...register(`bankAccounts.${index}.accountNumber`, {
                      required: "Account number is required",
                      pattern: {
                        value: /^[0-9]{9,18}$/,
                        message: "Invalid account number (9-18 digits)"
                      }
                    })}
                    placeholder="Account number"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.bankAccounts?.[index]?.accountNumber && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountNumber.message}</span>
                  )}
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
                  <input
                    {...register(`bankAccounts.${index}.ifscCode`, {
                      required: "IFSC code is required",
                      pattern: {
                        value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                        message: "Invalid IFSC format (e.g., SBIN0001234)"
                      }
                    })}
                    placeholder="IFSC code"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.bankAccounts?.[index]?.ifscCode && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].ifscCode.message}</span>
                  )}
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                  <select
                    {...register(`bankAccounts.${index}.accountType`, {
                      required: "Account type is required"
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="">Select account type</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="OD">Overdraft</option>
                  </select>
                  {errors.bankAccounts?.[index]?.accountType && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].accountType.message}</span>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                  <input
                    {...register(`bankAccounts.${index}.branch`, {
                      required: "Branch is required"
                    })}
                    placeholder="Branch location"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.bankAccounts?.[index]?.branch && (
                    <span className="text-red-500 text-xs mt-1">{errors.bankAccounts[index].branch.message}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modes - Mandatory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Payment Modes *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer", "Cheque", "Online Payment"].map(mode => (
              <label key={mode} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("paymentModes", { required: "At least one payment mode is required" })}
                  value={mode}
                  disabled={loading}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                />
                <span className="text-gray-700">{mode}</span>
              </label>
            ))}
          </div>
          {errors.paymentModes && <span className="text-red-500 text-sm mt-1">{errors.paymentModes.message}</span>}
        </div>

        {/* Invoice Format - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Invoice Number Format</label>
          <input
            {...register("invoiceFormat")}
            placeholder="e.g., INV-{YYYY}-{NNNN}"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
        case "ota":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">8</span>
              OTA & Integration Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connected OTAs - Optional */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Connected OTAs (Online Travel Agencies)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["MakeMyTrip", "Goibibo", "Booking.com", "Agoda", "Expedia", "Airbnb", "OYO", "Others"].map(ota => (
                    <label key={ota} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register("otas")}
                        value={ota}
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">{ota}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Channel Manager - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Manager (if any)</label>
                <input
                  {...register("channelManager")}
                  placeholder="e.g., SiteMinder, RateGain"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>

              {/* Booking Engine - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Engine URL (if any)</label>
                <input
                  {...register("bookingEngine")}
                  placeholder="Enter booking engine URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        );

        case "products":
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">9</span>
        Products & Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Products You Need
          </label>
          <div style={{ position: 'relative', zIndex: 9999 }}>
          <Controller
            name="products"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={productOptions}
                placeholder="Select products"
                isMulti
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{
          menuPortal: base => ({ ...base, zIndex: 9999 }),
          menu: base => ({ ...base, zIndex: 9999 }),
        }}
              />
            )}
          />
          </div>
        </div>
      </div>
    </div>
  );

      case "uploads":
        return (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">10</span>
              Documents to Upload
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hotel Logo - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Logo (High Resolution)</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload("hotelLogo", e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept="image/*"
                />
                {uploadedFiles.hotelLogo && (
                  <span className="text-green-600 text-sm mt-1">✓ {uploadedFiles.hotelLogo.name}</span>
                )}
              </div>

              {/* Property Images - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Images (Lobby, Common Areas, etc.)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload("propertyImages", Array.from(e.target.files))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept="image/*"
                />
                {uploadedFiles.propertyImages && (
                  <span className="text-green-600 text-sm mt-1">
                    ✓ {uploadedFiles.propertyImages.length} files selected
                  </span>
                )}
              </div>

              {/* PAN Card - Mandatory */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Card Copy *
                    {!uploadedFiles.panCard && (
                      <span className="text-red-500 ml-1">(Required)</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload("panCard", e.target.files?.[0])}
                    className={`w-full p-3 border ${
                      errors.panCard ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                    disabled={loading}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                  />
                  {uploadedFiles.panCard ? (
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 text-sm">✓ {uploadedFiles.panCard.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFiles(prev => ({ ...prev, panCard: null }));
                          setValue("panCard", null); // If using react-hook-form
                        }}
                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.panCard?.message || "Please upload PAN Card copy"}
                    </span>
                  )}
                </div>

              {/* GST Certificate - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Certificate</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload("gstCertificate", e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                {uploadedFiles.gstCertificate && (
                  <span className="text-green-600 text-sm mt-1">✓ {uploadedFiles.gstCertificate.name}</span>
                )}
              </div>

              {/* Trade License - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade License </label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload("tradeLicense", e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                {uploadedFiles.tradeLicense && (
                  <span className="text-green-600 text-sm mt-1">✓ {uploadedFiles.tradeLicense.name}</span>
                )}
                {errors.tradeLicense && <span className="text-red-500 text-sm mt-1">{errors.tradeLicense.message}</span>}
              </div>

              {/* Fire Safety Certificate - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fire Safety Certificate </label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload("fireSafetyCert", e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                {uploadedFiles.fireSafetyCert && (
                  <span className="text-green-600 text-sm mt-1">✓ {uploadedFiles.fireSafetyCert.name}</span>
                )}
                {errors.fireSafetyCert && <span className="text-red-500 text-sm mt-1">{errors.fireSafetyCert.message}</span>}
              </div>

              {/* FSSAI License - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FSSAI License (if applicable)</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload("fssaiLicense", e.target.files[0])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  disabled={loading}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                {uploadedFiles.fssaiLicense && (
                  <span className="text-green-600 text-sm mt-1">✓ {uploadedFiles.fssaiLicense.name}</span>
                )}
              </div>

                  {/* Cancelled Cheque - Mandatory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancelled Cheque *
                      {!uploadedFiles.cancelledCheque && (
                        <span className="text-red-500 ml-1">(Required)</span>
                      )}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload("cancelledCheque", e.target.files?.[0])}
                      className={`w-full p-3 border ${
                        errors.cancelledCheque ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                      disabled={loading}
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                    {uploadedFiles.cancelledCheque ? (
                      <div className="flex items-center mt-1">
                        <span className="text-green-600 text-sm">✓ {uploadedFiles.cancelledCheque.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles(prev => ({ ...prev, cancelledCheque: null }));
                            setValue("cancelledCheque", null);
                          }}
                          className="ml-2 text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.cancelledCheque?.message || "Please upload Cancelled Cheque"}
                      </span>
                    )}
                  </div>

                {/* ID Proof - Mandatory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner/Director ID Proof *
                    {!uploadedFiles.idProof && (
                      <span className="text-red-500 ml-1">(Required)</span>
                    )}
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload("idProof", e.target.files?.[0])}
                    className={`w-full p-3 border ${
                      errors.idProof ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                    disabled={loading}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                  />
                  {uploadedFiles.idProof ? (
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 text-sm">✓ {uploadedFiles.idProof.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFiles(prev => ({ ...prev, idProof: null }));
                          setValue("idProof", null);
                        }}
                        className="ml-2 text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.idProof?.message || "Please upload ID Proof"}
                    </span>
                  )}
                </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoadingSavedData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading your saved form...</p>
        </div>
      </div>
    );
  }
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
            <h1 className="text-3xl font-bold text-center">🏨 Hotel PMS Onboarding</h1>
            <p className="text-center text-red-100 mt-2">Complete all sections to onboard your property</p>
          </div>

          {/* Progress Navigation */}
          <div className="bg-gray-100 px-6 py-4 border-b">
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium ${
                    activeSection === section.id
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  } transition-colors shadow-sm`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg font-medium text-center ${
                message.includes("✅") 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {renderSection()}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={activeSection === "basic" || loading}
                >
                  ← Previous
                </button>

                {activeSection !== "uploads" ? (
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleSubmit((data) => saveFormData(data, activeSection))}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "💾 Save"}
                    </button>
                    <button
  type="button"
  onClick={() => {
    // Validate current section before moving
    const data = watch();
    const validationErrors = sectionValidations[activeSection](data);
    
    if (validationErrors.length > 0) {
      setMessage(`❌ Please fix these errors before continuing: ${validationErrors.join(", ")}`);
      return;
    }

    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  }}
  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
  disabled={loading}
>
  Next →
</button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "🚀 Submit & Complete Onboarding"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;