import { DataTypes, Model, Sequelize } from "sequelize";
import { CategoryStatus } from "../../model/model";



export class CategoryPersistence extends Model {
    declare id: string;
    declare status: string;
}

export const modelName = 'Category';

export function init(sequelize: Sequelize) {
    CategoryPersistence.init(
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
            parentId: {
                type: DataTypes.STRING,
                field: 'parent_id',
                allowNull: true,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
            }
        },
        {
            sequelize,
            modelName: modelName,
            timestamps: true,
            tableName: 'categories',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    )
}