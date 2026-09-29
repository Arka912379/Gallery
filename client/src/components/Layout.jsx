import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

// Shared sidebar shell for every logged-in area (user gallery pages and the admin dashboard).
// `navItems` decides which links show, so the same component serves both roles.
export default function Layout({ navItems, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b-[3px] border-black bg-purple-100 p-4 dark:border-neutral-100 dark:bg-neutral-900 md:min-h-screen md:w-64 md:border-b-0 md:border-r-[3px] md:p-5">
        <div className="mb-6 flex items-center justify-between gap-2 md:flex-col md:items-start">
          <div className="flex items-center gap-2">
            <span className="sticker">
              <Camera size={18} className="-rotate-[-8deg] text-black" />
            </span>
            <span className="text-lg font-extrabold">Photo Gallery</span>
          </div>
          <div className="md:mt-4 md:self-end">
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 font-semibold transition-colors ${
                  isActive
                    ? 'border-[3px] border-black bg-purple-500 text-white shadow-brutal-sm dark:border-neutral-100'
                    : 'hover:bg-purple-200/70 dark:hover:bg-neutral-800'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" onClick={handleLogout} className="btn-coral mt-6 hidden w-full md:flex">
          <LogOut size={18} /> Logout
        </button>
        <button type="button" onClick={handleLogout} className="btn-coral mt-4 flex w-full md:hidden">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
