import { useState } from "react";

function isSunday(date) { return date.getDay() === 0; }

function nthWeekdayOfMonth(year, month, weekday, nth) { const first = new Date(year, month, 1); const firstWeekday = first.getDay(); const offset = (weekday - firstWeekday + 7) % 7; return new Date(year, month, 1 + offset + (nth - 1) * 7); }

function lastWeekdayOfMonth(year, month, weekday) { const last = new Date(year, month + 1, 0); const offset = (last.getDay() - weekday + 7) % 7; return new Date(year, month, last.getDate() - offset); }

function observedHoliday(date) { const day = date.getDay(); if (day === 6) { return addDays(date, -1); } if (day === 0) { return addDays(date, 1); } return date; }

function getFederalHolidays(year) { return [ observedHoliday(new Date(year, 0, 1)), nthWeekdayOfMonth(year, 0, 1, 3), nthWeekdayOfMonth(year, 1, 1, 3), lastWeekdayOfMonth(year, 4, 1), observedHoliday(new Date(year, 5, 19)), observedHoliday(new Date(year, 6, 4)), nthWeekdayOfMonth(year, 8, 1, 1), nthWeekdayOfMonth(year, 9, 1, 2), observedHoliday(new Date(year, 10, 11)), nthWeekdayOfMonth(year, 10, 4, 4), observedHoliday(new Date(year, 11, 25)), ]; }

function getHolidayTimestampsForYears(years) { return new Set( years.flatMap((year) => getFederalHolidays(year).map( (holiday) => new Date(holiday.getFullYear(), holiday.getMonth(), holiday.getDate()).getTime() ) ) ); }

function isHoliday(date) { const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); const holidayYears = [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1]; const holidays = getHolidayTimestampsForYears(holidayYears); return holidays.has(normalized); }

function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

function formatDate(date) { return date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric", }); }

export default function Home() { const [inputDate, setInputDate] = useState(""); const [result, setResult] = useState(null);

const calculate = () => { if (!inputDate) return;

const signingDate = new Date(inputDate + "T00:00:00");
let date = addDays(signingDate, 1);
let count = 0;
const timeline = [];

while (count < 3) {
  if (isSunday(date)) {
    timeline.push({
      date: formatDate(date),
      status: "skipped",
      label: "Sunday (not counted)",
    });
  } else if (isHoliday(date)) {
    timeline.push({
      date: formatDate(date),
      status: "skipped",
      label: "Holiday (not counted)",
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
  rescissionDeadline: formatDate(rescissionDeadline),
  fundingDate: formatDate(fundingDate),
  timeline,
});

};

return ( <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6"> <div className="mx-auto max-w-2xl"> <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"> <div className="bg-gradient-to-r from-violet-700 to-indigo-700 px-6 py-8 text-white sm:px-8"> <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-violet-100"> Real Estate Utility </p> <h1 className="text-4xl font-bold leading-tight sm:text-5xl"> Right to Cancel Calculator </h1> <p className="mt-3 max-w-xl text-sm text-violet-100 sm:text-base"> Enter the signing date and get the rescission deadline instantly, with a clear breakdown of how it was counted. </p> </div>

<div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm text-violet-900">
            This calculator assumes the selected date is the last of the three rescission-triggering events: consummation, delivery of material disclosures, and delivery of the right-to-cancel notice.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Signing Date
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
            <button
              onClick={calculate}
              className="rounded-xl bg-violet-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-200"
            >
              Calculate
            </button>
          </div>
        </div>

        {result && (
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">
                How it was calculated
              </h2>
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
