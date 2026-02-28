export interface ResistiveElement {
  resistanceOhm: number;
}

export interface ConverterElement extends ResistiveElement {
  id: string;
}

export interface ThreePhaseComponents {
  generator: ResistiveElement;
  line: ResistiveElement;
  transformer: ResistiveElement;
  converters: ConverterElement[];
  load: ResistiveElement;
}

export interface ThreePhaseEngineInput {
  V_L: number;
  P: number;
  cosPhi: number;
  components: ThreePhaseComponents;
  frequencyHz?: number;
  waveformSamples?: number;
}

export interface PowerMetrics {
  P: number;
  S: number;
  Q: number;
  I: number;
  cosPhi: number;
}

export interface ConverterLossDto {
  id: string;
  resistanceOhm: number;
  jouleLossW: number;
}

export interface JouleLossesDto {
  generatorW: number;
  lineW: number;
  transformerW: number;
  loadW: number;
  converters: ConverterLossDto[];
  convertersTotalW: number;
  totalW: number;
}

export interface ComplexPhasorDto {
  magnitude: number;
  angleDeg: number;
  real: number;
  imaginary: number;
}

export interface ThreePhasePhasorDto {
  voltagePhase: {
    a: ComplexPhasorDto;
    b: ComplexPhasorDto;
    c: ComplexPhasorDto;
  };
  currentPhase: {
    a: ComplexPhasorDto;
    b: ComplexPhasorDto;
    c: ComplexPhasorDto;
  };
}

export interface WaveformPointDto {
  t: number;
  va: number;
  vb: number;
  vc: number;
  ia: number;
  ib: number;
  ic: number;
}

export interface ThreePhaseEngineOutput {
  power: PowerMetrics;
  losses: JouleLossesDto;
  eta: number;
  phasors: ThreePhasePhasorDto;
  waveformSeries: WaveformPointDto[];
}

const SQRT_2 = Math.sqrt(2);
const SQRT_3 = Math.sqrt(3);
const DEFAULT_FREQUENCY_HZ = 50;
const DEFAULT_WAVEFORM_SAMPLES = 120;
const MIN_COS_PHI = 1e-6;

export function computeApparentPower(P: number, cosPhi: number): number {
  return P / cosPhi;
}

export function computeReactivePower(S: number, P: number): number {
  return Math.sqrt(Math.max(S ** 2 - P ** 2, 0));
}

export function computeLineCurrent(S: number, V_L: number): number {
  return S / (SQRT_3 * V_L);
}

export function computeJouleLoss(I: number, resistanceOhm: number): number {
  return 3 * I ** 2 * resistanceOhm;
}

export function runThreePhaseSimulation(input: ThreePhaseEngineInput): ThreePhaseEngineOutput {
  validateInput(input);

  const S = computeApparentPower(input.P, input.cosPhi);
  const Q = computeReactivePower(S, input.P);
  const I = computeLineCurrent(S, input.V_L);

  const generatorW = computeJouleLoss(I, input.components.generator.resistanceOhm);
  const lineW = computeJouleLoss(I, input.components.line.resistanceOhm);
  const transformerW = computeJouleLoss(I, input.components.transformer.resistanceOhm);
  const loadW = computeJouleLoss(I, input.components.load.resistanceOhm);

  const converterLosses = input.components.converters.map((converter) => ({
    id: converter.id,
    resistanceOhm: converter.resistanceOhm,
    jouleLossW: computeJouleLoss(I, converter.resistanceOhm)
  }));

  const convertersTotalW = converterLosses.reduce((total, converter) => total + converter.jouleLossW, 0);
  const totalW = generatorW + lineW + transformerW + loadW + convertersTotalW;

  const P_generator = input.P + totalW;
  const eta = P_generator > 0 ? input.P / P_generator : 0;

  const phasors = buildPhasors(input.V_L, I, input.cosPhi);
  const waveformSeries = buildWaveformSeries({
    V_L: input.V_L,
    I,
    cosPhi: input.cosPhi,
    frequencyHz: input.frequencyHz ?? DEFAULT_FREQUENCY_HZ,
    samples: input.waveformSamples ?? DEFAULT_WAVEFORM_SAMPLES
  });

  return {
    power: {
      P: input.P,
      S,
      Q,
      I,
      cosPhi: input.cosPhi
    },
    losses: {
      generatorW,
      lineW,
      transformerW,
      loadW,
      converters: converterLosses,
      convertersTotalW,
      totalW
    },
    eta,
    phasors,
    waveformSeries
  };
}

