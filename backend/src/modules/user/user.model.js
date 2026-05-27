import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      field: "password_hash"
    },
    sessionVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "session_version"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false
  }
);
