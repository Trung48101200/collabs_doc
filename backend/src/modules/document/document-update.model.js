import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class DocumentUpdate extends Model {}

DocumentUpdate.init(
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
      field: "user_id"
    },
    updateData: {
      type: DataTypes.BLOB("long"),
      allowNull: false,
      field: "update_data"
    },
    clientId: {
      type: DataTypes.STRING(100),
      field: "client_id"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "DocumentUpdate",
    tableName: "document_updates",
    timestamps: false
  }
);
