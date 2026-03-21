import { useState } from "react";

function isSunday(date) { return date.getDay() === 0; }

function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

function nthWeekdayOfMonth(year, month, weekday, nth) { const first = new Date(year, month, 1); const firstWeekday = first.getDay(); const offset = (weekday - firstWeekday + 7) % 7; return new Date(year, month, 1 + offset + (nth - 1) * 7); }

function lastWeekdayOfMonth(year, month, weekday) { const last = new Date(year, month + 1, 0); const offset = (last.getDay() - weekday + 7) % 7; return new Date(year, month, last.getDate() - offset); }

function fixedHolidayDate(year, month, day) { return new Date(year, month, day); }

function getFederalHolidays(year) { return [ { name: "New Year's Day", date: fixedHolidayDate(year, 0, 1) }, { name: "Martin Luther King Jr. Day", date: nthWeekdayOfMonth(year, 0, 1, 3) }, { name: "Presidents Day", date: nthWeekdayOfMonth(year, 1, 1, 3) }, { name: "Memorial Day", date: lastWeekdayOfMonth(year, 4, 1) }, { name: "Juneteenth", date: fixedHolidayDate(year, 5, 19) }, { name: "Independence Day", date: fixedHolidayDate(year, 6, 4) }, { name: "Labor Day", date: nthWeekdayOfMonth(year, 8, 1, 1) }, { name: "Columbus Day", date: nthWeekdayOfMonth(year, 9, 1, 2) }, { name: "Veterans Day", date: fixedHolidayDate(year, 10, 11) }, { name: "Thanksgiving Day", date: nthWeekdayOfMonth(year, 10, 4, 4) }, { name: "Christmas Day", date: fixedHolidayDate(year, 11, 25) }, ]; }

function getHolidayMapForYears(years) { const map = new Map();

years.forEach((year) => { getFederalHolidays(year).forEach((holiday) => { const key = new Date( holiday.date.getFullYear(), holiday.date.getMonth(), holiday.date.getDate() ).getTime(); map.set(key, holiday.name); }); });

return map; }

function getHolidayName(date) { const normalized = new Date( date.getFullYear(), date.getMonth(), date.getDate() ).getTime(); const holidayYears = [ date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1, ]; const holidayMap = getHolidayMapForYears(holidayYears); return holidayMap.get(normalized) || null; }

function isHoliday(date) { return Boolean(getHolidayName(date)); }

function formatDate(date) { return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", }); }

export default function Home() { const [inputDate, setInputDate] = useState(""); const [result, setResult] = useState(null); const [copied, setCopied] = useState(false);

const calculate = () => { if (!inputDate) return;

const signingDate = new Date(inputDate + "T00:00:00");
let date = addDays(signingDate, 1);
let count = 0;
const timeline = [];

// Add signing date at top of timeline
timeline.push({
  date: formatDate(signingDate),
  status: "info",
  label: "Signing Date",
});

while (count < 3) {
  const holidayName = getHolidayName(date);

  if (isSunday(date)) {
    timeline.push({
      date: formatDate(date),
      status: "skipped",
      label: "Sunday (not counted)",
    });
  } else if (holidayName) {
    timeline.push({
      date: formatDate(date),
      status: "skipped",
      label: `${holidayName} (not counted)`,
    });
  } else {
    count += 1;
    timeline.push({
      date: formatDate(date),
      status: "counted",
      label: `Day ${count}`,
    });
  }

  if (count < 3) {
    date = addDays(date, 1);
  }
}

const rescissionDeadline = date;
let fundingDate = addDays(rescissionDeadline, 1);

while (isSunday(fundingDate) || isHoliday(fundingDate)) {
  fundingDate = addDays(fundingDate, 1);
}

setResult({
  signingDate: formatDate(signingDate),
  rescissionDeadline: formatDate(rescissionDeadline),
  fundingDate: formatDate(fundingDate),
  timeline,
  copyText: `Signing Date: ${formatDate(signingDate)}\nRescission Deadline: ${formatDate(
    rescissionDeadline
  )}\nEarliest Funding: ${formatDate(fundingDate)}`,
});

};

const copyResult = async () => { try { await navigator.clipboard.writeText(result.copyText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (error) { console.error("Copy failed", error); } };

return ( <main className="min-h-screen bg-slate-100 px-4 py-8 font-sans"> <div className="mx-auto max-w-2xl"> <div className="rounded-3xl bg-white shadow-xl"> <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-8 text-white"> <h1 className="text-4xl font-extrabold tracking-tight"> Right to Cancel Calculator </h1> </div>

<div className="p-6">
        <input
          type="date"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          className="w-full rounded-xl border p-3 mb-4"
        />

        <button
          onClick={calculate}
          className="w-full bg-violet-700 text-white p-3 rounded-xl font-bold"
        >
          Calculate
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm">Signing Date</p>
                <p className="font-bold">{result.signingDate}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm">Rescission Deadline</p>
                <p className="font-bold">{result.rescissionDeadline}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm">Funding Date</p>
                <p className="font-bold">{result.fundingDate}</p>
              </div>
            </div>

            <button
              onClick={copyResult}
              className="w-full border p-3 rounded-xl"
            >
              {copied ? "Copied" : "Copy Result"}
            </button>

            <div>
              <h2 className="font-bold mb-2">Calculation Details</h2>
              <div className="space-y-3">
                {result.timeline.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl">
                    <p className="font-bold">• {item.date}</p>
                    <p className="text-sm mt-1">
                      {item.status === "counted"
                        ? "✅ Counted"
                        : item.status === "skipped"
                        ? "❌ Skipped"
                        : "ℹ️ Info"}{" "}
                      • {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              This tool is for informational purposes only.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</main>

); }
