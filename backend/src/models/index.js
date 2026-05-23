import { User } from "../modules/user/user.model.js";
import { RefreshToken } from "../modules/auth/token.model.js";
import { Document } from "../modules/document/document.model.js";
import { DocumentCollaborator } from "../modules/document/document-collaborator.model.js";
import { DocumentVersion } from "../modules/document/document-version.model.js";
import { DocumentUpdate } from "../modules/document/document-update.model.js";

User.hasMany(Document, { foreignKey: "ownerId", as: "ownedDocuments" });
Document.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

Document.hasMany(DocumentCollaborator, {
  foreignKey: "documentId",
  as: "collaborators"
});
DocumentCollaborator.belongsTo(Document, {
  foreignKey: "documentId",
  as: "document"
});
DocumentCollaborator.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

Document.hasMany(DocumentVersion, {
  foreignKey: "documentId",
  as: "versions"
});
DocumentVersion.belongsTo(Document, {
  foreignKey: "documentId",
  as: "document"
});
DocumentVersion.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator"
});

Document.hasMany(DocumentUpdate, {
  foreignKey: "documentId",
  as: "updates"
});
DocumentUpdate.belongsTo(Document, {
  foreignKey: "documentId",
  as: "document"
});
DocumentUpdate.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

export {
  User,
  RefreshToken,
  Document,
  DocumentCollaborator,
  DocumentVersion,
  DocumentUpdate
};
