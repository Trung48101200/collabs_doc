import { Router } from "express";

export const authRoutes = Router();

authRoutes.post("/register", (req, res) => {
  res.status(201).json({
    message: "Auth skeleton only. Replace with real register logic.",
    user: { id: 1, name: req.body.name || "Demo User" }
  });
});

authRoutes.post("/login", (req, res) => {
  res.json({
    message: "Auth skeleton only. Replace with JWT login logic.",
    token: "demo-token",
    user: { id: 1, name: req.body.name || "Demo User" }
  });
});

authRoutes.get("/me", (_req, res) => {
  res.json({ id: 1, name: "Demo User" });
});
