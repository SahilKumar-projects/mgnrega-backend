import { useEffect, useState } from "react";
import "./theme.css";
import "./responsive.css";

import ChartsSection from "./components/ChartsSection";
import GeminiChat from "./components/GeminiChat";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showAI, setShowAI] = useState(false); // 🔑 AI MODAL STATE

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [data, setData] = useState([]);

  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  /* ---------- LOAD STATES ---------- */
  useEffect(() => {
    fetch("http://localhost:5000/api/states")
      .then((res) => res.json())
      .then(setStates);
  }, []);

  /* ---------- LOAD DISTRICTS ---------- */
  useEffect(() => {
    if (!stateName) {
      setDistricts([]);
      return;
    }
    fetch(`http://localhost:5000/api/districts?state=${stateName}`)
      .then((res) => res.json())
      .then(setDistricts);
  }, [stateName]);

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

    let url = "http://localhost:5000/api/data?";
    if (stateName) url += `state=${encodeURIComponent(stateName)}&`;
    if (districtName) url += `district=${encodeURIComponent(districtName)}&`;
    url += `sortOrder=${sortOrder}`;

    fetch(url)
      .then((res) => res.json())
      .then(setData);
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

  /* ---------- PAGINATION ---------- */
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  /* ---------- DOWNLOAD CSV ---------- */
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

  /* ---------- AI SUMMARY DATA ---------- */
  const totals = data.reduce(
    (acc, row) => {
      acc.sc += Number(row["SC Persondays"] || 0);
      acc.st += Number(row["ST Persondays"] || 0);
      acc.women += Number(row["Women Persondays"] || 0);
      return acc;
    },
    { sc: 0, st: 0, women: 0 }
  );

  const summaryData = {
    state: stateName || "All",
    district: districtName || "All",
    totalRecords: data.length,
    scPersondays: totals.sc,
    stPersondays: totals.st,
    womenPersondays: totals.women,
  };

  return (
    <div className={darkMode ? "dark app-wrapper" : "app-wrapper"}>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="brand">MGNREGA Dashboard</div>

        <div style={{ display: "flex", gap: "12px" }}>
          {data.length > 0 && (
            <>
              <button onClick={() => setShowCharts(!showCharts)}>📊 Charts</button>
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

          <button type="submit" className="search-btn">Search</button>
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

        {/* CHARTS */}
        {showCharts && data.length > 0 && <ChartsSection data={data} />}

        {/* AI MODAL */}
        {showAI && (
          <GeminiChat
            summaryData={summaryData}
            onClose={() => setShowAI(false)}
          />
        )}

        {/* SUMMARY */}
        {data.length > 0 && (
          <div className="summary">
            Showing {startIndex + 1}–
            {Math.min(startIndex + rowsPerPage, data.length)} of {data.length} entries
          </div>
        )}

        {/* TABLE */}
        {data.length > 0 && (
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

            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
