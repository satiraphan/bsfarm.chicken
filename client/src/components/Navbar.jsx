export default function Navbar() {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-600">Broiler Farm Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
      </div>
      <div className="flex gap-2 text-sm">
        <button className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2">ไทย</button>
        <button className="rounded-full border border-slate-200 px-3 py-2">မြန်မာ</button>
        <button className="rounded-full border border-slate-200 px-3 py-2">EN</button>
      </div>
    </header>
  );
}
