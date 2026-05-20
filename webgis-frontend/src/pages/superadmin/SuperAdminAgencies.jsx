export default function SuperAdminAgencies() {
  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold">Agencies</h1>
      <p className="text-xs text-slate-500">Verify and manage real estate agencies</p>

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="p-3">Agency</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["ABC Realty", "abc@example.com", "9800000000", "Yes"],
              ["Dang Properties", "dang@example.com", "9811111111", "No"],
            ].map((row, i) => (
              <tr key={i} className="border-b">
                {row.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}