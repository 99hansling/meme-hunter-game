import { PropagationParams } from '../types';

/**
 * Calculates the price at a specific propagation distance (d)
 * based on the user's P(d) formula structure.
 * 
 * P(d) = P0 * e^(-beta*d) * S(d)^gamma * e^(-R*d) * A(d) * V(d)
 * 
 * Simplified for game balance:
 * Price = BaseScale * TrustFactor * ScarcityFactor * AudienceFactor * CapitalFactor
 */
export const calculatePriceAtDistance = (d: number, params: PropagationParams): number => {
  // Prevent negative d
  const dist = Math.max(0, d);

  // 1. Trust Decay: e^(-beta * d)
  // As info spreads further, trust decreases.
  const trustFactor = Math.exp(-params.beta * dist);

  // 2. Scarcity: e^(-R * d)
  // As info spreads, it becomes less unique/exclusive.
  const scarcityFactor = Math.exp(-params.R * dist);

  // 3. Audience: A(d) ~ Gaussian
  // This is the main "Pump" driver. It must overpower the decay factors initially.
  // We model the "Effective Audience Size" at layer d.
  const audienceFactor = Math.exp(-params.lambda * Math.pow(dist - params.d_peak_est, 2));

  // 4. Volume/Capital: V(d) = V0 * d^(-delta)
  // CRITICAL FIX: Used (dist + 3) instead of (dist + 0.5) to soften the initial decay.
  // If this decays too fast near d=0, the price crashes immediately.
  // With (d+3), the drop from d=0 to d=3 is much gentler, allowing the Audience factor to pump the price.
  const capitalFactor = Math.pow(dist + 3, -params.delta);

  // Combine
  // P0 is a scaling factor.
  let rawPrice = params.P0 * trustFactor * scarcityFactor * audienceFactor * capitalFactor;
  
  // Add some random market noise
  const noise = (Math.random() - 0.5) * (rawPrice * 0.05);
  
  return Math.max(0.001, rawPrice + noise);
};

export const getSocialSignal = (d: number, signals: {d: number, text: string, source: string}[]) => {
  // Find the closest signal that is less than or equal to current d
  const signal = signals.reduce((prev, curr) => {
    return (curr.d <= d && curr.d > prev.d) ? curr : prev;
  }, signals[0]);
  return signal;
};