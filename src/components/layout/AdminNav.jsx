import { Link, NavLink } from 'react-router-dom'

const tab = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isActive
    ? 'bg-amber-500 text-black'
    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'}`

// Header shared by the admin pages: logo, Users/Feedback tabs, refresh.
export default function AdminNav({ onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-4">
        <Link to="/viewer" className="text-amber-500 dark:text-amber-400 font-bold text-xl">AcuMap</Link>
        <nav className="flex gap-1">
          <NavLink to="/admin" end className={tab}>Users</NavLink>
          <NavLink to="/admin/feedback" className={tab}>Feedback</NavLink>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {onRefresh && (
          <button onClick={onRefresh} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Refresh</button>
        )}
        <Link to="/account" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Account</Link>
      </div>
    </div>
  )
}
