import React from "react";

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

const DocumentsSection = ({ pendingFiles, setPendingFiles, uploadedFiles, loading = false, errors = {}, onDeleteUploadedFile }) => {

  const handleFileChange = (field, fileList) => {
    if (fileList && fileList.length > 0) {
      const prefix = fileNameMap[field] || field;
      const filesArray = Array.from(fileList).map((file) => {
        const newName = `${prefix}_${file.name}`;
        return new File([file], newName, { type: file.type });
      });
      setPendingFiles((prev) => ({ ...prev, [field]: filesArray }));
    }
  };

  const handleRemovePendingFile = (field, fileNameToRemove) => {
    const currentFiles = pendingFiles[field] || [];
    const updatedFiles = currentFiles.filter((f) => f.name !== fileNameToRemove);
    setPendingFiles((prev) => ({ ...prev, [field]: updatedFiles }));
  };

  const renderFileInput = (
    label,
    field,
    required = false,
    multiple = false,
    accept = ".jpg,.jpeg,.png,.pdf"
  ) => {
    const previouslyUploaded = uploadedFiles[field] || [];
    const pending = pendingFiles?.[field] || [];
    
    const hasUploadedFile = previouslyUploaded.length > 0;
    const hasPendingFile = pending.length > 0;
    
    // Check if this field should be disabled (single file already uploaded and not multiple)
    const isDisabled = hasUploadedFile && !multiple && !hasPendingFile;

    return (
      <div
        key={field}
        className={`p-4 rounded-lg transition-all border ${
          hasUploadedFile && !hasPendingFile ? "bg-green-50 border-green-300" : "bg-white border-gray-300"
        }`}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && !hasUploadedFile && !hasPendingFile && (
            <span className="text-red-500 ml-1">(Required)</span>
          )}
          {hasUploadedFile && !hasPendingFile && (
            <span className="text-green-600 ml-2 text-sm">✓ Uploaded</span>
          )}
        </label>
        
        {/* Display area for already uploaded files */}
        {hasUploadedFile && !hasPendingFile && (
          <div className="space-y-2 mb-3">
            {previouslyUploaded.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm text-green-800 bg-green-100 p-2 rounded-md"
              >
                <div className="flex items-center min-w-0">
                  ✅
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline truncate" title={file.originalName}>
                    {file.originalName || "Uploaded File"}
                  </a>
                </div>
                {onDeleteUploadedFile && (
                  <button
                    type="button"
                    onClick={() => onDeleteUploadedFile(file.id)}
                    className="ml-3 text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-200"
                    disabled={loading}
                    title="Delete file"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Display area for newly selected (pending) files */}
        {hasPendingFile && (
          <div className="mb-3 space-y-2">
            {pending.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm text-blue-800 bg-blue-100 p-2 rounded-md"
              >
                <div className="flex items-center truncate">
                  ⏳
                  <span className="truncate ml-2" title={file.name}>
                    {file.name} (Pending upload)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePendingFile(field, file.name)}
                  className="ml-2 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                  title="Cancel selection"
                  disabled={loading}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <input
            type="file"
            multiple={multiple}
            onChange={(e) => handleFileChange(field, e.target.files)}
            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full 
              file:border-0 file:text-sm file:font-semibold 
              file:bg-red-50 file:text-red-700 hover:file:bg-red-100 mt-3 ${
                (isDisabled ? "opacity-50 cursor-not-allowed " : "") +
                (errors[field] && !hasUploadedFile && !hasPendingFile ? "border-red-500" : "")
              }`}
            disabled={loading || isDisabled}
            accept={accept}
          />
          {isDisabled && (
            <p className="text-sm text-gray-500 mt-1">
              File already uploaded. Remove existing file to upload a new one.
            </p>
          )}
          {errors[field] && !hasUploadedFile && !hasPendingFile && (
            <span className="text-red-500 text-sm mt-1">
              {errors[field]?.message || `Please upload ${label}`}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
          10
        </span>
        Documents
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderFileInput("Hotel Logo (Optional)", "logo")}
        {renderFileInput("Property Images (Multiple)", "propertyPhotos", false, true)}
        {renderFileInput("PAN Card Copy", "panCard", true)}
        {renderFileInput("GST Certificate", "gstCert")}
        {renderFileInput("Trade License", "tradeLicense")}
        {renderFileInput("Fire Safety Certificate", "fireSafetyCert")}
        {renderFileInput("FSSAI License (if applicable)", "fssaiLicense")}
        {renderFileInput("Cancelled Cheque", "cancelledCheque", true)}
        {renderFileInput("Owner/Director ID Proof", "idProof")}
      </div>
    </div>
  );
};

export default DocumentsSection;