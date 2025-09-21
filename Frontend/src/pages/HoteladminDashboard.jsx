import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Import section components
import BasicInfoSection from "./sections/BasicInfoSection";
import ContactInfoSection from "./sections/ContactInfoSection";
import GovernmentTaxSection from "./sections/GovernmentTaxSection";
import RoomSetupSection from "./sections/RoomSetupSection";
import OperationsSection from "./sections/OperationsSection";
import AccountingSection from "./sections/AccountingSection";
import OTASection from "./sections/OTASection";
import ProductsSection from "./sections/ProductSection";
import DocumentsSection from "./sections/DocumentsSections";

const API_BASE_URL = "http://localhost:5000/api";
const COUNTRY_API_URL = "https://api.countrystatecity.in/v1/countries";
const CITY_API_URL = "https://api.countrystatecity.in/v1/countries/[ciso]/cities";
const PHONE_CODE_API_URL = "https://restcountries.com/v3.1/all";
const API_KEY = import.meta.env.VITE_API_KEY;

  const DEFAULT_COUNTRY = "IN";   // India
  const DEFAULT_CITY = "Delhi";   // Default city for India

const currencyOptions = [
    { value: "USD", label: "💵 USD - US Dollar" },
    { value: "INR", label: "🇮🇳 INR - Indian Rupee" }
];

