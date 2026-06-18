
function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl ${
        hover ? "hover:border-indigo-500/30 transition-all duration-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = "" }) {
  return <div className={`px-6 py-4 border-b border-slate-700/50 bg-slate-800/60 ${className}`}>{children}</div>
}

function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export { Card, CardHeader, CardContent }
