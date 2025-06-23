import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import ArrivalReportTable from './ArrivalReportTable';
import DepartureReportTable from './DepartureReportTable';
import PoliceEnquiryReport from './PoliceEnquiryReport';
import DayWiseReportTable from './DayWiseReportTable';
import RoomWiseReportTable from './RoomWiseReportTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('Arrival Report');
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [toDate, setToDate] = useState(() => {
    const oneWeekLater = new Date();
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    oneWeekLater.setHours(23, 59, 59, 999);
    return oneWeekLater;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportCategories = {
    'Front Office': [
      'Arrival Report',
      'Departure Report',
      'Night Audit Report',
      'Police Enquiry Report',
    ],
    Management: ['Hotel Sales Report', 'Company Performance'],
    Accounting: ['Day Wise Report', 'Room Wise Report'],
  };

  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const from = new Date(fromDate);
      const to = new Date(toDate);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      if (selectedReport === 'Day Wise Report') {
        const response = await axios.get(`http://localhost:5000/api/hotel/reports/day-wise-report`, {
          params: { from: from.toISOString(), to: to.toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawData = response.data.data || {};
        const completeData = {};
        const current = new Date(from);
        const end = new Date(to);
        current.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        while (current <= end) {
          const dateStr = current.toISOString().split('T')[0];
          completeData[dateStr] = rawData[dateStr] || 0;
          current.setDate(current.getDate() + 1);
        }

        setReportData(completeData);
      } else if (selectedReport === 'Room Wise Report') {
        const response = await axios.get(`http://localhost:5000/api/hotel/reports/room-wise-report`, {
          params: { from: from.toISOString(), to: to.toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        });

        setReportData(response.data.data || {});
      } else {
        const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
          headers: { Authorization: `Bearer ${token}` },
        });

        let filtered = response.data.data || [];

        if (selectedReport === 'Arrival Report') {
          filtered = filtered.filter(res => new Date(res.checkIn) >= from && new Date(res.checkIn) <= to);
        } else if (selectedReport === 'Departure Report') {
          filtered = filtered.filter(res => new Date(res.checkOut) >= from && new Date(res.checkOut) <= to);
        } else if (selectedReport === 'Police Enquiry Report') {
          filtered = filtered.filter(res => new Date(res.checkIn) >= from && new Date(res.checkIn) <= to);
        }

        setReportData(filtered);
      }
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
    let exportData = [];

    if (selectedReport === 'Day Wise Report' || selectedReport === 'Room Wise Report') {
      exportData = Object.entries(reportData).map(([key, value]) => ({ Date: key, Revenue: value }));
    } else {
      exportData = reportData.map(item => {
        const flatItem = {};
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            flatItem[key] = typeof item[key] === 'object' && item[key] !== null ? JSON.stringify(item[key]) : item[key];
          }
        }
        return flatItem;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.replace(/\s/g, ''));
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${selectedReport}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-8 font-sans text-sm bg-gradient-to-tr from-indigo-50 via-blue-100 to-indigo-200 min-h-screen rounded-xl shadow-2xl animate-fade-in">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-800 drop-shadow-lg uppercase tracking-wider border-b-4 border-indigo-300 pb-2">📊 Reports Dashboard</h1>

      <div className="flex items-end gap-6 mb-8 flex-wrap bg-white p-6 rounded-2xl shadow-xl border border-indigo-200">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">From Date</label>
          <DatePicker selected={fromDate} onChange={setFromDate} dateFormat="dd/MM/yyyy" className="border border-indigo-300 rounded-lg px-4 py-2 w-40 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">To Date</label>
          <DatePicker selected={toDate} onChange={setToDate} dateFormat="dd/MM/yyyy" className="border border-indigo-300 rounded-lg px-4 py-2 w-40 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        <div className="relative w-72">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Report</label>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="border border-indigo-300 rounded-lg px-4 py-2 w-full text-left flex justify-between items-center text-sm bg-white shadow-inner hover:ring-2 hover:ring-indigo-300">
            {selectedReport} <span className="ml-2 text-indigo-500">{isDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-20 mt-2 w-full bg-white border border-indigo-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {Object.entries(reportCategories).map(([category, reports]) => (
                <div key={category}>
                  <div className="px-4 py-2 bg-indigo-50 font-semibold text-xs text-indigo-700 border-b border-indigo-100 uppercase tracking-wide">{category}</div>
                  {reports.map(report => (
                    <div
                      key={report}
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-indigo-100 text-sm transition-colors duration-200 ${selectedReport === report ? 'bg-indigo-200 font-semibold text-indigo-900' : ''}`}
                    >
                      {report}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleDownload} className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm shadow-xl transition-all duration-300 transform hover:scale-105">
          ⬇️ Download Excel
        </button>
      </div>

      {error && <div className="text-red-600 font-medium mb-4">{error}</div>}

      <div className="bg-white rounded-2xl shadow-2xl p-6 overflow-x-auto border border-indigo-100 animate-fade-in">
        {isLoading ? (
          <div className="text-center text-indigo-600 py-10 text-lg font-medium animate-pulse">Loading reservations...</div>
        ) : (
          <>
            {selectedReport === 'Arrival Report' && <ArrivalReportTable data={reportData} />}
            {selectedReport === 'Departure Report' && <DepartureReportTable data={reportData} />}
            {selectedReport === 'Police Enquiry Report' && <PoliceEnquiryReport data={reportData} />}
            {selectedReport === 'Day Wise Report' && <DayWiseReportTable data={reportData} />}
            {selectedReport === 'Room Wise Report' && <RoomWiseReportTable data={reportData} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
