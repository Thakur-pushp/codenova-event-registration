const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch {
    throw new Error("Can't reach the API. Check that the server is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const getEvents = () => request("/events");
export const registerForEvent = (eventId, payload) =>
  request(`/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
export const getRegistrations = (key, search = "") =>
  request(`/admin/registrations?search=${encodeURIComponent(search)}`, {
    headers: { "x-admin-key": key }
  });
