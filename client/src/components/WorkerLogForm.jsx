import { Droplets, Egg, ThermometerSun } from 'lucide-react';

const quickActions = [
  { label: 'Bird Death', icon: Egg, color: 'bg-emerald-600' },
  { label: 'Feed', icon: Egg, color: 'bg-sky-600' },
  { label: 'Temp', icon: ThermometerSun, color: 'bg-amber-500' },
  { label: 'Water', icon: Droplets, color: 'bg-cyan-600' },
];

export default function WorkerLogForm() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Worker Entry</h3>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {quickActions.map(({ label, icon: Icon, color }) => (
          <button key={label} className={`flex min-h-[80px] flex-col items-center justify-center gap-2 rounded-2xl text-white ${color}`}>
            <Icon size={28} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'OK'].map((key) => (
          <button key={key} className="min-h-[52px] rounded-xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700">
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
