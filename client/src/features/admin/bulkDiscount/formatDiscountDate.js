export function formatDiscountDate(dateArray) {
  if (!dateArray || dateArray.length < 3) return 'N/A';
  const [year, month, day] = dateArray;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
