import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import ArrivalReportTable from './ArrivalReportTable';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('Arrival Report');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportCategories = {
    'Front Office': ['Arrival Report', 'Departure Report', 'Night Audit Report'],
    'Management': ['Hotel Sales Report', 'Company Performance']
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const from = new Date(fromDate);
      const to = new Date(toDate);

      let filtered = response.data.data;

      // Show reservations where stay overlaps selected range
      filtered = filtered.filter(res => {
        const checkIn = new Date(res.checkIn);
        const checkOut = new Date(res.checkOut);
        return checkIn <= to && checkOut >= from;
      });

      setReportData(filtered);
    } catch (err) {
      setError('Failed to fetch reservations');
      console.error('Error fetching reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedReport, fromDate, toDate]);

  const handleDownload = () => {
    console.log('Downloading Excel...');
    // Implement Excel download logic here
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="p-4 font-sans text-sm">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div>
          <label className="text-xs font-semibold block">From Date:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border rounded px-2 py-1 w-32 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold block">To Date:</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border rounded px-2 py-1 w-32 text-xs"
          />
        </div>

        <div className="relative w-64">
          <label className="text-xs font-semibold block mb-1">Select Report</label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="border rounded px-3 py-1 w-full text-left flex justify-between items-center text-xs bg-white"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            {selectedReport}
            <span>{isDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {Object.entries(reportCategories).map(([category, reports]) => (
                <div key={category}>
                  <div className="px-2 py-1 bg-gray-100 font-semibold text-xs border-b">{category}</div>
                  {reports.map((report) => (
                    <div
                      key={report}
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-1 hover:bg-gray-100 cursor-pointer text-xs ${
                        selectedReport === report ? 'bg-blue-100' : ''
                      }`}
                      role="option"
                    >
                      {report}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="ml-auto bg-blue-600 text-white px-3 py-1 rounded text-xs"
          onClick={handleDownload}
        >
          Download Excel ⬇️
        </button>
      </div>

      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-4">Loading reservations...</div>
        ) : (
            <>
            {selectedReport === 'Arrival Report' && <ArrivalReportTable data={reportData} />}
            </>
        )}
      </div>
    </div>
  );
};

export default Reports;
