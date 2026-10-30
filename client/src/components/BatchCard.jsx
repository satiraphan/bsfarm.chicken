export default function BatchCard({ batch }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">{batch.name}</h4>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          {batch.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div>Age: {batch.age}</div>
        <div>Growth: {batch.growth}</div>
        <div>FCR: {batch.fcr}</div>
        <div>Birds: {batch.birds}</div>
      </div>
    </div>
  );
}
