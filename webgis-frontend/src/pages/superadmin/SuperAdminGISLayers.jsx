export default function SuperAdminGISLayers() {
  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold">GIS Layers</h1>
      <p className="text-xs text-slate-500">Manage spatial layers and uploaded GIS data</p>

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-slate-500">
              <th className="p-3">Layer</th>
              <th className="p-3">Type</th>
              <th className="p-3">Geometry</th>
              <th className="p-3">Visible</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Road Network", "Vector", "Line", "Yes"],
              ["Flood Risk Zone", "Vector", "Polygon", "No"],
              ["DEM", "Raster", "-", "Yes"],
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