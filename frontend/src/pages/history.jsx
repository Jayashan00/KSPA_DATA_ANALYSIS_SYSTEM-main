import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { checklistAPI } from "../services/api";
import { toast } from "react-hot-toast";
import { Calendar, X, ServerCrash, Clock, User, ChevronsRight, Tag, Hash, MapPin, Wrench, RefreshCw, FileText } from "lucide-react";

// --- Helper Component for Status Badge ---
const StatusBadge = ({ status }) => {
  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-400",
    APPROVED: "bg-green-100 text-green-800 border-green-400",
    REJECTED: "bg-red-100 text-red-800 border-red-400",
  };
  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

// --- Helper function to format form data keys ---
const formatKey = (key) => {
  if (!key) return "";
  const result = key.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// --- Helper Component for Details Modal ---
const DetailsModal = ({ summary, onClose }) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Checklist Details</h2>
            <p className="text-gray-500">{new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {summary.shift} Shift</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <div className="space-y-3">
            {summary.entries.map(entry => (
              <div key={entry.id} className="bg-gray-50 border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-gray-700">{entry.machineName || "N/A"}</div>
                  <StatusBadge status={entry.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5"><Tag size={14} /> Section: <span className="font-medium text-gray-800">{entry.section}</span></div>
                  <div className="flex items-center gap-1.5"><Hash size={14} /> Location ID: <span className="font-medium text-gray-800">{entry.locationId}</span></div>
                  <div className="flex items-center gap-1.5"><MapPin size={14} /> Subsection: <span className="font-medium text-gray-800">{entry.subsection}</span></div>
                  <div className="flex items-center gap-1.5"><User size={14} /> Technician: <span className="font-medium text-gray-800">{entry.technicianName}</span></div>
                </div>
                {entry.remarks && <p className="text-sm mt-2 font-medium text-red-600">Remarks: {entry.remarks}</p>}

                <div className="mt-3 border-t pt-3">
                  <details>
                    <summary className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1">
                      <FileText size={14} />
                      View Submitted Data
                    </summary>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2 text-sm pl-4">
                      {Object.entries(entry.formData)
                        .filter(([key, value]) => value !== "" && value !== null)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500">{formatKey(key)}: </span>
                            <strong className="text-gray-900">{String(value)}</strong>
                          </div>
                        ))
                      }
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main History Component ---
const History = () => {
  const [allSummaries, setAllSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ELECTRICAL");
  const [filterDate, setFilterDate] = useState("");
  const [modalSummary, setModalSummary] = useState(null);

  const groupEntriesByDateAndShift = (entries) => {
    if (!Array.isArray(entries)) return [];

    const grouped = entries.reduce((acc, entry) => {
      if (!entry.createdAt) return acc;
      const dateObj = new Date(entry.createdAt);
      if (isNaN(dateObj)) return acc;

      const date = dateObj.toLocaleDateString('en-CA');
      const shift = entry.shift?.toUpperCase() || 'UNKNOWN';
      const key = `${date}|${shift}|${entry.locationType}`;

      if (!acc[key]) {
        acc[key] = {
          date,
          shift,
          locationType: entry.locationType,
          entries: [],
        };
      }
      acc[key].entries.push(entry);
      return acc;
    }, {});

    Object.values(grouped).forEach(summary => {
      const allApproved = summary.entries.every(e => e.status === 'APPROVED');
      const anyRejected = summary.entries.some(e => e.status === 'REJECTED');
      if (anyRejected) {
        summary.status = 'REJECTED';
      } else if (allApproved) {
        summary.status = 'APPROVED';
      } else {
        summary.status = 'PENDING';
      }
    });

    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date) || b.shift.localeCompare(a.shift));
  };

  const fetchHistorySummaries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await checklistAPI.getAll();
      const grouped = groupEntriesByDateAndShift(response.data);
      setAllSummaries(grouped);
      toast.success("History updated!");
    } catch (error) {
      console.error("Failed to fetch or process history summaries:", error);
      toast.error("Failed to fetch history summaries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistorySummaries();
  }, [fetchHistorySummaries]);

  const filteredSummaries = useMemo(() => {
    return allSummaries
      .filter(s => s.locationType?.toUpperCase() === selectedCategory)
      .filter(s => !filterDate || s.date === filterDate);
  }, [allSummaries, selectedCategory, filterDate]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Slidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        {/* FIX: Added ml-60 for medium screens and up to the main content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Checklist History</h1>
              <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-full">
                <button
                  onClick={() => setSelectedCategory("ELECTRICAL")}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${selectedCategory === "ELECTRICAL" ? "bg-white text-orange-600 shadow" : "text-gray-600 hover:bg-gray-300"}`}
                >
                  Electrical
                </button>
                <button
                  onClick={() => setSelectedCategory("MECHANICAL")}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${selectedCategory === "MECHANICAL" ? "bg-white text-orange-600 shadow" : "text-gray-600 hover:bg-gray-300"}`}
                >
                  Mechanical
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-end gap-4">
              <div>
                <label htmlFor="filterDate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={16} /> Filter by Date:
                </label>
                <input
                  type="date"
                  id="filterDate"
                  value={filterDate}
                  className="border p-2 rounded-md font-semibold cursor-pointer bg-white shadow-sm"
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <button
                onClick={fetchHistorySummaries}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-100 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-10">Loading history...</div>
            ) : filteredSummaries.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <ServerCrash size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No history found for the selected criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSummaries.map((summary, index) => (
                  <div
                    key={index}
                    onClick={() => setModalSummary(summary)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-orange-400 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-800">{new Date(summary.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Clock size={14} />{summary.shift} Shift</span>
                          <span className="flex items-center gap-1.5"><Wrench size={14} />{summary.entries.length} Checklists</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={summary.status} />
                        <ChevronsRight className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {modalSummary && <DetailsModal summary={modalSummary} onClose={() => setModalSummary(null)} />}
    </div>
  );
};

export default History;