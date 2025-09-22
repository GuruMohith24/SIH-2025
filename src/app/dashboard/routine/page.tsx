export default function RoutinePage() {
  // Placeholder routine combining classes/free blocks with goal reminders
  const today = [
    { time: "09:00", label: "DBMS Lecture", type: "class" },
    { time: "10:00", label: "Free Period — Practice 20 mins DSA", type: "free" },
    { time: "11:00", label: "OS Tutorial", type: "class" },
    { time: "12:00", label: "Free Period — Read DS interview Qs", type: "free" }
  ];
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Routine for Today</h1>
      <div className="border rounded-md divide-y">
        {today.map((slot) => (
          <div key={slot.time} className="flex items-center justify-between p-3">
            <div className="text-sm text-gray-600">{slot.time}</div>
            <div className={slot.type === "class" ? "text-indigo-700" : "text-emerald-700"}>{slot.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}



