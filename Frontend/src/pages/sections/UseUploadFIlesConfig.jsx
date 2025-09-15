import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function useUploadedFileConfig(hotelId) {
  const [uploadedFilesConfig, setUploadedFilesConfig] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);

  const transformFiles = (files) => {
    if (!files || !Array.isArray(files)) return {};
    return files.reduce((acc, file) => {
      const field = file.field || "misc"; // ensure backend sends 'field'
      if (!acc[field]) acc[field] = [];
      acc[field].push({
        name: file.altText || file.filename || file.url.split("/").pop(),
        url: file.url,
      });
      return acc;
    }, {});
  };

  const fetchFiles = useCallback(async () => {
    if (!hotelId) return;
    try {
      setLoadingFiles(true);
      const { data } = await axios.get(`/api/hotel/${hotelId}`);
      if (data?.propertyFiles) {
        setUploadedFilesConfig(transformFiles(data.propertyFiles));
      }
    } catch (err) {
      console.error("Error fetching property files:", err);
    } finally {
      setLoadingFiles(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    uploadedFilesConfig,
    loadingFiles,
    refreshFiles: fetchFiles,
  };
}
