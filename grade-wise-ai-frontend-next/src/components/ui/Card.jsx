
function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 ${
        hover ? "hover:shadow-lg transition-shadow duration-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className = "" }) {
  return <div className={`p-6 border-b border-gray-200 dark:border-slate-700 ${className}`}>{children}</div>
}

function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export { Card, CardHeader, CardContent }
