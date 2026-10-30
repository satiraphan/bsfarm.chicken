import { Activity, BarChart3, House, ShieldCheck, Users } from 'lucide-react';

const items = [
  { label: 'Dashboard', icon: BarChart3, active: true },
  { label: 'Houses', icon: House },
  { label: 'Logs', icon: Activity },
  { label: 'Workers', icon: Users },
  { label: 'Vet', icon: ShieldCheck },
];

export default function Sidebar() {
  return (
    <aside className="hidden rounded-2xl bg-slate-900 p-4 text-slate-100 lg:block">
      <div className="mb-8 text-lg font-bold">FarmOps</div>
      <nav className="space-y-2">
        {items.map(({ label, icon: Icon, active }) => (
          <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm ${active ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
