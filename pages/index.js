import { useState } from "react";

function isSunday(date) { return date.getDay() === 0; }

function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

function nthWeekdayOfMonth(year, month, weekday, nth) { const first = new Date(year, month, 1); const firstWeekday = first.getDay(); const offset = (weekday - firstWeekday + 7) % 7; return new Date(year, month, 1 + offset + (nth - 1) * 7); }

function lastWeekdayOfMonth(year, month, weekday) { const last = new Date(year, month + 1, 0); const offset = (last.getDay() - weekday + 7) % 7; return new Date(year, month, last.getDate() - offset); }

function observedHoliday(date) { const day = date.getDay(); if (day === 6) return addDays(date, -1); if (day === 0) return addDays(date, 1); return date; }

function getFederalHolidays(year) { return [ { name: "New Year's Day", date: observedHoliday(new Date(year, 0, 1)) }, { name: 'Martin Luther King Jr. Day', date: nthWeekdayOfMonth(year, 0, 1, 3) }, { name: "Presidents Day", date: nthWeekdayOfMonth(year, 1, 1, 3) }, { name: "Memorial Day", date: lastWeekdayOfMonth(year, 4, 1) }, { name: "Juneteenth", date: observedHoliday(new Date(year, 5, 19)) }, { name: "Independence Day", date: observedHoliday(new Date(year, 6, 4)) }, { name: "Labor Day", date: nthWeekdayOfMonth(year, 8, 1, 1) }, { name: "Columbus Day", date: nthWeekdayOfMonth(year, 9, 1, 2) }, { name: "Veterans Day", date: observedHoliday(new Date(year, 10, 11)) }, { name: "Thanksgiving Day", date: nthWeekdayOfMonth(year, 10, 4, 4) }, { name: "Christmas Day", date: observedHoliday(new Date(year, 11, 25)) }, ]; }

function getHolidayMapForYears(years) { const map = new Map();

years.forEach((year) => { getFederalHolidays(year).forEach((holiday) => { const key = new Date( holiday.date.getFullYear(), holiday.date.getMonth(), holiday.date.getDate() ).getTime(); map.set(key, holiday.name); }); });

return map; }

function getHolidayName(date) { const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); const holidayYears = [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1]; const holidayMap = getHolidayMapForYears(holidayYears); return holidayMap.get(normalized) || null; }

function isHoliday(date) { return Boolean(getHolidayName(date)); }

function formatDate(date) { return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", }); }

export default function Home() { const [inputDate, setInputDate] = useState(""); const [transactionType, setTransactionType] = useState("refinance"); const [result, setResult] = useState(null); const [copied, setCopied] = useState(false);

const calculate = () => { if (!inputDate) return;

if (transactionType === "purchase") {
  setResult({
    type: "warning",
    title: "Rescission usually does not apply",
    message:
      "Purchase transactions generally do not have a federal 3-day right of rescission. Confirm with your title company, lender, or attorney.",
  });
  return;
}

const signingDate = new Date(inputDate + "T00:00:00");
let date = addDays(signingDate, 1);
let count = 0;
const timeline = [];

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
  type: "calculation",
  rescissionDeadline: formatDate(rescissionDeadline),
  fundingDate: formatDate(fundingDate),
  timeline,
  copyText: `Transaction Type: ${transactionType}\nRescission Deadline: ${formatDate(
    rescissionDeadline
  )}\nEarliest Funding: ${formatDate(fundingDate)}`,
});

};

const copyResult = async () => { if (!result || result.type !== "calculation") return;

try {
  await navigator.clipboard.writeText(result.copyText);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
} catch (error) {
  console.error("Copy failed", error);
}

};

return ( <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6"> <div className="mx-auto max-w-2xl"> <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"> <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-8 text-white sm:px-8"> <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-100"> Real Estate Utility </p> <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"> Right to Cancel Calculator </h1> <p className="mt-3 max-w-xl text-sm text-violet-100 sm:text-base"> Enter a date, choose the transaction type, and get a clear rescission result with the counting shown below. </p> </div>

<div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm font-medium text-violet-900">
            This calculator assumes the selected date is the last of the three rescission-triggering events: consummation, delivery of material disclosures, and delivery of the right-to-cancel notice.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="refinance">Refinance</option>
                <option value="heloc">HELOC</option>
                <option value="home-equity">Home Equity Loan</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Signing Date
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <button
            onClick={calculate}
            className="mt-4 w-full rounded-xl bg-violet-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200"
          >
            Calculate
          </button>
        </div>

        {result && result.type === "warning" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Heads Up
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{result.title}</h2>
            <p className="mt-2 text-sm text-slate-700 sm:text-base">{result.message}</p>
          </div>
        )}

        {result && result.type === "calculation" && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Rescission Deadline
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {result.rescissionDeadline}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Earliest Funding
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {result.fundingDate}
                </p>
              </div>
            </div>

            <button
              onClick={copyResult}
              className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              {copied ? "Copied" : "Copy Result"}
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Calculation Details</h2>
              <div className="mt-4 space-y-3">
                {result.timeline.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-800 sm:text-base">
                      {item.date}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
                        item.status === "counted"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status === "counted" ? "Counted" : "Skipped"} • {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                For TILA rescission, business days are all calendar days except Sundays and federal legal holidays. This tool assumes the selected date is the last triggering event and is for informational purposes only, not legal advice.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</main>

); }
