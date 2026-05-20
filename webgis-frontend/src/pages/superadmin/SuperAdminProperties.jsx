export default function SuperAdminProperties() {
  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold">Properties</h1>
      <p className="text-xs text-slate-500">Approve, reject, and monitor property ads</p>

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="p-3">Title</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["House for Sale", "Ram", "Rs. 1.2 Cr", "Pending"],
              ["Commercial Land", "ABC Realty", "Rs. 75 Lakh", "Approved"],
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