interface JWTPayload {
  userId?: string;
  sub?: string; // стандартное поле для subject (обычно userId)
  role?: string;
  exp?: number; // expiration timestamp
  iat?: number; // issued at timestamp
  [key: string]: unknown;
}

/**
 * Декодировать JWT токен без верификации подписи
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return payload.userId || payload.sub || null;
}

export function getRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return payload.role || null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = 60000;

  return currentTime >= expirationTime - bufferTime;
}

export function isTokenValid(token: string): boolean {
  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    return false;
  }

  const userId = getUserIdFromToken(token);
  return userId !== null;
}

export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return payload.exp * 1000;
}
