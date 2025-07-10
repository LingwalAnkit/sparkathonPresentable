export default function TransportTimeline({ startT, endT }) {
  if (!startT && !endT) return null;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border mb-6 w-1/2">
      <h3 className="text-xl font-bold mb-4">⏱️ Transport Timeline</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Journey Started:</p>
          <p className="font-semibold">
            {startT
              ? new Date(parseInt(startT) * 1000).toLocaleString()
              : "Not started"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Journey Completed:</p>
          <p className="font-semibold">
            {endT
              ? new Date(parseInt(endT) * 1000).toLocaleString()
              : "In progress..."}
          </p>
        </div>
      </div>
    </div>
  );
}
