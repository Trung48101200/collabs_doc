import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "RefreshToken",
    tableName: "refresh_tokens",
    timestamps: false
  }
);

export class BlacklistedToken extends Model {}

BlacklistedToken.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "BlacklistedToken",
    tableName: "blacklisted_tokens",
    timestamps: false
  }
);
