import React from "react";
import Pmss from "./Pmss"
const GuestListHeader = () => {
  return (
            <>
        <div className="flex h-screen">
      {/* Sidebar */}
      <Pmss />

      {/* Form content with scroll */}
      <div className="flex-1 overflow-auto bg-white">
    <div className="grid grid-cols-[80px_80px_1fr_1fr_2fr_40px_40px] gap-3 items-center bg-gray-200 px-4 py-2 font-semibold text-gray-700 border-b border-gray-300">
      <div>Photo ID</div>
      <div>Name</div>
      <div>Phone</div>
      <div>Email</div>
      <div className="text-right">Total Value</div>
      <div className="text-center">Previous Stays</div>
    </div>
    </div>
    </div>
    </>
  );
};

export default GuestListHeader;
