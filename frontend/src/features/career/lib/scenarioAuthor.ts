import type { CareerScenario } from '../model';

/** Email автора сценария из populate; если нет — «—». */
export function getScenarioAuthorEmail(
  scenario: Pick<CareerScenario, 'createdBy'> | { createdBy?: unknown }
): string {
  const cb = scenario.createdBy;
  if (cb && typeof cb === 'object' && 'email' in cb) {
    const email = (cb as { email?: string }).email;
    if (typeof email === 'string' && email.trim()) return email;
  }
  return '—';
}
