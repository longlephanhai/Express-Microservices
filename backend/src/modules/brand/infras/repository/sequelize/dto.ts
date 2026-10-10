import { DataTypes, Model, Sequelize } from "sequelize";

export class BrandPersistence extends Model {
  // declare id: string;
  // declare status: string;
}

export const modelName = "Brand";

export function init(sequelize: Sequelize) {
  BrandPersistence.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      tagLine: {
        type: DataTypes.STRING,
        field: "tag_line",
        allowNull: true,
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive", "deleted"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: modelName,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: "brands",
    }
  );
}