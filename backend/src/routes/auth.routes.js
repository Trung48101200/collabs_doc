import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "../models/user.model.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { httpError } from "../utils/http-error.js";
import {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  blacklistToken
} from "../models/token.model.js";

export const authRoutes = Router();

authRoutes.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      throw httpError(400, "Name, email, and password are required");
    }
    
    if (password.length < 6) {
      throw httpError(400, "Password must be at least 6 characters long");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw httpError(400, "Email is already in use");
    }

    const user = await createUser({ name, email, password });
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

    if (!email || !password) {
      throw httpError(400, "Email and password are required");
    }

    const user = await findUserByEmail(email);
    if (!user) {
      throw httpError(400, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw httpError(400, "Invalid email or password");
    }

    const jwtSecret = process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026";
    const refreshSecret = jwtSecret + "-refresh";

    // Generate short-lived access token (15 minutes)
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        jti: Math.random().toString(36).substring(2) + Date.now()
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    // Generate long-lived refresh token (7 days)
    const refreshToken = jwt.sign(
      { id: user.id },
      refreshSecret,
      { expiresIn: "7d" }
    );

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(user.id, refreshToken, expiresAt);

    res.json({
      message: "Login successful",
      token: accessToken, // for backward compatibility
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
    if (!refreshToken) {
      throw httpError(400, "Refresh token is required");
    }

    const jwtSecret = process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026";
    const refreshSecret = jwtSecret + "-refresh";

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      throw httpError(401, "Invalid or expired refresh token");
    }

    const dbToken = await findRefreshToken(refreshToken);
    if (!dbToken) {
      throw httpError(401, "Invalid refresh token");
    }

    // Check if token is expired in database
    if (new Date(dbToken.expiresAt) < new Date()) {
      await deleteRefreshToken(refreshToken);
      throw httpError(401, "Refresh token has expired");
    }

    // Find the user to get current details
    const user = await findUserById(dbToken.userId);
    if (!user) {
      throw httpError(401, "User not found");
    }

    // Issue a new access token
    const newAccessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        jti: Math.random().toString(36).substring(2) + Date.now()
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    res.json({
      accessToken: newAccessToken,
      token: newAccessToken // for backward compatibility
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/logout", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const jwtSecret = process.env.JWT_SECRET || "admin-collab-docs-super-secret-key-2026";
        const decoded = jwt.verify(token, jwtSecret);
        const expiresAt = new Date(decoded.exp * 1000);
        await blacklistToken(token, expiresAt);
      } catch (err) {
        // If token is already invalid or expired, no need to blacklist
        console.log("Access token invalid or expired during logout, skipping blacklist:", err.message);
      }
    }

    const { refreshToken } = req.body;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
});

authRoutes.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      throw httpError(404, "User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});
