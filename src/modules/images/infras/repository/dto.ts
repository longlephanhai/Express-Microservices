import { DataTypes, Model, Sequelize } from "sequelize";

export class ImagePersistence extends Model {
    declare id: string;
    declare status: string;
}

export const modelName = "Image";

export function init(sequelize: Sequelize) {
    ImagePersistence.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            url: {
                type: DataTypes.STRING(2048),
                allowNull: false,
            },
            altText: {
                type: DataTypes.STRING,
                field: "alt_text",
                allowNull: true,
            },
            description: {
                type: DataTypes.STRING(255),
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
            modelName,
            timestamps: true,
            tableName: "images",
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
}