import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';

const RoomSetupSection = ({
  register,
  control,
  errors,
  loading,
  roomFields,
  appendRoom,
  removeRoom,
  watch,

  pendingFiles = {},
  setPendingFiles,

  currencyOptions,
  mealPlanOptions,
  amenitiesOptions,
}) => {

  // Real-time validation helper for room numbers floor-number format
  const validateRoomNumbersCount = (roomIndex) => {
    if (!watch) return null;
    
    const numOfRooms = Number(watch(`rooms.${roomIndex}.numOfRooms`)) || 0;
    let roomNumbersInput = watch(`rooms.${roomIndex}.roomNumbers`);
    
    // Ensure roomNumbersInput is a string
    if (typeof roomNumbersInput !== 'string') {
      roomNumbersInput = roomNumbersInput ? String(roomNumbersInput) : '';
    }
    
    if (!roomNumbersInput.trim() || numOfRooms === 0) return null;
    
    // Parse floor-number format
    const trimmedInput = roomNumbersInput.trim();
    const roomNumbers = trimmedInput
      .split(/[,\n]/)
      .map(num => num.trim())
      .filter(Boolean);
    
    if (roomNumbers.length === 0) {
        return {
            isValid: false,
            expected: numOfRooms,
            actual: 0,
            message: "⚠️ Please enter room numbers in floor-number format (e.g., 1-101, 2-201)"
        };
    }
    
    // Validate format and count
    const validRoomNumbers = roomNumbers.filter(roomNum => {
      return roomNum.match(/^(\d+)-(\d+)$/);
    });
    
    const hasInvalidFormat = validRoomNumbers.length !== roomNumbers.length;
    const countMatch = validRoomNumbers.length === numOfRooms;
    
    if (hasInvalidFormat) {
        return {
            isValid: false,
            expected: numOfRooms,
            actual: validRoomNumbers.length,
            message: "⚠️ Some room numbers have invalid format. Use floor-number (e.g., 1-101, 2-201)"
        };
    }
    
    return {
        isValid: countMatch,
        expected: numOfRooms,
        actual: validRoomNumbers.length,
        message: countMatch
            ? `✓ Perfect! ${validRoomNumbers.length} room numbers match ${numOfRooms} rooms` 
            : `⚠️ You entered ${validRoomNumbers.length} room numbers, but need ${numOfRooms} rooms`
    };
  };

  /**
   * Handles file selection for a specific room and updates the parent's pendingFiles state.
   */
  const handleFileChange = (fieldName, files) => {
    setPendingFiles((prev) => ({ ...prev, [fieldName]: files }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
        Room & Inventory Setup
      </h2>

      <div className="space-y-6">
        {/* General Room Information */}
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

        {/* Dynamic Room Types */}
        {roomFields.map((room, index) => {
          const roomImageFieldName = `roomImages_${room.id}`;
          const selectedFiles = pendingFiles[roomImageFieldName] || [];

          return (
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

                {/* Room Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type Name *</label>
                  <input
                    {...register(`rooms.${index}.name`, { required: "Room Name is required" })}
                    placeholder="e.g., Deluxe Suite"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.rooms?.[index]?.name && <span className="text-red-500 text-sm mt-1">{errors.rooms[index].name.message}</span>}
                </div>

                {/* Number of Rooms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms *</label>
                  <input
                    {...register(`rooms.${index}.numOfRooms`, {
                      required: "Number of rooms is required",
                      min: { value: 1, message: "Must be at least 1" }
                    })}
                    type="number"
                    placeholder="e.g., 10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.rooms?.[index]?.numOfRooms && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.rooms[index].numOfRooms.message}
                    </span>
                  )}
                </div>

                {/* Max Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests *</label>
                  <input
                    {...register(`rooms.${index}.maxGuests`, { required: "Max Guests is required", min: { value: 1, message: "Must be at least 1" } })}
                    type="number"
                    placeholder="e.g., 2"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                  {errors.rooms?.[index]?.maxGuests && <span className="text-red-500 text-sm mt-1">{errors.rooms[index].maxGuests.message}</span>}
                </div>

                {/* Rate Type */}
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
                        value={mealPlanOptions.find(opt => opt.value === (typeof field.value === "object" ? field.value?.value : field.value)) || null}
                        onChange={(selected) => field.onChange(selected ? selected.value : null)}
                      />
                    )}
                  />
                  {errors.rooms?.[index]?.rateType && <span className="text-red-500 text-sm mt-1">{errors.rooms[index].rateType.message}</span>}
                </div>

                {/* Base Rate */}
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

                {/* Extra Adult Rate */}
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

                {/* Room Numbers with Floor-Number Format */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Numbers (Floor-Number Format) *</label>
                  <div className="text-xs text-gray-600 mb-2">
                    Format: <strong>Floor-RoomNumber</strong> (e.g., 1-101 means Floor 1, Room 101). Separate multiple rooms with commas or new lines.
                  </div>
                  <textarea
                    {...register(`rooms.${index}.roomNumbers`, {
                      required: "Room numbers are required",
                      validate: (value, formValues) => {
                        console.log("Validating roomNumbers floor-number format:", value);
                        
                        if (!value || typeof value !== "string" || value.trim() === "") {
                          return "Room numbers are required";
                        }
                        
                        const trimmedValue = value.trim();
                        // Split by commas or new lines and clean up
                        const roomNumbers = trimmedValue
                          .split(/[,\n]/) 
                          .map(num => num.trim())
                          .filter(Boolean);
                        
                        if (roomNumbers.length === 0) {
                          return "At least one room number is required";
                        }
                        
                        // Validate each room number format: floor-number
                        const invalidFormats = [];
                        const validRoomNumbers = [];
                        
                        roomNumbers.forEach((roomNum, idx) => {
                          const floorRoomMatch = roomNum.match(/^(\d+)-(\d+)$/);
                          
                          if (!floorRoomMatch) {
                            invalidFormats.push(`"${roomNum}" (position ${idx + 1})`);
                          } else {
                            const floor = floorRoomMatch[1];
                            const number = floorRoomMatch[2];
                            validRoomNumbers.push(`${floor}-${number}`);
                          }
                        });
                        
                        if (invalidFormats.length > 0) {
                          return `Invalid format for: ${invalidFormats.join(', ')}. Use floor-number format (e.g., 1-101, 2-201)`;
                        }
                        
                        // Check for duplicates
                        const uniqueRoomNumbers = new Set(validRoomNumbers);
                        if (uniqueRoomNumbers.size !== validRoomNumbers.length) {
                          return "Duplicate room numbers are not allowed";
                        }
                        
                        // Validate count consistency with numOfRooms
                        const currentRoom = formValues.rooms && formValues.rooms[index];
                        const numOfRooms = currentRoom ? Number(currentRoom.numOfRooms) || 0 : 0;
                        
                        if (numOfRooms > 0 && validRoomNumbers.length !== numOfRooms) {
                          return `You entered ${validRoomNumbers.length} room numbers, but "Number of Rooms" is ${numOfRooms}. Please adjust.`;
                        }
                        
                        console.log("Room numbers floor-number validation passed");
                        return true;
                      }
                    })}
                    rows="3"
                    placeholder="Enter each room as floor-number format:\n1-101, 1-102, 1-103\n2-201, 2-202\nOr one per line:
1-101
1-102
2-201"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-vertical"
                    disabled={loading}
                  />
                  {errors.rooms?.[index]?.roomNumbers && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.rooms[index].roomNumbers.message}
                    </span>
                  )}

                                  {/* Real-time feedback */}
                                  {(() => {
                                    const validation = validateRoomNumbersCount(index);
                                    if (!validation) {
                                      return (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Enter {watch ? (watch(`rooms.${index}.numOfRooms`) || 0) : 'the same number of'} room numbers in floor-number format (e.g., 1-101, 1-102, 2-201).
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className={`text-xs mt-1 p-2 rounded ${
                                        validation.isValid
                                          ? 'text-green-700 bg-green-50 border border-green-200'
                                          : 'text-orange-700 bg-orange-50 border border-orange-200'
                                      }`}>
                                        {validation.message}
                                      </div>
                                    );
                                  })()}
                                  
                                  {/* Preview entered room numbers */}
                                  {(() => {
                                    if (!watch) return null;
                                    const roomNumbersValue = watch(`rooms.${index}.roomNumbers`);
                                    if (!roomNumbersValue || typeof roomNumbersValue !== 'string') return null;
                                    
                                    const roomNumbers = roomNumbersValue
                                      .split(/[,\n]/)
                                      .map(num => num.trim())
                                      .filter(Boolean)
                                      .filter(roomNum => roomNum.match(/^(\d+)-(\d+)$/));
                                    
                                    if (roomNumbers.length === 0) return null;
                                    
                                    const preview = roomNumbers.slice(0, 10);
                                    
                                    return (
                                      <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded p-2 mt-1">
                                        <strong>Preview:</strong> {preview.join(', ')}{roomNumbers.length > 10 ? `... (${roomNumbers.length} total)` : ` (${roomNumbers.length} total)`}
                                      </div>
                                    );
                                  })()}
                </div>

                {/* Amenities */}
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

                {/* Extra Bed Policy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Bed Policy</label>
                  <input
                    {...register(`rooms.${index}.extraBedPolicy`)}
                    placeholder="e.g., ₹500 per extra bed"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  />
                </div>

                {/* Pet Policy */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet Policy</label>
                  <select
                    {...register("petPolicy")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    disabled={loading}
                  >
                    <option value="">Select pet policy</option>
                    <option value="notAllowed">Pets Not Allowed</option>
                    <option value="allowed">Pets Allowed</option>
                    <option value="allowedWithFee">Pets Allowed (With Fee)</option>
                    <option value="allowedSpecific">Only Specific Pets Allowed</option>
                  </select>
                </div>

                {/* Child Policy */}
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
          );
        })}

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
            roomNumbers: "", // Will accept floor-number format like "1-101, 1-102"
            amenities: [],
            smoking: "non-smoking",
            extraBedPolicy: "",
            childPolicy: "",
            roomImageFiles: null,
            roomImages: []
          })}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          disabled={loading}
        >
          ➞️ Add Another Room Type
        </button>
      </div>
    </div>
  );
};

export default RoomSetupSection;
