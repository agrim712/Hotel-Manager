import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import ArrivalReportTable from './ArrivalReportTable';
import DepartureReportTable from './DepartureReportTable';
import PoliceEnquiryReport from './PoliceEnquiryReport';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('Arrival Report');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportCategories = {
    'Front Office': [
      'Arrival Report',
      'Departure Report',
      'Night Audit Report',
      'Police Enquiry Report'
    ],
    'Management': ['Hotel Sales Report', 'Company Performance']
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      let filtered = response.data.data;

      if (selectedReport === 'Arrival Report') {
        filtered = filtered.filter(res => {
          const checkIn = new Date(res.checkIn);
          return checkIn >= from && checkIn <= to;
        });
      } else if (selectedReport === 'Departure Report') {
        filtered = filtered.filter(res => {
          const checkOut = new Date(res.checkOut);
          return checkOut >= from && checkOut <= to;
        });
      } else if (selectedReport === 'Police Enquiry Report') {
        filtered = filtered.filter(res => {
          const checkIn = new Date(res.checkIn);
          return checkIn >= from && checkIn <= to;
        });
      }

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
    // TODO: Implement Excel export if needed
  };

  return (
    <div className="p-4 font-sans text-sm">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div>
          <label className="text-xs font-semibold block">From Date:</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            dateFormat="dd/MM/yyyy"
            className="border rounded px-2 py-1 w-32 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold block">To Date:</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            dateFormat="dd/MM/yyyy"
            className="border rounded px-2 py-1 w-32 text-xs"
          />
        </div>

        <div className="relative w-64">
          <label className="text-xs font-semibold block mb-1">Select Report</label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="border rounded px-3 py-1 w-full text-left flex justify-between items-center text-xs bg-white"
          >
            {selectedReport}
            <span>{isDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {Object.entries(reportCategories).map(([category, reports]) => (
                <div key={category}>
                  <div className="px-2 py-1 bg-gray-100 font-semibold text-xs border-b">{category}</div>
                  {reports.map(report => (
                    <div
                      key={report}
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-3 py-1 hover:bg-gray-100 cursor-pointer text-xs ${
                        selectedReport === report ? 'bg-blue-100' : ''
                      }`}
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
            {selectedReport === 'Departure Report' && (
              <DepartureReportTable fromDate={fromDate} toDate={toDate} />
            )}
            {selectedReport === 'Police Enquiry Report' && <PoliceEnquiryReport data={reportData} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
