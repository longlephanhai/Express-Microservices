import axios from "axios";
import { IBrandQueryRepository, ICategoryQueryRepository } from "../../../interface";
import { ProductBrand, ProductBrandSchema, ProductCategory, ProductCategorySchema } from "../../../model/product";

export class RPCBrandQueryRepository implements IBrandQueryRepository {
    constructor(private readonly serviceUrl: string = process.env.BRAND_SERVICE_URL || "http://localhost:3000") {}

    async get(id: string): Promise<ProductBrand | null> {
        try {
            const res = await axios.get(`${this.serviceUrl}/v1/brands/${id}`);
            if (!res.data?.data) {
                return null;
            }
            return ProductBrandSchema.parse(res.data.data);
        } catch (error) {
            return null;
        }
    }
}

export class RPCCategoryQueryRepository implements ICategoryQueryRepository {
    constructor(private readonly serviceUrl: string = process.env.CATEGORY_SERVICE_URL || "http://localhost:3000") {}

    async get(id: string): Promise<ProductCategory | null> {
        try {
            const res = await axios.get(`${this.serviceUrl}/v1/categories/${id}`);
            if (!res.data?.data) {
                return null;
            }
            return ProductCategorySchema.parse(res.data.data);
        } catch (error) {
            return null;
        }
    }
}