import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class DocumentCollaborator extends Model {}

DocumentCollaborator.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    documentId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "document_id"
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "user_id"
    },
    role: {
      type: DataTypes.ENUM("owner", "editor", "viewer"),
      allowNull: false,
      defaultValue: "editor"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "DocumentCollaborator",
    tableName: "document_collaborators",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["document_id", "user_id"]
      }
    ]
  }
);
