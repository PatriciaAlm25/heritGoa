export async function getRoadRoute(origin, destination) {
  const response = await fetch('/api/ors-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to calculate the driving route.');
  return data;
}
