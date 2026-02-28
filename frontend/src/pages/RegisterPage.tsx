import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await register(email, password);
      navigate('/dashboard', { replace: true });
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Registration failed';
      setError(message);
    }
  };

  return (
    <main className="mx-auto mt-12 max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Crear cuenta</h1>
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
          Crear cuenta
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link className="text-blue-700" to="/login">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
