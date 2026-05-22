export function mockAuth(req, _res, next) {
  const userId = Number(req.header("x-user-id") || 1);
  req.user = {
    id: userId,
    name: req.header("x-user-name") || `User ${userId}`
  };
  next();
}
