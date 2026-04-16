import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// 🔐 Type for token payload
export interface JWTPayload {
  id: string;
  email: string;
  role: "student" | "tutor";
}

// ✅ SIGN TOKEN
export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

// ✅ VERIFY TOKEN
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

// ✅ EXTRACT TOKEN FROM REQUEST (for APIs)
export function getTokenFromReq(req: Request): string | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  // format: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  return token || null;
}

// ✅ PROTECT API ROUTES (middleware-style helper)
export function requireAuth(req: Request): JWTPayload | null {
  const token = getTokenFromReq(req);

  if (!token) return null;

  return verifyToken(token);
}