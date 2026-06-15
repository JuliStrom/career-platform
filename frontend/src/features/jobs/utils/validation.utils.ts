export function parseSalaryValues(
  salaryMin?: string,
  salaryMax?: string
): {
  min: number | undefined;
  max: number | undefined;
  isValidMin: boolean;
  isValidMax: boolean;
} {
  const salaryMinStr = salaryMin?.trim() ?? '';
  const salaryMaxStr = salaryMax?.trim() ?? '';
  const min = salaryMinStr !== '' ? Number(salaryMinStr) : undefined;
  const max = salaryMaxStr !== '' ? Number(salaryMaxStr) : undefined;

  const isValidMin = min !== undefined && !Number.isNaN(min) && min >= 0;
  const isValidMax = max !== undefined && !Number.isNaN(max) && max >= 0;

  return { min, max, isValidMin, isValidMax };
}
