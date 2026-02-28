import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow">
        <nav className="flex gap-4 text-sm font-medium text-slate-700">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/simulator">Simulator</Link>
          <Link to="/history">History</Link>
        </nav>

        <button type="button" className="rounded bg-slate-900 px-3 py-2 text-white" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <Outlet />
    </main>
  );
}
