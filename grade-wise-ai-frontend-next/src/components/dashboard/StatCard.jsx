export default function StatCard({ label, value, icon: Icon, cardClass, iconClass }) {
  return (
    <div className={`rounded-2xl p-5 border border-slate-700/40 shadow-lg ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconClass}`}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatCardGrid({ children, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  return <div className={`grid ${columns} gap-4 mb-8`}>{children}</div>;
}
