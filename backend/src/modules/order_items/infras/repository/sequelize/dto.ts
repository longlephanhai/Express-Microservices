import { DataTypes, Model, Sequelize } from "sequelize";
export class OrderItemPersistence extends Model {}
export const modelName = "OrderItem";
export function init(sequelize: Sequelize) {
  OrderItemPersistence.init({
    id: { type: DataTypes.STRING(36), primaryKey: true }, order_id: { type: DataTypes.STRING(36), allowNull: false },
    product_id: { type: DataTypes.STRING(36), allowNull: false }, attribute: { type: DataTypes.STRING(80), allowNull: false },
    image: { type: DataTypes.STRING(200), allowNull: true }, name: { type: DataTypes.STRING(150), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false }, price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  }, { sequelize, modelName, tableName: "order_items", timestamps: false, indexes: [{ unique: true, fields: ["order_id", "product_id", "attribute"] }] });
}
