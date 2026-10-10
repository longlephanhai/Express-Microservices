import { DataTypes, Model, Sequelize } from "sequelize";
export class OrderPersistence extends Model {}
export const modelName = "Order";
export function init(sequelize: Sequelize) {
  OrderPersistence.init({
    id: { type: DataTypes.STRING(36), primaryKey: true },
    user_id: { type: DataTypes.STRING(36), allowNull: false },
    shipping_address: { type: DataTypes.STRING(255), allowNull: false },
    shipping_city: { type: DataTypes.STRING(80), allowNull: true },
    shipping_method: { type: DataTypes.ENUM("free", "standard"), allowNull: true, defaultValue: "free" },
    payment_method: { type: DataTypes.ENUM("cod", "zalo"), allowNull: true },
    payment_status: { type: DataTypes.ENUM("pending", "paid", "failed"), allowNull: false, defaultValue: "pending" },
    recipient_first_name: { type: DataTypes.STRING(80), allowNull: true },
    recipient_last_name: { type: DataTypes.STRING(80), allowNull: true },
    recipient_phone: { type: DataTypes.STRING(50), allowNull: true },
    recipient_email: { type: DataTypes.STRING(50), allowNull: true },
    tracking_number: { type: DataTypes.STRING(15), allowNull: true, unique: true },
    status: { type: DataTypes.ENUM("pending", "confirmed", "processing", "shipping", "delivered", "completed", "canceled", "refunded", "deleted"), allowNull: true, defaultValue: "pending" },
  }, { sequelize, modelName, tableName: "orders", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });
}
