import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirectPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate(redirectPath ?? '/dashboard', { replace: true });
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Login failed';
      setError(message);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm text-slate-700">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="block text-sm text-slate-700">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 text-white">
          Entrar
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link className="text-blue-700" to="/register">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
