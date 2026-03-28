/** Classificação semântica: verde (fraca), amarelo (moderada), vermelho (forte). */
export type RainIntensityLabel = 'Fraca' | 'Moderada' | 'Forte';

export interface RainIntensityStyle {
  label: RainIntensityLabel;
  /** Cor principal (texto / barra) */
  accent: string;
  /** Fundo suave para badges */
  softBg: string;
}

const WEAK_MAX = 5;
const MOD_MAX = 25;

export function getRainIntensity(mm: number): RainIntensityStyle {
  if (mm < WEAK_MAX) {
    return { label: 'Fraca', accent: '#2d7a4a', softBg: '#e8f5ec' };
  }
  if (mm < MOD_MAX) {
    return { label: 'Moderada', accent: '#b8860b', softBg: '#fdf6e3' };
  }
  return { label: 'Forte', accent: '#c43c3c', softBg: '#fdeaea' };
}
