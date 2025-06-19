import React from "react";
import RoomTypeSelect from "../../Components/Selects/RoomTypeSelect";
import RateTypeSelect from "../../Components/Selects/RateTypeSelect";
import MaxGuestsDisplay from "../../Components/Selects/MaxGuests";
import NumberOfRoomsDropdown from "../../Components/Selects/NoOfRoomTypeSelect";

const RoomAndRateSection = ({ formData, setFormData }) => {
  const token = localStorage.getItem("token");

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Room Type */}
      <RoomTypeSelect
        value={formData.roomType}
        onChange={(val) =>
          setFormData((prev) => ({
            ...prev,
            roomType: val,
            rateType: "",
            numberOfGuests: "",
            numRooms: "",
          }))
        }
        token={token}
      />

      {/* Rate Type */}
      <RateTypeSelect
        roomType={formData.roomType}
        value={formData.rateType}
        onChange={(val) =>
          setFormData((prev) => ({ ...prev, rateType: val }))
        }
        token={token}
      />

      {/* Max Guests */}
      <MaxGuestsDisplay
        roomType={formData.roomType}
        rateType={formData.rateType}
        token={token}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, numberOfGuests: value }))
        }
      />

      {/* Number of Rooms */}
      <NumberOfRoomsDropdown
        roomType={formData.roomType}
        rateType={formData.rateType}
        token={token}
        onSelect={(value) =>
          setFormData((prev) => ({ ...prev, numRooms: value }))
        }
      />
    </div>
  );
};

export default RoomAndRateSection;
