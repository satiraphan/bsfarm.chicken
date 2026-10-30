import { Activity, House, TrendingUp, Users } from 'lucide-react';
import AnalyticsChart from './components/AnalyticsChart';
import BatchCard from './components/BatchCard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WorkerLogForm from './components/WorkerLogForm';
import { analyticsData, batchCards, houses, summaryCards } from './data/mockData';

const iconMap = {
  house: House,
  activity: Activity,
  trend: TrendingUp,
  users: Users,
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 lg:grid-cols-[220px_1fr]">
          <Sidebar />
          <div>
            <Navbar />

            <section className="mb-6 grid gap-4 md:grid-cols-4">
              {summaryCards.map(({ label, value, icon }) => {
                const Icon = iconMap[icon];
                return (
                  <div key={label} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-slate-500">{label}</span>
                      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                        <Icon size={18} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{value}</div>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
              <AnalyticsChart data={analyticsData} />

              <div className="space-y-6">
                <WorkerLogForm />

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">House Status</h3>
                  <div className="space-y-3 text-sm">
                    {houses.map(({ name, capacity, status }) => (
                      <div key={name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                        <div>
                          <div className="font-semibold text-slate-800">{name}</div>
                          <div className="text-slate-500">{capacity}</div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Batch Overview</h3>
                <button className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white">View all</button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {batchCards.map((batch) => (
                  <BatchCard key={batch.name} batch={batch} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