const mealPlanOptions = [
    { value: "EP", label: "Room Only (EP - European Plan)" },
    { value: "CP", label: "Bed & Breakfast (CP - Continental Plan)" },
    { value: "MAP", label: "Half Board (MAP - Modified American Plan)" },
    { value: "AP", label: "Full Board (AP - American Plan)" },
    { value: "AI", label: "All Inclusive (AI)" },
    { value: "UAI", label: "Ultra All Inclusive (UAI)" },
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


const fileNameMap = {
    logo: "logo",
    propertyPhotos: "property",
    panCard: "panCard",
    gstCert: "gstCert",
    tradeLicense: "tradeLicense",
    fireSafetyCert: "fireSafetyCert",
    fssaiLicense: "fssaiLicense",
    cancelledCheque: "cancelledCheque",
    idProof: "idProof",
};


const formatDataForBackend = (formData, uploadedFiles) => {

    const documentUploads = { ...uploadedFiles };
    const propertyImagesData = documentUploads.propertyPhotos || [];
    delete documentUploads.propertyPhotos;

    return {

        name: formData.name,
        propertyType: formData.propertyType,
        category: formData.category,
        registeredAddress: formData.registeredAddress,
        operationalAddress: formData.operationalAddress,
        country: formData.country,
        state: formData.state || "",
        city: formData.city || "",
        pinCode: formData.pinCode,
        timeZone: formData.timeZone,
        preferredLanguage: formData.preferredLanguage,
        currency: formData.currency, 
        amenities: formData.hotelAmenities || [],
        brandAffiliation: formData.brandAffiliation,
        website: formData.website,
        googleMapsLink: formData.googleMapsLink,


        contactPerson: formData.contactPerson,
        email: formData.email,
        phoneCode: formData.phoneCode,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        reservationNumber: formData.reservationNumber,
        reservationEmail: formData.reservationEmail,
        managementNumber: formData.managementNumber,
        managementEmail: formData.managementEmail,

        // === Govt & Tax ===
        panNumber: formData.panNumber,
        gstin: formData.gstin,
        fssaiLicense: formData.fssaiLicense,
        fireSafetyCert: formData.fireSafetyCert,
        tradeLicense: formData.tradeLicense,
        alcoholLicense: formData.alcoholLicense,
        companyRegistration: formData.companyRegistration,
        tourismRegistration: formData.tourismRegistration,

        // === Operations ===
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        earlyCheckInPolicy: formData.earlyCheckInPolicy,
        lateCheckOutPolicy: formData.lateCheckOutPolicy,
        cancellationPolicy: formData.cancellationPolicy,
        noShowPolicy: formData.noShowPolicy,
        mealPlan: formData.mealPlan,
        smokingPolicy: formData.smokingPolicy,
        extraBedPolicy: formData.extraBedPolicy,
        childPolicy: formData.childPolicy,
        petPolicy: formData.petPolicy,

        // === Accounting & OTA ===
        paymentModes: formData.paymentModes || [],
        otas: formData.otas || [],
        channelManager: formData.channelManager,
        bookingEngine: formData.bookingEngine,

        // === Complex Array/Object Data ===
        totalRooms: formData.totalRooms,
        rooms: formData.rooms?.map((room) => ({
            name: room.name,
            numOfRooms: Number(room.numOfRooms) || 0,
            maxGuests: Number(room.maxGuests) || 0,
            rate: parseFloat(room.rate) || 0,
            amenities: room.amenities || [],
            rateType: typeof room?.rateType === "object" ? room?.rateType?.value : room?.rateType || null,
            smokingPolicy: room.smokingPolicy || null,
            extraBedPolicy: room.extraBedPolicy || null,
            childPolicy: room.childPolicy || null,
            petPolicy: room.petPolicy || null,
            roomNumbers: typeof room.roomNumbers === 'string'
                ? room.roomNumbers.split(',').map(n => n.trim()).filter(Boolean)
                : [],
        })) || [],
        bankAccounts: formData.bankAccounts,
        products: formData.products?.map(p => ({
            name: p.product
        })).filter(p => p.name) || [],

        ...Object.entries(documentUploads).reduce((acc, [key, value]) => {
            if (value && value.length > 0) {
                const backendKeyMap = {
                    panCard: 'panCardPath', gstCert: 'gstCertPath', tradeLicense: 'tradeLicensePath',
                    fireSafetyCert: 'fireSafetyCertPath', fssaiLicense: 'fssaiLicensePath',
                    cancelledCheque: 'cancelledChequePath', idProof: 'idProofPath',
                    logo: 'logoPath',
                };
                const backendKey = backendKeyMap[key];
                if (backendKey) {
                    acc[backendKey] = value.length > 1 ? value.map(f => f.path) : value[0].path;
                }
            }
            return acc;
        }, {})
    };
};


const PropertyForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState("basic");
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);
    const [countryOptions, setCountryOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [phoneCodeOptions, setPhoneCodeOptions] = useState([]);
    const [pendingFiles, setPendingFiles] = useState({});
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const location = useLocation();

    const { edit, hotelId: navHotelId } = location.state || {};
    const [hotelId, setHotelId] = useState(navHotelId || localStorage.getItem("hotelId") || "");
 

    const getDefaultValues = () => ({
        propertyName: "", propertyType: null, starRating: null, country: "", city: "", state: "",
        registeredAddress: "", operationalAddress: "", pinCode: "", timeZone: "", preferredLanguage: "",
        currency: null, hotelAmenities: [], brandAffiliation: "", website: "", googleMapsLink: "",
        yourName: "", phoneCode: "", phoneNumber: "", email: "", whatsappNumber: "", reservationNumber: "",
        reservationEmail: "", managementNumber: "", managementEmail: "",
        panNumber: "", gstin: "", fssaiLicense: "", tradeLicense: "", fireSafetyCert: "", alcoholLicense: "",
        companyRegistration: "", tourismRegistration: "",
        checkinTime: "14:00", checkoutTime: "12:00", earlyCheckInPolicy: "", lateCheckOutPolicy: "",
        cancellationPolicy: "", noShowPolicy: "",
        paymentModes: [], otas: [], channelManager: "", bookingEngine: "",
        totalRooms: "",
        rooms: [{ name: "", numOfRooms: "", maxGuests: "", rateType: "", rate: "", roomNumbers: "", smokingPolicy: "", extraBedPolicy: "", childPolicy: "", petPolicy: "" }],
        bankAccounts: [{ accountHolderName: "", bankName: "", accountNumber: "", ifscCode: "", branch: "", accountType: "" }],
        products: [{ product: null, rate: "" }],
        propertyPhotos: [],
    });

    const { register, handleSubmit, control, reset, formState: { errors }, watch, setValue, getValues } = useForm({ defaultValues: getDefaultValues() });
    const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({ control, name: "rooms" });
    const { fields: bankAccountsFields, append: appendBankAccount, remove: removeBankAccount } = useFieldArray({ control, name: "bankAccounts" });
    const sections = [{ id: "basic", name: "Basic Info" }, { id: "contact", name: "Contact Info" }, { id: "government", name: "Govt & Tax" }, { id: "rooms", name: "Room Setup" }, { id: "operations", name: "Operations" }, { id: "accounting", name: "Accounting" }, { id: "ota", name: "OTA" }, { id: "products", name: "Products" }, { id: "uploads", name: "Documents" },];
    const requiredDocs = ["panCard", "cancelledCheque"];

    const checkRequiredDocs = () => {
      return requiredDocs.every((docField) => {
        const hasPending = pendingFiles[docField]?.length > 0;
        const hasUploaded = uploadedFiles[docField]?.length > 0;
        return hasPending || hasUploaded;
      });
    };
  
    const [allRequiredDocsUploaded, setAllRequiredDocsUploaded] = useState(false);

useEffect(() => {
    setAllRequiredDocsUploaded(checkRequiredDocs());
}, [pendingFiles, uploadedFiles]);

useEffect(() => {
    const fetchInitialData = async () => {
    try {
        const requests = [];
        
        // Only add countries request if API key exists
        if (API_KEY) {
            requests.push(
                axios.get(COUNTRY_API_URL, { 
                    headers: { "X-CSCAPI-KEY": API_KEY },
                    timeout: 10000
                }).catch(err => {
                    console.warn("Country API failed:", err.message);
                    return { data: [] }; // Return empty array on error
                })
            );
        } else {
            // If no API key, push an empty promise
            requests.push(Promise.resolve({ data: [] }));
        }
        
        // Always include phone codes request
        requests.push(
            axios.get(`${PHONE_CODE_API_URL}?fields=name,idd,flag`, {
                timeout: 10000
            }).catch(err => {
                console.warn("Phone codes API failed:", err.message);
                return { data: [] }; // Return empty array on error
            })
        );

        const [countriesRes, phoneCodesRes] = await Promise.all(requests);
        
        // Handle country options
        let countryOptionsData = [];
        if (countriesRes.data && Array.isArray(countriesRes.data)) {
            countryOptionsData = countriesRes.data.map(c => ({ 
                value: c.iso2, 
                label: c.name 
            }));
        } else {
            // Fallback countries if API fails or no data
            countryOptionsData = [
                { value: "IN", label: "India" },
                { value: "US", label: "United States" },
                { value: "GB", label: "United Kingdom" },
                { value: "CA", label: "Canada" },
                { value: "AU", label: "Australia" },
                { value: "DE", label: "Germany" },
                { value: "FR", label: "France" }
            ];
        }
        setCountryOptions(countryOptionsData);
        
        // Handle phone code options
        let phoneOptionsData = [];
        if (phoneCodesRes.data && Array.isArray(phoneCodesRes.data)) {
            phoneOptionsData = phoneCodesRes.data
                .filter(c => c.idd && c.idd.root)
                .map(c => {
                    const suffix = c.idd.suffixes?.[0] || "";
                    const phoneCode = c.idd.root + suffix;
                    return {
                        value: phoneCode,
                        label: `${c.flag || '🏳️'} ${phoneCode} - ${c.name.common}`
                    };
                })
                .filter(opt => opt.value);
        } else {
            // Fallback phone codes
            phoneOptionsData = [
                { value: "+91", label: "🇮🇳 +91 - India" },
                { value: "+1", label: "🇺🇸 +1 - United States" },
                { value: "+44", label: "🇬🇧 +44 - United Kingdom" },
                { value: "+61", label: "🇦🇺 +61 - Australia" },
                { value: "+1", label: "🇨🇦 +1 - Canada" },
                { value: "+49", label: "🇩🇪 +49 - Germany" },
                { value: "+33", label: "🇫🇷 +33 - France" }
            ];
        }
        setPhoneCodeOptions(phoneOptionsData);

    } catch (err) { 
        console.error("Failed to fetch initial data", err);
        
        // Final fallback in case everything fails
        setCountryOptions([
            { value: "IN", label: "India" },
            { value: "US", label: "United States" }
        ]);
        
        setPhoneCodeOptions([
            { value: "+91", label: "🇮🇳 +91 - India" },
            { value: "+1", label: "🇺🇸 +1 - United States" }
        ]);
    }
};
    fetchInitialData();
}, []);

const selectedCountry = watch("country");
useEffect(() => {
    if (selectedCountry) {
        // Only try to fetch cities if we have a valid API key
        if (!API_KEY) {
            console.warn("No API key available for city data");
            setCityOptions([]);
            return;
        }

        console.log("🌍 Fetching cities for country:", selectedCountry);
        
        axios.get(CITY_API_URL.replace("[ciso]", selectedCountry), { 
            headers: { 
                "X-CSCAPI-KEY": API_KEY, // Exact header name
                "Accept": "application/json"
            },
            timeout: 8000
        })
        .then(res => {
            if (res.data && Array.isArray(res.data)) {
                console.log("✅ Cities loaded:", res.data.length, "cities for", selectedCountry);
                setCityOptions(res.data.map(c => ({ 
                    value: c.name, 
                    label: c.name 
                })));
            } else {
                console.warn("No city data received for", selectedCountry);
                setCityOptions([]);
            }
        })
        .catch(err => {
            console.warn("❌ Failed to fetch cities for", selectedCountry, 
                        "Status:", err.response?.status, 
                        "Error:", err.response?.data);
            setCityOptions([]);
        });
    } else {
        setCityOptions([]);
    }
}, [selectedCountry, API_KEY]);

useEffect(() => {
    const fetchSavedForm = async () => {
        try {
            setIsLoadingSavedData(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE_URL}/hotel/get-saved-form`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const saved = res.data?.data;

            if (saved?.formData?.id) {
                setHotelId(saved.formData.id);
                localStorage.setItem("hotelId", saved.formData.id); // persist for later use
                setValue("hotelId", saved.formData.id); // so DocumentsSection can access it from form
                }
    
            if (!saved?.formData?.email) {
                console.log("No saved form data with an email found. Awaiting user input.");
                return;
            }

            if (saved.formData) {
                // Ensure products are in the correct format for React Hook Form
                if (saved.formData.products) {
                    saved.formData.products = saved.formData.products.map(p => ({
                        product: p.name || ""
                    }));
                }
                reset(saved.formData); 
            }
            if (saved.uploadedFiles) setUploadedFiles(saved.uploadedFiles);
            if (saved.currentSection) setActiveSection(saved.currentSection);
            try {
                const response = await axios.get(`/api/hotel/status-by-email?email=${saved.formData.email}`);
                const status = response.data.status;

                if (status === 'PENDING_PAYMENT' && !edit) {
                    console.log("Redirecting to payment page...");
                    console.log(response)
                    navigate('/payment', {
                        state: {
                            products: response.data.products,
                            currency: response.data.currency,
                            noOfRooms: response.data.totalRooms
                        }
                    });
                } else if (status === 'PAYMENT_SUCCESSFUL') {
                    console.log("User has already completed payment. Redirecting to dashboard.");
                    navigate('/dashboard'); // Example route
                }

            } catch (error) {
                
                if (error.response && error.response.status === 404) {
                    console.log("New user detected. Loading saved draft onto the onboarding form.");
                } else {

                    console.error('Failed to check onboarding status:', error);
                }
            }

        } catch (err) {
            if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                console.log("No saved form data found on server. Starting a new form.");
            } else {
                console.error("Failed to fetch saved form:", err);
            }
        } finally {
            setIsLoadingSavedData(false);
        }
    };

    fetchSavedForm();
}, [reset, navigate]);

const saveFormData = async (data, section) => {
    setLoading(true);
    setMessage("Saving progress...");
    try {
        const token = localStorage.getItem("token");

        const cleanData = formatDataForBackend(data, uploadedFiles);

        await axios.post(`${API_BASE_URL}/hotel/save-form`, {
            data: cleanData,
            currentSection: section,
            uploadedFiles
        }, { headers: { Authorization: `Bearer ${token}` } });



        setMessage("✅ Progress saved successfully!");
    } catch (err) {
        setMessage(`❌ Failed to save progress: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
    }
};

const handleSaveProgress = async () => {

    const currentData = getValues();
    await saveFormData(currentData, activeSection);
};

useEffect(() => {
    if (!hotelId || typeof hotelId !== 'string' || !hotelId.trim()) return;

    const fetchFiles = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/hotel/${hotelId}/property-files`);
        if (res.data.success) {
        const files = res.data.data;

        // Infer the logical document field (e.g., 'gstCert', 'tradeLicense') for each file
        const grouped = files.reduce((acc, file) => {
            // Prefer explicit fieldname if backend provided it
            const explicitField = file.fieldname || file.field || file.fileField;

            // Try to map explicit field directly
            let mapKey = explicitField && fileNameMap[explicitField] ? explicitField : undefined;

            if (!mapKey) {
                // Fall back: derive from filename/url prefix like 'gstCert-<timestamp>.ext'
                const nameSource = file.filename || (typeof file.url === 'string' ? file.url.split('/').pop() : '') || '';
                const prefix = nameSource.includes('-') ? nameSource.split('-')[0] : '';
                const entry = Object.entries(fileNameMap).find(([, val]) => val === prefix);
                if (entry) {
                    mapKey = entry[0];
                }
            }

            if (!mapKey) {
                // As a last resort, keep by fileType group so files are still visible somewhere
                mapKey = file.fileType || 'unknown';
            }

            if (!acc[mapKey]) acc[mapKey] = [];
            acc[mapKey].push(file);
            return acc;
        }, {});

        setUploadedFiles(grouped);
        }
    } catch (err) {
        console.error("Failed to fetch property files:", err);
    }
    };
 fetchFiles();
}, [hotelId]);

// Comprehensive validation function
const validateFormData = (data, uploadedFiles, pendingFiles) => {
    const errors = [];
    const warnings = [];

    // Basic Info Section Validation
    if (!data.name || data.name.trim() === '') {
        errors.push("Hotel Name is required");
    }
    if (!data.category) {
        errors.push("Hotel Category is required");
    }
    if (!data.registeredAddress || data.registeredAddress.trim() === '') {
        errors.push("Registered Address is required");
    }
    if (!data.country) {
        errors.push("Country is required");
    }
    if (!data.state || data.state.trim() === '') {
        errors.push("State is required");
    }
    if (!data.city) {
        errors.push("City is required");
    }
    if (!data.pinCode || data.pinCode.trim() === '') {
        errors.push("Pin Code is required");
    }
    if (!data.timeZone) {
        errors.push("Time Zone is required");
    }
    if (!data.preferredLanguage) {
        errors.push("Preferred Language is required");
    }

    // Contact Info Section Validation
    if (!data.contactPerson || data.contactPerson.trim() === '') {
        errors.push("Primary Contact Name is required");
    }
    if (!data.phoneCode) {
        errors.push("Phone Code is required");
    }
    if (!data.phoneNumber || data.phoneNumber.trim() === '') {
        errors.push("Phone Number is required");
    }
    if (!data.email || data.email.trim() === '') {
        errors.push("Primary Email is required");
    }

    // Government Tax Section Validation
    if (!data.panNumber || data.panNumber.trim() === '') {
        errors.push("PAN Number is required");
    }

    // Operations Section Validation
    if (!data.checkInTime) {
        errors.push("Check-in Time is required");
    }
    if (!data.checkOutTime) {
        errors.push("Check-out Time is required");
    }
    if (!data.cancellationPolicy || data.cancellationPolicy.trim() === '') {
        errors.push("Cancellation Policy is required");
    }

    // Accounting Section Validation
    if (!data.paymentModes || data.paymentModes.length === 0) {
        errors.push("At least one Payment Mode is required");
    }
    
    // Validate bank accounts if any exist
    if (data.bankAccounts && data.bankAccounts.length > 0) {
        data.bankAccounts.forEach((account, index) => {
            if (!account.accountHolderName || account.accountHolderName.trim() === '') {
                errors.push(`Bank Account ${index + 1}: Account Holder Name is required`);
            }
            if (!account.bankName || account.bankName.trim() === '') {
                errors.push(`Bank Account ${index + 1}: Bank Name is required`);
            }
            if (!account.accountNumber || account.accountNumber.trim() === '') {
                errors.push(`Bank Account ${index + 1}: Account Number is required`);
            } else if (!/^[0-9]{9,18}$/.test(account.accountNumber)) {
                errors.push(`Bank Account ${index + 1}: Invalid account number format (9-18 digits)`);
            }
            if (!account.ifscCode || account.ifscCode.trim() === '') {
                errors.push(`Bank Account ${index + 1}: IFSC Code is required`);
            } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(account.ifscCode)) {
                errors.push(`Bank Account ${index + 1}: Invalid IFSC format (e.g., SBIN0001234)`);
            }
            if (!account.accountType) {
                errors.push(`Bank Account ${index + 1}: Account Type is required`);
            }
            if (!account.branch || account.branch.trim() === '') {
                errors.push(`Bank Account ${index + 1}: Branch is required`);
            }
        });
    }

    // Room Setup Section Validation
    if (!data.totalRooms || data.totalRooms <= 0) {
        errors.push("Total Number of Rooms is required");
    }
    if (!data.currency) {
        errors.push("Currency is required");
    }
    
    // Validate each room
    if (data.rooms && data.rooms.length > 0) {
        data.rooms.forEach((room, index) => {
            if (!room.name || room.name.trim() === '') {
                errors.push(`Room Type ${index + 1}: Room Name is required`);
            }
            if (!room.maxGuests || room.maxGuests <= 0) {
                errors.push(`Room Type ${index + 1}: Max Guests is required`);
            }
            if (!room.rateType) {
                errors.push(`Room Type ${index + 1}: Rate Type is required`);
            }
            if (!room.rate || room.rate <= 0) {
                errors.push(`Room Type ${index + 1}: Base Rate is required`);
            }
            if (!room.roomNumbers || 
            (typeof room.roomNumbers === 'string' && room.roomNumbers.trim() === '') ||
            (Array.isArray(room.roomNumbers) && room.roomNumbers.length === 0)) {
            errors.push(`Room Type ${index + 1}: Room Numbers are required`);
        }
        });
    } else {
        errors.push("At least one room type is required");
    }

    // Document Validation
    const requiredDocs = ["panCard", "cancelledCheque"];
    requiredDocs.forEach(docField => {
        const hasUploaded = uploadedFiles[docField]?.length > 0;
        const hasPending = pendingFiles[docField]?.length > 0;
        if (!hasUploaded && !hasPending) {
            errors.push(`${docField === 'panCard' ? 'PAN Card' : 'Cancelled Cheque'} document is required`);
        }
    });

    // Additional format validations
    if (data.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
        errors.push("Invalid email format");
    }
    if (data.pinCode && !/^[0-9]{6}$/.test(data.pinCode)) {
        errors.push("Invalid Pin Code (must be 6 digits)");
    }
    if (data.phoneNumber && !/^\d+$/.test(data.phoneNumber)) {
        errors.push("Invalid phone number format");
    }
    if (data.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
        errors.push("Invalid PAN format (e.g., ABCDE1234F)");
    }
    if (data.gstin && data.gstin.trim() !== '' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstin)) {
        errors.push("Invalid GSTIN format (e.g., 22AAAAA0000A1Z5)");
    }

    return { errors, warnings };
};

// Function to check validation status for UI display
const getValidationStatus = (data, uploadedFiles, pendingFiles) => {
    const validation = validateFormData(data, uploadedFiles, pendingFiles);
    return {
        isValid: validation.errors.length === 0,
        errorCount: validation.errors.length,
        errors: validation.errors,
        warnings: validation.warnings
    };
};

// Function to check section-specific validation
const getSectionValidationStatus = (data, uploadedFiles, pendingFiles, sectionId) => {
    const errors = [];
    
    switch (sectionId) {
        case 'basic':
            if (!data.name || data.name.trim() === '') errors.push("Hotel Name");
            if (!data.category) errors.push("Hotel Category");
            if (!data.registeredAddress || data.registeredAddress.trim() === '') errors.push("Registered Address");
            if (!data.country) errors.push("Country");
            if (!data.state || data.state.trim() === '') errors.push("State");
            if (!data.city) errors.push("City");
            if (!data.pinCode || data.pinCode.trim() === '') errors.push("Pin Code");
            if (!data.timeZone) errors.push("Time Zone");
            if (!data.preferredLanguage) errors.push("Preferred Language");
            break;
        case 'contact':
            if (!data.contactPerson || data.contactPerson.trim() === '') errors.push("Primary Contact Name");
            if (!data.phoneCode) errors.push("Phone Code");
            if (!data.phoneNumber || data.phoneNumber.trim() === '') errors.push("Phone Number");
            if (!data.email || data.email.trim() === '') errors.push("Primary Email");
            break;
        case 'government':
            if (!data.panNumber || data.panNumber.trim() === '') errors.push("PAN Number");
            break;
        case 'rooms':
            if (!data.totalRooms || data.totalRooms <= 0) errors.push("Total Rooms");
            if (!data.currency) errors.push("Currency");
            if (data.rooms && data.rooms.length > 0) {
                data.rooms.forEach((room, index) => {
                    if (!room.name || room.name.trim() === '') errors.push(`Room ${index + 1} Name`);
                    if (!room.maxGuests || room.maxGuests <= 0) errors.push(`Room ${index + 1} Max Guests`);
                    if (!room.rateType) errors.push(`Room ${index + 1} Rate Type`);
                    if (!room.rate || room.rate <= 0) errors.push(`Room ${index + 1} Base Rate`);
                    if (!room.roomNumbers || 
                (typeof room.roomNumbers === 'string' && room.roomNumbers.trim() === '') ||
                (Array.isArray(room.roomNumbers) && room.roomNumbers.length === 0)) {
                errors.push(`Room ${index + 1} Room Numbers`);
            }
                });
            } else {
                errors.push("At least one room type");
            }
            break;
        case 'operations':
            if (!data.checkInTime) errors.push("Check-in Time");
            if (!data.checkOutTime) errors.push("Check-out Time");
            if (!data.cancellationPolicy || data.cancellationPolicy.trim() === '') errors.push("Cancellation Policy");
            break;
        case 'accounting':
            if (!data.paymentModes || data.paymentModes.length === 0) errors.push("Payment Modes");
            if (data.bankAccounts && data.bankAccounts.length > 0) {
                data.bankAccounts.forEach((account, index) => {
                    if (!account.accountHolderName || account.accountHolderName.trim() === '') errors.push(`Bank ${index + 1} Holder Name`);
                    if (!account.bankName || account.bankName.trim() === '') errors.push(`Bank ${index + 1} Bank Name`);
                    if (!account.accountNumber || account.accountNumber.trim() === '') errors.push(`Bank ${index + 1} Account Number`);
                    if (!account.ifscCode || account.ifscCode.trim() === '') errors.push(`Bank ${index + 1} IFSC Code`);
                    if (!account.accountType) errors.push(`Bank ${index + 1} Account Type`);
                    if (!account.branch || account.branch.trim() === '') errors.push(`Bank ${index + 1} Branch`);
                });
            }
            break;
        case 'uploads':
            const requiredDocs = ["panCard", "cancelledCheque"];
            requiredDocs.forEach(docField => {
                const hasUploaded = uploadedFiles[docField]?.length > 0;
                const hasPending = pendingFiles[docField]?.length > 0;
                if (!hasUploaded && !hasPending) {
                    errors.push(`${docField === 'panCard' ? 'PAN Card' : 'Cancelled Cheque'} document`);
                }
            });
            break;
    }
    
    return {
        isValid: errors.length === 0,
        errorCount: errors.length,
        errors: errors
    };
};

// Error Display Component
const ValidationErrorDisplay = ({ errors, onClose }) => {
    if (!errors || errors.length === 0) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">❌ Validation Errors</h3>
                    <button 
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-xl"
                    >
                        ×
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-gray-700 mb-4">
                        Please fix the following issues before submitting your application:
                    </p>
                    <div className="space-y-2">
                        {errors.map((error, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                                <span className="text-red-600 font-semibold text-sm">{index + 1}.</span>
                                <span className="text-red-800 text-sm">{error}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        I'll Fix These Issues
                    </button>
                </div>
            </div>
        </div>
    );
};

const onSubmit = async (data) => {
    setLoading(true);
    setMessage("Submitting your application, please wait...");

    // Run comprehensive validation
    const validation = validateFormData(data, uploadedFiles, pendingFiles);
    
    if (validation.errors.length > 0) {
        setValidationErrors(validation.errors);
        setShowValidationErrors(true);
        setLoading(false);
        return;
    }

    if (!allRequiredDocsUploaded) {
        setMessage("❌ Please ensure all required documents are selected before submitting.");
        setLoading(false);
        return;
    }

    const submissionPayload = new FormData();
    const finalData = formatDataForBackend(data, {});

    for (const key in finalData) {
        const value = finalData[key];
        if (value !== null && value !== undefined) {
            if (Array.isArray(value) || typeof value === "object") {
                submissionPayload.append(key, JSON.stringify(value));
            } else {
                submissionPayload.append(key, value);
            }
        }
    }

    Object.entries(pendingFiles).forEach(([fieldName, files]) => {
        if (Array.isArray(files)) {
            files.forEach((file) => {
                submissionPayload.append(fieldName, file);
            });
        }
    });

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("❌ Session expired. Please log in again.");
            setLoading(false);
            navigate("/login");
            return;
        }

        let endpoint = `${API_BASE_URL}/hotel/onboard`; 
        let method = "post";

        try {
            
            await axios.get(
                `${API_BASE_URL}/hotel/status-by-email?email=${finalData.email}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            endpoint = `${API_BASE_URL}/hotel/update`;
            method = "put";
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log("🆕 New hotel → proceeding with onboard");
            } else {
                console.error("❌ Failed to check hotel existence:", error);
                setMessage("❌ Could not verify hotel status. Please try again.");
                setLoading(false);
                return;
            }
        }

        const response = await axios({
            method,
            url: endpoint,
            data: submissionPayload,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data?.hotel?.id) {
            setHotelId(response.data.hotel.id);
            localStorage.setItem("hotelId", response.data.hotel.id);
          }

        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }

        setMessage("✅ Property submitted successfully! Redirecting...");
        reset();

        const totalRooms = data.totalRooms;
        navigate("/payment", { 
            state: { 
              products: data.products || [],
              currency: typeof data.currency === "string"
                ? data.currency.toUpperCase().trim()
                : data.currency?.value?.toUpperCase() || "INR",
              noOfRooms: parseInt(totalRooms || 0, 10)         
            } 
          });
    } catch (error) {
        console.error("❌ Submission error:", error);
        const errorMessage =
            error.response?.data?.details ||
            error.response?.data?.error ||
            "Failed to submit application.";
        setMessage(`❌ ${errorMessage}`);
    } finally {
        setLoading(false);
    }
};

const handleDeleteUploadedFile = async (propertyFileId) => {
    if (!propertyFileId) return;
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE_URL}/hotel/property-files/${propertyFileId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUploadedFiles((prev) => {
            const next = {};
            Object.entries(prev).forEach(([key, arr]) => {
                const filtered = arr.filter((f) => f.id !== propertyFileId);
                if (filtered.length) next[key] = filtered;
            });
            return next;
        });
    } catch (err) {
        console.error("Failed to delete property file:", err);
        setMessage("❌ Failed to delete file. Please try again.");
        setTimeout(() => setMessage(""), 2500);
    }
};


