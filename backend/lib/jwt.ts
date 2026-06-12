import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

interface JwtPayload {
  email: string;
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return JWT_SECRET;
}

export function signToken(payload: JwtPayload): string {
  // Sign a token valid for 24 hours
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "email" in decoded &&
      typeof (decoded as JwtPayload).email === "string"
    ) {
      return decoded as JwtPayload;
    }
    return null;
  } catch (error) {
    return null;
  }
}
