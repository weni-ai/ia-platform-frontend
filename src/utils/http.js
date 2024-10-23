export function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}
