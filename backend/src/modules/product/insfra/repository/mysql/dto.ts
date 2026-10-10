import { DataTypes, Model, Sequelize } from "sequelize";
import { ProductGender } from "../../../model/product";
import { ModelStatus } from "../../../../../share/model/base-model";

export class ProductPersistence extends Model { }

export const modelName = "Product";

export function init(sequelize: Sequelize) {
  ProductPersistence.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      images: {
        type: DataTypes.JSON,
        allowNull: true
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },

      salePrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'sale_price',
        allowNull: false
      },

      colors: {
        type: DataTypes.STRING,
        allowNull: true
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      brandId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'brand_id'
      },

      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'category_id'
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true
      },

      content: {
        type: DataTypes.STRING,
        allowNull: true
      },

      gender: {
        type: DataTypes.STRING,
        defaultValue: ProductGender.UNISEX
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ModelStatus.ACTIVE
      },
    },
    {
      sequelize,
      modelName: modelName,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      tableName: 'products'
    }
  );
}