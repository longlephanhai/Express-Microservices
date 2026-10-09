
import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductRatingPersistence extends Model {}

export const modelName = "ProductRating";

export function init(sequelize: Sequelize) {
    ProductRatingPersistence.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },

            productId: {
                type: DataTypes.UUID,
                field: "product_id",
                allowNull: false,
            },

            userId: {
                type: DataTypes.UUID,
                field: "user_id",
                allowNull: false,
            },

            rating: {
                type: DataTypes.TINYINT,
                allowNull: false,
            },

            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName,
            tableName: "product_ratings",

            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",

            indexes: [
                {
                    unique: true,
                    fields: ["product_id", "user_id"],
                },
                {
                    fields: ["product_id"],
                },
                {
                    fields: ["user_id"],
                },
            ],
        },
    );
}
