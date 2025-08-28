// src/components/EmployeeForm.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "./api";
import { format } from "date-fns";

/**
 * Validation schema (only covers mandatory fields per Employee Onboarding doc)
 * See source doc for full fields. Mandatory fields (AM) are enforced.
 * :contentReference[oaicite:2]{index=2}
 */
const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  gender: yup.string().oneOf(["Male", "Female", "Other"]).required("Gender is required"),
  dob: yup.date().required("Date of Birth is required"),
  mobilePrimary: yup.string().required("Primary mobile is required"),
  officialEmail: yup.string().email("Invalid email").required("Official email is required"),
  joiningDate: yup.date().required("Joining date is required"),
  department: yup.string().required("Department is required"),
  designation: yup.string().required("Designation is required"),
  shift: yup.string().required("Shift allocation is required"),
  aadharNumber: yup.string().required("Aadhar/ID is required"),
  addressPermanent: yup.string().required("Permanent address is required"),
  // Add others as needed...
});

export default function EmployeeForm({ onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      gender: "Male",
      shift: "Morning",
      category: "Permanent",
    },
  });

  const onSubmit = async (data) => {
    setBusy(true);
    setError(null);
    try {
      // prepare multipart form data for file uploads
      const formData = new FormData();

      // combine name parts
      formData.append("firstName", data.firstName);
      if (data.middleName) formData.append("middleName", data.middleName);
      formData.append("lastName", data.lastName);

      formData.append("gender", data.gender);
      formData.append("dob", format(new Date(data.dob), "yyyy-MM-dd"));

      formData.append("mobilePrimary", data.mobilePrimary);
      if (data.mobileAlternate) formData.append("mobileAlternate", data.mobileAlternate);

      formData.append("officialEmail", data.officialEmail);
      if (data.personalEmail) formData.append("personalEmail", data.personalEmail);

      // employment
      if (data.employeeId) formData.append("employeeId", data.employeeId);
      formData.append("joiningDate", format(new Date(data.joiningDate), "yyyy-MM-dd"));
      formData.append("department", data.department);
      formData.append("designation", data.designation);
      formData.append("grade", data.grade || "");
      formData.append("category", data.category);
      formData.append("reportingManager", data.reportingManager || "");
      formData.append("workLocation", data.workLocation || "");

      // shift & attendance
      formData.append("shift", data.shift);
      formData.append("weeklyOff", data.weeklyOff || "");
      formData.append("shiftStart", data.shiftStart || "");
      formData.append("shiftEnd", data.shiftEnd || "");
      formData.append("attendanceCaptureType", data.attendanceCaptureType || "Manual");

      // ID / tax
      formData.append("aadharNumber", data.aadharNumber);
      if (data.panNumber) formData.append("panNumber", data.panNumber);
      if (data.passportNumber) formData.append("passportNumber", data.passportNumber);

      // address
      formData.append("addressPermanent", data.addressPermanent);
      if (data.addressCommunication) formData.append("addressCommunication", data.addressCommunication);

      // salary (optional)
      if (data.basicSalary) formData.append("basicSalary", data.basicSalary);

      // files
      if (data.photo && data.photo[0]) formData.append("photo", data.photo[0]);
      if (data.idProof && data.idProof[0]) formData.append("idProof", data.idProof[0]);

      // POST to backend (example endpoint)
      const resp = await api.post("/hr/employees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // on success
      setBusy(false);
      reset();
      if (onSaved) onSaved(resp.data);
      alert("Employee saved");
    } catch (err) {
      console.error(err);
      setBusy(false);
      setError(err?.response?.data?.message || err.message || "Save failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Add Employee</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">First name *</label>
            <input {...register("firstName")} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" />
            <p className="text-xs text-red-600">{errors.firstName?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Middle name</label>
            <input {...register("middleName")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Last name *</label>
            <input {...register("lastName")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.lastName?.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Gender *</label>
            <select {...register("gender")} className="mt-1 block w-full rounded-md border-gray-200 p-2">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <p className="text-xs text-red-600">{errors.gender?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Date of Birth *</label>
            <input type="date" {...register("dob")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.dob?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Blood Group</label>
            <input {...register("bloodGroup")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Primary Mobile *</label>
            <input {...register("mobilePrimary")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.mobilePrimary?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Official Email *</label>
            <input {...register("officialEmail")} type="email" className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.officialEmail?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Personal Email</label>
            <input {...register("personalEmail")} type="email" className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Joining Date *</label>
            <input type="date" {...register("joiningDate")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.joiningDate?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Department *</label>
            <input {...register("department")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.department?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Designation *</label>
            <input {...register("designation")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.designation?.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Shift Allocation *</label>
            <select {...register("shift")} className="mt-1 block w-full rounded-md border-gray-200 p-2">
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
              <option>Rotational</option>
            </select>
            <p className="text-xs text-red-600">{errors.shift?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Weekly Off</label>
            <input {...register("weeklyOff")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">Attendance Type</label>
            <select {...register("attendanceCaptureType")} className="mt-1 block w-full rounded-md border-gray-200 p-2">
              <option>Biometric</option>
              <option>App</option>
              <option>Manual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Aadhar / National ID *</label>
            <input {...register("aadharNumber")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
            <p className="text-xs text-red-600">{errors.aadharNumber?.message}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">PAN (optional)</label>
            <input {...register("panNumber")} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Permanent Address *</label>
          <textarea {...register("addressPermanent")} rows={3} className="mt-1 block w-full rounded-md border-gray-200 p-2" />
          <p className="text-xs text-red-600">{errors.addressPermanent?.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Photo (jpg/png)</label>
            <input type="file" accept="image/*" {...register("photo")} className="mt-1 block w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium">ID Proof (pdf/jpg)</label>
            <input type="file" accept=".pdf,image/*" {...register("idProof")} className="mt-1 block w-full" />
          </div>
        </div>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save Employee"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
