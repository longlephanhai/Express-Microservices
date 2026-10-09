import { DataTypes, Model, Sequelize } from "sequelize";
import { UserIdentityStatus, UserIdentityType } from "../../../model/user-identity";

export class UserIdentityPersistence extends Model { }

export const modelName = "UserIdentity";

export function init(sequelize: Sequelize) {
  UserIdentityPersistence.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(36),
        field: "user_id",
        allowNull: false,
      },
      identifier: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      salt: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(UserIdentityType)),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(UserIdentityStatus)),
        allowNull: false,
        defaultValue: UserIdentityStatus.ACTIVE,
      },
    },
    {
      sequelize,
      modelName,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "user_identities",
      indexes: [
        { unique: true, fields: ["identifier", "type"], name: "user_identity_identifier_type_uq" },
        { fields: ["user_id"], name: "user_identity_user_id_idx" },
      ],
    }
  );
}