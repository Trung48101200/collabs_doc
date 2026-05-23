import { BlacklistedToken, RefreshToken } from "./token.model.js";

function serializeRefreshToken(token) {
  if (!token) return null;
  const plain = token.get({ plain: true });
  return {
    id: Number(plain.id),
    userId: Number(plain.userId),
    token: plain.token,
    expiresAt: plain.expiresAt,
    createdAt: plain.createdAt
  };
}

export class TokenRepository {
  async saveRefreshToken(userId, token, expiresAt) {
    await RefreshToken.create({ userId, token, expiresAt });
  }

  async findRefreshToken(token) {
    const row = await RefreshToken.findOne({ where: { token } });
    return serializeRefreshToken(row);
  }

  async deleteRefreshToken(token) {
    await RefreshToken.destroy({ where: { token } });
  }

  async deleteUserRefreshTokens(userId) {
    await RefreshToken.destroy({ where: { userId } });
  }

  async blacklistToken(token, expiresAt) {
    await BlacklistedToken.upsert({ token, expiresAt });
  }

  async isTokenBlacklisted(token) {
    const row = await BlacklistedToken.findOne({
      where: { token },
      attributes: ["id"]
    });
    return Boolean(row);
  }
}

export const tokenRepository = new TokenRepository();
