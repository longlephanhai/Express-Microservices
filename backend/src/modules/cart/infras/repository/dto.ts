import { DataTypes, Model, Sequelize } from "sequelize";

export class CartPersistence extends Model {
    declare id: string;
    declare userId: string;
    declare productId: string;
    declare attribute: string;
    declare quantity: number;
}

export const modelName = "Cart";

export function init(sequelize: Sequelize) {
    CartPersistence.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "user_id",
            },
            productId: {
                type: DataTypes.STRING,
                allowNull: false,
                field: "product_id",
            },
            attribute: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName,
            timestamps: true,
            tableName: "carts",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
}