const renderSection = () => {
const commonProps = { register, errors, control, loading, watch, setValue, getValues }; // Added getValues
switch (activeSection) {
    case "basic": return <BasicInfoSection {...commonProps} countryOptions={countryOptions} cityOptions={cityOptions} />;
    case "contact": return <ContactInfoSection {...commonProps} phoneCodeOptions={phoneCodeOptions} />;
    case "government": return <GovernmentTaxSection {...commonProps} />;
    case "rooms": return <RoomSetupSection {...commonProps} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} roomFields={roomFields} appendRoom={appendRoom} removeRoom={removeRoom} currencyOptions={currencyOptions} mealPlanOptions={mealPlanOptions} amenitiesOptions={amenitiesOptions} />;
    case "operations": return <OperationsSection {...commonProps} />;
    case "accounting": return <AccountingSection {...commonProps} bankAccountsFields={bankAccountsFields} appendBankAccount={appendBankAccount} removeBankAccount={removeBankAccount} />;
    case "ota": return <OTASection {...commonProps} />;
    case "uploads": return (
        <DocumentsSection
            {...commonProps}
            pendingFiles={pendingFiles}
            setPendingFiles={setPendingFiles}
            uploadedFiles={uploadedFiles}
            onDeleteUploadedFile={handleDeleteUploadedFile}
        />
    );
    case "products":
        return (
            <ProductsSection
            {...commonProps}
            noOfRooms={parseInt(watch("totalRooms") || 0, 10)}
            currency={
                typeof watch("currency") === "string"
                    ? watch("currency").toUpperCase().trim()
                    : watch("currency")?.value?.toUpperCase() || "INR"
                }
            />
        );

    default: return null;
}
};

