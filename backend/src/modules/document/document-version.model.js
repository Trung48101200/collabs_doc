import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/db.js";

export class DocumentVersion extends Model {}

DocumentVersion.init(
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
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "version_number"
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
    ydocSnapshot: {
      type: DataTypes.BLOB("long"),
      field: "ydoc_snapshot"
    },
    createdBy: {
      type: DataTypes.BIGINT,
      field: "created_by"
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at"
    }
  },
  {
    sequelize,
    modelName: "DocumentVersion",
    tableName: "document_versions",
    timestamps: false
  }
);
