export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

function authHeaders(): HeadersInit {
  try {
    const raw = localStorage.getItem("metrogram_auth_user");
    if (!raw) return {};
    const user = JSON.parse(raw) as { id?: string };
    if (!user?.id) return {};
    return { "X-User-Id": user.id };
  } catch {
    return {};
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(authHeaders() as Record<string, string>),
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers,
    });
  } catch {
    throw new Error("Serverga ulanib bo'lmadi. Backend ishga tushirilganini tekshiring.");
  }

  if (!response.ok) {
    if (response.status === 502 || response.status === 503) {
      throw new Error(
        "Backend ishlamayapti. Terminalda: cd Backend && npm run start:dev",
      );
    }
    if (response.status === 413) {
      throw new Error("Rasm juda katta. Iltimos kichikroq rasm tanlang.");
    }
    if (response.status === 429) {
      throw new Error(
        "Juda ko'p so'rov yuborildi. Bir necha soniya kutib, qayta urinib ko'ring.",
      );
    }

    let message = `HTTP ${response.status}`;
    try {
      const err = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(err.message)) message = err.message.join(", ");
      else if (err.message) message = err.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const json = (await response.json()) as T | ApiEnvelope<T>;
  if (json && typeof json === "object" && "data" in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}
