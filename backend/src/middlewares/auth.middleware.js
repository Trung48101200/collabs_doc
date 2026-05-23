import jwt from "jsonwebtoken";
import { httpError } from "../utils/http-error.js";
import { tokenRepository } from "../modules/auth/token.repository.js";

export async function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(httpError(401, "Access denied. No token provided."));
  }

  const token = authHeader.split(" ")[1];
  try {
    const isBlacklisted = await tokenRepository.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(httpError(401, "Invalid or expired token."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026");
    req.user = {
      id: Number(decoded.id),
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (error) {
    return next(httpError(401, "Invalid or expired token."));
  }
}


// Keep mockAuth for legacy support if needed, but we will migrate to authMiddleware
export function mockAuth(req, _res, next) {
  const userId = Number(req.header("x-user-id") || 1);
  req.user = {
    id: userId,
    name: req.header("x-user-name") || `User ${userId}`
  };
  next();
}
