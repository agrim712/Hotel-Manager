import React from 'react';
import { Controller } from 'react-hook-form';
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const BasicInfoSection = ({ register, control, errors, loading }) => {
    const timezoneOptions = [
        { value: "GMT", label: "GMT (Greenwich Mean Time)" },
        { value: "IST", label: "IST (Indian Standard Time)" },
        { value: "EST", label: "EST (Eastern Standard Time)" },
        { value: "PST", label: "PST (Pacific Standard Time)" },
        { value: "CET", label: "CET (Central European Time)" },
    ];
    const countryOptions = [
    { value: "IN", label: "India" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
  ];

  // Hardcoded city options
  const cityOptions = [
    { value: "Delhi", label: "Delhi" },
    { value: "Mumbai", label: "Mumbai" },
    { value: "New York", label: "New York" },
    { value: "Los Angeles", label: "Los Angeles" },
    { value: "London", label: "London" },
  ];

    const languageOptions = [
        { value: "en", label: "English" },
        { value: "hi", label: "Hindi" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
        { value: "de", label: "German" },
        { value: "zh", label: "Chinese" },
    ];

    const DEFAULT_COUNTRY = "IN";   // India
    const DEFAULT_CITY = "Delhi"; 

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

    const allAmenities = hotelAmenitiesOptions.flatMap(group => group.options);

    return (
        <div className="bg-gray-50 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hotel Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name *</label>
                    <input
                        {...register("name", { required: "Hotel Name is required" })}
                        placeholder="Enter your hotel name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
                </div>

                {/* Brand Affiliation */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand/Group Affiliation</label>
                    <input
                        {...register("brandAffiliation")}
                        placeholder="Enter brand/group name if any"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                </div>

                {/* Hotel Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Category *</label>
                    <select
                        {...register("category", { required: "Hotel Category is required" })}
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
                    {errors.category && <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>}
                </div>

                {/* Registered Address */}
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

                {/* Operational Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operational Address (if different)</label>
                    <input
                        {...register("operationalAddress")}
                        placeholder="Enter operational address if different"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                </div>

                {/* Country */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={countryOptions.find(c => c.value === field.value) || countryOptions.find(c => c.value === DEFAULT_COUNTRY)}
                                onChange={val => field.onChange(val ? val.value : DEFAULT_COUNTRY)}
                                options={countryOptions}
                                placeholder="Select country"
                                isClearable
                                isDisabled={loading}
                            />
                        )}
                    />
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                        {...register("state")}
                        placeholder="Enter state"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={cityOptions.find(c => c.value === field.value) || { value: DEFAULT_CITY, label: DEFAULT_CITY }}
                                onChange={val => field.onChange(val ? val.value : DEFAULT_CITY)}
                                options={cityOptions.length > 0 ? cityOptions : [{ value: DEFAULT_CITY, label: DEFAULT_CITY }]}
                                placeholder="Select city"
                                isClearable
                                isDisabled={loading}
                            />
                        )}
                    />
                </div>

                {/* Pin Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pin Code *</label>
                    <input
                        {...register("pinCode", {
                            required: "Pin Code is required",
                            pattern: { value: /^[0-9]{6}$/, message: "Invalid Pin Code (must be 6 digits)" }
                        })}
                        placeholder="Enter pin code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                    {errors.pinCode && <span className="text-red-500 text-sm mt-1">{errors.pinCode.message}</span>}
                </div>

                {/* Time Zone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone *</label>
                    <Controller
                        name="timeZone"
                        control={control}
                        rules={{ required: "Time Zone is required" }}
                        render={({ field }) => (
                            <Select
                                value={timezoneOptions.find(c => c.value === field.value)}
                                onChange={val => field.onChange(val ? val.value : '')}
                                options={timezoneOptions}
                                placeholder="Select time zone"
                                isClearable
                                isDisabled={loading}
                            />
                        )}
                    />
                    {errors.timeZone && <span className="text-red-500 text-sm mt-1">{errors.timeZone.message}</span>}
                </div>

                {/* Preferred Language */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language *</label>
                    <Controller
                        name="preferredLanguage"
                        control={control}
                        rules={{ required: "Language is required" }}
                        render={({ field }) => (
                            <Select
                                value={languageOptions.find(c => c.value === field.value)}
                                onChange={val => field.onChange(val ? val.value : '')}
                                options={languageOptions}
                                placeholder="Select language"
                                isClearable
                                isDisabled={loading}
                            />
                        )}
                    />
                    {errors.preferredLanguage && <span className="text-red-500 text-sm mt-1">{errors.preferredLanguage.message}</span>}
                </div>

                {/* Hotel Amenities */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Amenities</label>
                    <Controller
                        name="hotelAmenities"
                        control={control}
                        render={({ field }) => (
                            <CreatableSelect
                                value={allAmenities.filter(c => field.value?.includes(c.value))}
                                onChange={options => field.onChange(options ? options.map(opt => opt.value) : [])}
                                options={hotelAmenitiesOptions}
                                placeholder="Select or type to add amenities"
                                isMulti
                                isClearable
                                isDisabled={loading}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isValidNewOption={(inputValue) => {
                                    const currentAmenities = field.value || [];
                                    return !currentAmenities.some(optValue => optValue.toLowerCase() === inputValue.toLowerCase());
                                }}
                                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                styles={{
                                    control: (provided) => ({ ...provided, minHeight: '44px' }),
                                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                }}
                            />
                        )}
                    />
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input
                        {...register("website", {
                            pattern: { value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, message: "Invalid website URL" }
                        })}
                        placeholder="Enter website URL"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                        disabled={loading}
                    />
                    {errors.website && <span className="text-red-500 text-sm mt-1">{errors.website.message}</span>}
                </div>

                {/* Google Maps Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Link</label>
                    <input
                        {...register("googleMapsLink", {
                            pattern: { value: /^(https?:\/\/)?(www\.)?(google\.[a-z]+\/maps\/|maps\.app\.goo\.gl\/).+$/, message: "Invalid Google Maps link" }
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
};

export default BasicInfoSection;
