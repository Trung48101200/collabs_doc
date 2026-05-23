import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contentText: {
      type: DataTypes.TEXT("long"),
      field: "content_text"
    },
    contentJson: {
      type: DataTypes.JSON,
      field: "content_json"
    },
    contentHtml: {
      type: DataTypes.TEXT("long"),
      field: "content_html"
    },
    ydocState: {
      type: DataTypes.BLOB("long"),
      field: "ydoc_state"
    },
    ownerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "owner_id"
    },
    currentVersion: {
      type: DataTypes.INTEGER,
      field: "current_version"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at"
    }
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
    timestamps: true
  }
);