function validateInput(input: ThreePhaseEngineInput): void {
  if (input.V_L <= 0) {
    throw new Error('V_L must be greater than 0.');
  }

  if (input.P < 0) {
    throw new Error('P must be non-negative.');
  }

  if (input.cosPhi < MIN_COS_PHI || input.cosPhi > 1) {
    throw new Error('cosPhi must be in (0, 1].');
  }

  if ((input.frequencyHz ?? DEFAULT_FREQUENCY_HZ) <= 0) {
    throw new Error('frequencyHz must be greater than 0.');
  }

  if ((input.waveformSamples ?? DEFAULT_WAVEFORM_SAMPLES) < 3) {
    throw new Error('waveformSamples must be at least 3.');
  }

  const resistances: Array<[name: string, value: number]> = [
    ['generator', input.components.generator.resistanceOhm],
    ['line', input.components.line.resistanceOhm],
    ['transformer', input.components.transformer.resistanceOhm],
    ['load', input.components.load.resistanceOhm]
  ];

  for (const [name, value] of resistances) {
    if (value < 0) {
      throw new Error(`${name} resistance must be non-negative.`);
    }
  }

  for (const converter of input.components.converters) {
    if (!converter.id.trim()) {
      throw new Error('converter id must be non-empty.');
    }

    if (converter.resistanceOhm < 0) {
      throw new Error(`converter (${converter.id}) resistance must be non-negative.`);
    }
  }
}

function buildPhasors(V_L: number, I: number, cosPhi: number): ThreePhasePhasorDto {
  const phaseVoltageRms = V_L / SQRT_3;
  const phi = Math.acos(cosPhi);
  const phiDeg = radiansToDegrees(phi);

  const voltageAngles = { a: 0, b: -120, c: 120 } as const;
  const currentAngles = {
    a: -phiDeg,
    b: -120 - phiDeg,
    c: 120 - phiDeg
  } as const;

  return {
    voltagePhase: {
      a: createPhasor(phaseVoltageRms, voltageAngles.a),
      b: createPhasor(phaseVoltageRms, voltageAngles.b),
      c: createPhasor(phaseVoltageRms, voltageAngles.c)
    },
    currentPhase: {
      a: createPhasor(I, currentAngles.a),
      b: createPhasor(I, currentAngles.b),
      c: createPhasor(I, currentAngles.c)
    }
  };
}

function buildWaveformSeries(params: {
  V_L: number;
  I: number;
  cosPhi: number;
  frequencyHz: number;
  samples: number;
}): WaveformPointDto[] {
  const V_phase_peak = (params.V_L / SQRT_3) * SQRT_2;
  const I_phase_peak = params.I * SQRT_2;
  const phi = Math.acos(params.cosPhi);
  const omega = 2 * Math.PI * params.frequencyHz;
  const period = 1 / params.frequencyHz;
  const dt = period / params.samples;

  const series: WaveformPointDto[] = [];

  for (let index = 0; index <= params.samples; index += 1) {
    const t = index * dt;
    const theta = omega * t;

    series.push({
      t,
      va: V_phase_peak * Math.sin(theta),
      vb: V_phase_peak * Math.sin(theta - (2 * Math.PI) / 3),
      vc: V_phase_peak * Math.sin(theta + (2 * Math.PI) / 3),
      ia: I_phase_peak * Math.sin(theta - phi),
      ib: I_phase_peak * Math.sin(theta - (2 * Math.PI) / 3 - phi),
      ic: I_phase_peak * Math.sin(theta + (2 * Math.PI) / 3 - phi)
    });
  }

  return series;
}

function createPhasor(magnitude: number, angleDeg: number): ComplexPhasorDto {
  const angleRad = degreesToRadians(angleDeg);
  return {
    magnitude,
    angleDeg,
    real: magnitude * Math.cos(angleRad),
    imaginary: magnitude * Math.sin(angleRad)
  };
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}
