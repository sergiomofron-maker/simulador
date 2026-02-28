import { useMemo, useState, type FormEvent } from 'react';
import type { SimulationRequestDto, SimulationResponseDto } from '@simulador/shared';
import { useAuth } from '../auth/AuthContext';
import { runSimulation } from '../lib/apiClient';

const defaultPayload: SimulationRequestDto = {
  config: {
    principal: 10000,
    annualRatePercent: 6,
    years: 10,
    contributionPerMonth: 100
  }
};

export function SimulatorPage() {
  const { token } = useAuth();
  const [payload, setPayload] = useState<SimulationRequestDto>(defaultPayload);
  const [result, setResult] = useState<SimulationResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields = useMemo(
    () => [
      { key: 'principal', label: 'Principal inicial' },
      { key: 'annualRatePercent', label: 'Interés anual (%)' },
      { key: 'years', label: 'Años' },
      { key: 'contributionPerMonth', label: 'Aporte mensual' }
    ] as const,
    []
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      const response = await runSimulation(payload, token);
      setResult(response);
    } catch {
      setResult(null);
      setError('No se pudo calcular la simulación.');
    }
  };

  return (
    <>
      <section className="rounded-lg bg-white p-4 shadow">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">Simulador financiero</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <label key={field.key} className="block text-sm text-slate-700">
              {field.label}
              <input
                type="number"
                className="mt-1 w-full rounded border border-slate-300 p-2"
                value={payload.config[field.key] ?? 0}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setPayload((current) => ({
                    config: {
                      ...current.config,
                      [field.key]: value
                    }
                  }));
                }}
              />
            </label>
          ))}

          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Ejecutar simulación
          </button>
        </form>
      </section>

      {error ? <p className="mt-4 text-red-700">{error}</p> : null}

      {result ? (
        <section className="mt-4 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">Resultado</h2>
          <p>Balance final: {result.result.finalBalance}</p>
          <p>Total aportado: {result.result.totalContributions}</p>
          <p>Interés generado: {result.result.totalInterest}</p>
        </section>
      ) : null}
    </>
  );
}
