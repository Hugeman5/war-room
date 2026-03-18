
import type { MacroEvent } from '../schemas';
import type { RiskLevel } from '@/types/engineTypes';

// Mock data source for macro events. In a real system, this would come from an API.
const MOCK_EVENTS = [
  { name: 'CPI Data Release (USA)', date: '2024-08-14T12:30:00Z', impact: 'HIGH', type: 'INFLATION_RELEASE' },
  { name: 'FOMC Meeting Minutes', date: '2024-08-21T18:00:00Z', impact: 'HIGH', type: 'CENTRAL_BANK_SPEECH' },
  { name: 'Jackson Hole Symposium', date: '2024-08-22T14:00:00Z', impact: 'MODERATE', type: 'CENTRAL_BANK_SPEECH' },
  { name: 'Non-Farm Payroll (USA)', date: '2024-09-06T12:30:00Z', impact: 'HIGH', type: 'INFLATION_RELEASE' },
  { name: 'ECB Interest Rate Decision', date: '2024-09-12T12:15:00Z', impact: 'HIGH', type: 'INTEREST_RATE_DECISION' },
];

export async function analyzeMacroEvents(): Promise<MacroEvent> {
  const now = new Date();
  const nextEvent = MOCK_EVENTS.find(event => new Date(event.date) > now);

  if (!nextEvent) {
    return {
      macroRisk: 'LOW',
      riskDirection: 'NEUTRAL',
      event: 'No major events scheduled.',
      impactLevel: 'LOW',
      direction: 'NEUTRAL',
      volatilityExpectation: 'NORMAL',
    };
  }

  const eventTime = new Date(nextEvent.date);
  const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  let risk: RiskLevel = 'LOW';
  if (nextEvent.impact === 'HIGH' && hoursUntilEvent < 24) {
    risk = 'HIGH';
  } else if (hoursUntilEvent < 48) {
    risk = 'MODERATE';
  }

  let volExpectation: 'LOW' | 'NORMAL' | 'ELEVATED' = 'NORMAL';
  if (risk === 'HIGH' && hoursUntilEvent < 4) {
      volExpectation = 'ELEVATED';
  }

  let riskDirection: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' = 'NEUTRAL';
  let btcDirection: 'BULLISH_BTC' | 'BEARISH_BTC' | 'NEUTRAL' = 'NEUTRAL';
  
  // Simplified interpretation logic
  if (nextEvent.type === 'INTEREST_RATE_DECISION') {
      // Assuming a hawkish stance is expected (bad for BTC)
      riskDirection = 'RISK_OFF';
      btcDirection = 'BEARISH_BTC';
  } else if (nextEvent.type === 'INFLATION_RELEASE') {
       // High inflation is complex, could be bullish (inflation hedge) or bearish (Fed tightens)
       // Let's model it as creating uncertainty -> RISK_OFF
       riskDirection = 'RISK_OFF';
       btcDirection = 'NEUTRAL';
  }

  return {
    macroRisk: risk,
    riskDirection,
    event: `${nextEvent.name} in ~${Math.round(hoursUntilEvent)}h`,
    impactLevel: nextEvent.impact as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
    direction: btcDirection,
    volatilityExpectation: volExpectation,
  };
}
