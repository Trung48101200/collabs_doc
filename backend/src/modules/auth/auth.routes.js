import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { userRepository } from "../user/user.repository.js";
import { tokenRepository } from "./token.repository.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { httpError } from "../../utils/http-error.js";

export const authRoutes = Router();

function getJwtSecret() {
  return process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026";
}

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      jti: Math.random().toString(36).substring(2) + Date.now()
    },
    getJwtSecret(),
    { expiresIn: "15m" }
  );
}

authRoutes.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw httpError(400, "Name, email, and password are required");
    }

    if (password.length < 6) {
      throw httpError(400, "Password must be at least 6 characters long");
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) throw httpError(400, "Email is already in use");

    const user = await userRepository.createUser({ name, email, password });
    res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw httpError(400, "Email and password are required");

    const user = await userRepository.findUserByEmail(email);
    if (!user) throw httpError(400, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw httpError(400, "Invalid email or password");

    const accessToken = createAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id }, `${getJwtSecret()}-refresh`, {
      expiresIn: "7d"
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    res.json({
      message: "Login successful",
      token: accessToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw httpError(400, "Refresh token is required");

    try {
      jwt.verify(refreshToken, `${getJwtSecret()}-refresh`);
    } catch (_error) {
      throw httpError(401, "Invalid or expired refresh token");
    }

    const dbToken = await tokenRepository.findRefreshToken(refreshToken);
    if (!dbToken) throw httpError(401, "Invalid refresh token");

    if (new Date(dbToken.expiresAt) < new Date()) {
      await tokenRepository.deleteRefreshToken(refreshToken);
      throw httpError(401, "Refresh token has expired");
    }

    const user = await userRepository.findUserById(dbToken.userId);
    if (!user) throw httpError(401, "User not found");

    const newAccessToken = createAccessToken(user);
    res.json({
      accessToken: newAccessToken,
      token: newAccessToken
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/logout", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        await tokenRepository.blacklistToken(token, new Date(decoded.exp * 1000));
      } catch (error) {
        console.log("Access token invalid or expired during logout, skipping blacklist:", error.message);
      }
    }

    const { refreshToken } = req.body;
    if (refreshToken) await tokenRepository.deleteRefreshToken(refreshToken);

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await userRepository.findUserById(req.user.id);
    if (!user) throw httpError(404, "User not found");
    res.json(user);
  } catch (error) {
    next(error);
  }
});
