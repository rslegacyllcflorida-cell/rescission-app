import { useState } from "react";

function isSunday(date) {
  return date.getDay() === 0;
}

// Simple federal holiday list (can expand later)
const holidays = [];

function isHoliday(date) {
  return holidays.some(
    (h) => h.toDateString() === date.toDateString()
  );
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function App() {
  const [inputDate, setInputDate] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (!inputDate) return;

    let date = new Date(inputDate);
    let count = 0;
    let timeline = [];

    // Start next day
    date = addDays(date, 1);

    while (count < 3) {
      if (isSunday(date)) {
        timeline.push(`${formatDate(date)} ❌ Sunday (not counted)`);
      } else if (isHoliday(date)) {
        timeline.push(`${formatDate(date)} ❌ Holiday (not counted)`);
      } else {
        count++;
        timeline.push(`${formatDate(date)} ✅ Day ${count}`);
      }

      if (count < 3) {
        date = addDays(date, 1);
      }
    }

    const rescissionDeadline = date;

    // Next valid business day
    let fundingDate = addDays(rescissionDeadline, 1);
    while (isSunday(fundingDate) || isHoliday(fundingDate)) {
      fundingDate = addDays(fundingDate, 1);
    }

    setResult({
      rescissionDeadline: formatDate(rescissionDeadline),
      fundingDate: formatDate(fundingDate),
      timeline,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Right to Cancel Calculator
        </h1>

        <input
          type="date"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <button
          onClick={calculate}
          className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold"
        >
          Calculate
        </button>

        {result && (
          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Rescission Deadline</p>
              <p className="text-xl font-bold text-green-600">
                {result.rescissionDeadline}
              </p>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Earliest Funding</p>
              <p className="text-lg font-semibold">
                {result.fundingDate}
              </p>
            </div>

            <div className="text-sm bg-gray-100 p-3 rounded-lg">
              <p className="font-semibold mb-2">How it was calculated:</p>
              {result.timeline.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Sundays and federal holidays excluded. Not legal advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
