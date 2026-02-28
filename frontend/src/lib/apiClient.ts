import type { SimulationRequestDto, SimulationResponseDto } from '@simulador/shared';

export interface AuthResponse {
  token: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

const API_BASE_URL = 'http://localhost:3001';

async function request<TResponse>(
  path: string,
  init: RequestInit = {},
  token: string | null = null
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Request failed');
  }

  return (await response.json()) as TResponse;
}

export function register(credentials: AuthCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function login(credentials: AuthCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function runSimulation(
  payload: SimulationRequestDto,
  token: string
): Promise<SimulationResponseDto> {
  return request<SimulationResponseDto>(
    '/api/simulations',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
}
