export async function getSchedule(tasks, mood) {
  const res = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tasks, mood }),
  });

  return await res.json();
}