if (isLoadingSavedData) return <div className="flex justify-center items-center min-h-screen">Loading saved progress...</div>;

// Get current validation status
const currentData = getValues();
const validationStatus = getValidationStatus(currentData, uploadedFiles, pendingFiles);

return (
<div className="min-h-screen bg-gray-50 py-8 px-4">
    {/* Validation Error Modal */}
    {showValidationErrors && (
        <ValidationErrorDisplay 
            errors={validationErrors} 
            onClose={() => setShowValidationErrors(false)} 
        />
    )}
    <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-red-600 text-white p-6 text-center">
            <h1 className="text-3xl font-bold">🏨 Hotel PMS Onboarding</h1>
            {validationStatus.errorCount > 0 && (
                <div className="mt-3 text-sm bg-red-700 bg-opacity-50 rounded-lg p-2">
                    ⚠️ {validationStatus.errorCount} validation issue{validationStatus.errorCount > 1 ? 's' : ''} need{validationStatus.errorCount === 1 ? 's' : ''} to be fixed before submission
                </div>
            )}
        </div>
        <div className="bg-gray-100 px-6 py-4 border-b flex overflow-x-auto space-x-4">
            {sections.map(section => {
                const sectionStatus = getSectionValidationStatus(currentData, uploadedFiles, pendingFiles, section.id);
                return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${
                            activeSection === section.id 
                                ? "bg-red-600 text-white" 
                                : sectionStatus.errorCount > 0 
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300" 
                                    : "bg-white text-gray-700 hover:bg-gray-200"
                        }`}>
                        {section.name}
                        {sectionStatus.errorCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {sectionStatus.errorCount}
                            </span>
                        )}
                        {sectionStatus.errorCount === 0 && section.id !== 'ota' && section.id !== 'products' && (
                            <span className="text-green-600">✓</span>
                        )}
                    </button>
                );
            })}
        </div>
        <div className="p-8">
            {message && <div className={`mb-6 p-4 rounded-lg text-center ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{message}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {renderSection()}
                <div className="flex flex-col items-center pt-6 border-t mt-8">
                    <div className="flex justify-between items-center w-full gap-4">
                        <button type="button" disabled={loading || activeSection === "basic"}
                            onClick={() => { const idx = sections.findIndex(s => s.id === activeSection); if (idx > 0) setActiveSection(sections[idx - 1].id); }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-300">
                            ← Previous
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveProgress}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-blue-300"
                        >
                            💾 {loading ? 'Saving...' : 'Save Progress'}
                        </button>

                        <div className="flex-grow text-right flex items-center gap-3">
                            {/* Check Validation Button - Always visible */}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentData = getValues();
                                    const validation = validateFormData(currentData, uploadedFiles, pendingFiles);
                                    if (validation.errors.length > 0) {
                                        setValidationErrors(validation.errors);
                                        setShowValidationErrors(true);
                                    } else {
                                        setMessage("✅ All validation checks passed! You're ready to submit.");
                                        setTimeout(() => setMessage(""), 3000);
                                    }
                                }}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium disabled:bg-blue-300"
                            >
                                🔍 Check Validation
                            </button>

                            {activeSection !== "uploads" ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentIndex = sections.findIndex(s => s.id === activeSection);
                                        if (currentIndex < sections.length - 1) {
                                            setActiveSection(sections[currentIndex + 1].id);
                                        }
                                    }}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-red-300">
                                    Next →
                                </button>
                            ) : (
                                <button
                                type="submit"
                                disabled={loading || !allRequiredDocsUploaded || validationStatus.errorCount > 0}
                                className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
                                    allRequiredDocsUploaded && validationStatus.errorCount === 0
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "bg-gray-400 text-gray-100 cursor-not-allowed"
                                }`}
                                >
                                {loading ? "Submitting..." : "🚀 Submit & Complete Onboarding"}
                                </button>
                            )}
                        </div>
                    </div>
                    {activeSection === 'uploads' && !allRequiredDocsUploaded && (
                        <p className="text-sm text-red-600 mt-4 text-center">
                            Please select all required documents to enable submission.
                        </p>
                    )}
                    {validationStatus.errorCount > 0 && (
                        <p className="text-sm text-red-600 mt-4 text-center">
                            ⚠️ {validationStatus.errorCount} validation issue{validationStatus.errorCount > 1 ? 's' : ''} must be resolved before submission. Click "Check Validation" to see details.
                        </p>
                    )}
                </div>
            </form>
        </div>
    </div>
</div>
);
};
export default PropertyForm;