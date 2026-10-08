import axios from "axios";
import { IBrandQueryRepository, ICategoryQueryRepository } from "../../../interface";
import { ProductBrand, ProductBrandSchema, ProductCategory, ProductCategorySchema } from "../../../model/product";

export class MySQLBrandQueryRepository implements IBrandQueryRepository {
    async get(id: string): Promise<ProductBrand | null> {
        try {
            const data = await axios.get(`http://localhost:3000/v1/brands/${id}`);
            const brand = ProductBrandSchema.parse(data.data);
            return brand;
        } catch (error) {
            return null;
        }
    }
}

export class MySQLCategoryQueryRepository implements ICategoryQueryRepository {
    async get(id: string): Promise<ProductCategory | null> {
        try {
            const { data } = await axios.get(`http://localhost:3000/v1/categories/${id}`);
            const category = ProductCategorySchema.parse(data.data);
            return category;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}