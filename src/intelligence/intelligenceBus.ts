import type { SystemStatusValue } from '@/store/intelligenceStore';

/**
 * Safely runs an intelligence engine, catching errors and returning a status.
 * This function is pure and does not interact with client-side state.
 */
export async function safeEngineRun<T>(
  engineName: string,
  engineFn: () => Promise<T | null | undefined>
): Promise<{ result: T | undefined; status: SystemStatusValue, duration: number }> {
  const startTime = performance.now();
  console.log(`--- [IntelligenceEngine] RUN: ${engineName} ---`);
  try {
    const result = await engineFn();
    const duration = performance.now() - startTime;
    
    // This is the key fix: converting null to undefined to match schemas.
    const finalResult = result === null ? undefined : result;
    
    if (finalResult === undefined || (Array.isArray(finalResult) && finalResult.length === 0)) {
      console.warn(`--- [IntelligenceEngine] WARN: ${engineName} returned empty or null result.`);
      return { result: undefined, status: 'DEGRADED', duration };
    }

    return { result: finalResult, status: 'ACTIVE', duration };
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`--- [IntelligenceEngine] ❌ FAIL: ${engineName} failed to execute:`, error);
    return { result: undefined, status: 'FAILED', duration };
  }
}
