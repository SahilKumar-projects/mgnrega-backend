import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function ChartsSection({ data }) {
  /* ===== SAME VALUE EXTRACTION AS TABLE ===== */
  const getNumber = (value) => {
    if (value === null || value === undefined) return 0;

    if (typeof value === "number") return value;

    if (typeof value === "string") return Number(value) || 0;

    if (typeof value === "object") {
      const values = Object.values(value);
      if (!values.length) return 0;

      if (typeof values[0] === "number") return values[0];

      if (typeof values[0] === "object") {
        const inner = Object.values(values[0]);
        return inner.length ? Number(inner[0]) || 0 : 0;
      }
    }
    return 0;
  };

  /* ===== FIND REQUIRED PERSONDAYS COLUMNS DYNAMICALLY ===== */
  const keys = Object.keys(data[0] || {});

  const scKey = keys.find(
    (k) => k.toLowerCase().includes("sc") && k.toLowerCase().includes("person")
  );
  const stKey = keys.find(
    (k) => k.toLowerCase().includes("st") && k.toLowerCase().includes("person")
  );
  const womenKey = keys.find(
    (k) =>
      k.toLowerCase().includes("women") &&
      k.toLowerCase().includes("person")
  );

  /* ===== AGGREGATE TOTALS FROM FILTERED DATA ===== */
  const totals = data.reduce(
    (acc, row) => {
      if (scKey) acc.sc += getNumber(row[scKey]);
      if (stKey) acc.st += getNumber(row[stKey]);
      if (womenKey) acc.women += getNumber(row[womenKey]);
      return acc;
    },
    { sc: 0, st: 0, women: 0 }
  );

  const chartData = [
    { name: "SC Persondays", value: totals.sc },
    { name: "ST Persondays", value: totals.st },
    { name: "Women Persondays", value: totals.women },
  ];

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b"];

  const totalSum = totals.sc + totals.st + totals.women;

  /* ===== PIE LABEL WITH PERCENTAGE ===== */
  const renderPercentLabel = ({ value }) => {
    if (!totalSum) return "0%";
    const percent = ((value / totalSum) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="summary">
      <h3 style={{ marginBottom: "16px" }}>
        Persondays Distribution (Filtered Data)
      </h3>

      {/* ===== BAR CHART ===== */}
     <div style={{ width: "100%", height: 360, marginBottom: "40px" }}>
  <ResponsiveContainer>
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
      barCategoryGap="30%"
    >
      <XAxis
        dataKey="name"
        tick={{ fontSize: 14 }}
      />

      <YAxis
        tick={{ fontSize: 14 }}
        tickFormatter={(value) =>
          value >= 100000
            ? `${(value / 100000).toFixed(1)}L`
            : value
        }
      />

      <Tooltip
        formatter={(value) =>
          value >= 100000
            ? `${(value / 100000).toFixed(2)} Lakhs`
            : value
        }
      />

      <Bar
        dataKey="value"
        barSize={60}   // 🔑 MAKES BAR THICK & VISIBLE
        radius={[6, 6, 0, 0]}
      >
        {chartData.map((_, i) => (
          <Cell key={i} fill={COLORS[i]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>


      {/* ===== PIE CHART WITH % ===== */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={120}
              label={renderPercentLabel}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartsSection;
