import { useEffect, useState, useRef } from "react";
import "./theme.css";
import "./responsive.css";

import ChartsSection from "./components/ChartsSection";
import GeminiChat from "./components/GeminiChat";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [data, setData] = useState([]);

  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ADDED

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const API_BASE = import.meta.env.VITE_API_URL;

  /* SCROLL REFS */
  const chartsRef = useRef(null);
  const summaryRef = useRef(null);

  /* ---------- LOAD STATES ---------- */
  useEffect(() => {
    fetch(`${API_BASE}/api/states`)
      .then((res) => res.json())
      .then(setStates)
      .catch(() => setError("Failed to load states"));
  }, [API_BASE]);

  /* ---------- LOAD DISTRICTS ---------- */
  useEffect(() => {
    if (!stateName) {
      setDistricts([]);
      return;
    }

    fetch(`${API_BASE}/api/districts?state=${encodeURIComponent(stateName)}`)
      .then((res) => res.json())
      .then(setDistricts)
      .catch(() => setError("Failed to load districts"));
  }, [stateName, API_BASE]);

  /* ---------- SEARCH ---------- */
  const handleSearch = (e) => {
    if (e) e.preventDefault();

    if (!stateName && !districtName) {
      setError("Please select at least State or District");
      return;
    }

    setError("");
    setCurrentPage(1);
    setShowCharts(false);
    setShowAI(false);
    setLoading(true); // START LOADER

    let url = `${API_BASE}/api/data?`;
    if (stateName) url += `state=${encodeURIComponent(stateName)}&`;
    if (districtName) url += `district=${encodeURIComponent(districtName)}&`;
    url += `sortOrder=${sortOrder}`;

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setTimeout(() => {
          summaryRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      })
      .catch(() => setError("Failed to fetch data"))
      .finally(() => {
        setLoading(false); //  STOP LOADER
      });
  };

  /* ---------- RESET ---------- */
  const handleReset = () => {
    setStateName("");
    setDistrictName("");
    setSortOrder("asc");
    setData([]);
    setError("");
    setCurrentPage(1);
    setShowCharts(false);
    setShowAI(false);
    setLoading(false);
  };

  /* ---------- SAFE DISPLAY ---------- */
  const getDisplayValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return value;
    if (Array.isArray(value)) return value.join(", ");

    if (typeof value === "object") {
      const values = Object.values(value);
      if (!values.length) return "";
      if (typeof values[0] === "object") {
        const inner = Object.values(values[0]);
        return inner.length ? inner[0] : "";
      }
      return values[0];
    }
    return "";
  };

  /* ---------- CSV DOWNLOAD ---------- */
  const handleDownload = () => {
    if (!data.length) return;

    const headers = Object.keys(data[0]).filter((k) => k !== "_id");
    const rows = [headers.join(",")];

    data.forEach((row) => {
      rows.push(
        headers.map((h) => `"${getDisplayValue(row[h])}"`).join(",")
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mgnrega_filtered_data.csv";
    link.click();
  };

  /* ---------- PAGINATION ---------- */
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className={darkMode ? "dark app-wrapper" : "app-wrapper"}>
      {/* NAVBAR */}
      <div className="navbar sticky-navbar">
        <div className="brand">MGNREGA Dashboard</div>

        <div style={{ display: "flex", gap: "12px" }}>
          {data.length > 0 && (
            <>
              {/*  CHART BUTTON – ORIGINAL BEHAVIOR PRESERVED */}
              <button
                onClick={() => {
                  const next = !showCharts;
                  setShowCharts(next);
                  if (next) {
                    setTimeout(() => {
                      chartsRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }, 150);
                  }
                }}
              >
                📊 Charts
              </button>

              <button onClick={() => setShowAI(true)}>🤖 Ask AI</button>
            </>
          )}

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <h2>District-wise MGNREGA Data</h2>
        <p>Government-style analytics dashboard</p>
      </div>

      <div className="dashboard">
        {error && <div className="error">{error}</div>}

        {/* FILTER FORM */}
        <form className="filter-card" onSubmit={handleSearch}>
          <div className="filter-group">
            <label>Select State</label>
            <select
              value={stateName}
              onChange={(e) => {
                setStateName(e.target.value);
                setDistrictName("");
              }}
            >
              <option value="">Select</option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Select District</label>
            <select
              value={districtName}
              disabled={!stateName}
              onChange={(e) => setDistrictName(e.target.value)}
            >
              <option value="">Select</option>
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/*  ONLY CHANGE: DISABLE SEARCH WHILE LOADING */}
          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset
          </button>

          <button
            type="button"
            className="search-btn"
            onClick={handleDownload}
            disabled={!data.length}
          >
            Download CSV
          </button>
        </form>

        {/* LOADER */}
        {loading && (
          <div style={{ textAlign: "center", marginTop: "30px", fontSize: "18px" }}>
            ⏳ Loading data, please wait...
          </div>
        )}

        {/* CHARTS */}
        {showCharts && data.length > 0 && (
          <div ref={chartsRef}>
            <ChartsSection data={data} />
          </div>
        )}

        {/* AI MODAL */}
        {showAI && (
          <GeminiChat
            summaryData={{
              state: stateName || "All",
              district: districtName || "All",
              totalRecords: data.length,
            }}
            onClose={() => setShowAI(false)}
          />
        )}

        {/* SUMMARY */}
        {!loading && data.length > 0 && (
          <div className="summary" ref={summaryRef}>
            Showing {startIndex + 1}–
            {Math.min(startIndex + rowsPerPage, data.length)} of {data.length}
          </div>
        )}

        {/* TABLE */}
        {!loading && data.length > 0 && (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    {Object.keys(data[0])
                      .filter((k) => k !== "_id")
                      .map((k) => (
                        <th key={k}>{k.replace(/_/g, " ")}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, i) => (
                    <tr key={i}>
                      <td>{startIndex + i + 1}</td>
                      {Object.keys(row)
                        .filter((k) => k !== "_id")
                        .map((k) => (
                          <td key={k}>{getDisplayValue(row[k])}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ◀ Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
