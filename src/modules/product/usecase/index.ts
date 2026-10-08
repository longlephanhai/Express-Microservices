import { v7 } from "uuid";
import { PagingDTO } from "../../../share/model/paging";
import { IBrandQueryRepository, ICategoryQueryRepository, IProductCommandRepository, IProductCommandUseCase, IProductQueryRepository, IProductQueryUseCase } from "../interface";
import { ProductCondDTO, ProductCondSchema, ProductCreateDTO, ProductCreateSchema, ProductUpdateDTO, ProductUpdateSchema } from "../model/dto";
import { ErrBrandNotFound, ErrCategoryNotFound } from "../model/error";
import { Product, ProductGender } from "../model/product";
import { ModelStatus } from "../../../share/model/base-model";
import { ErrDataNotFound } from "../../../share/model/base-error";

export class ProductUseCase implements IProductQueryUseCase, IProductCommandUseCase {

    constructor(
        private readonly productQueryRepository: IProductQueryRepository,
        private readonly productCommandRepository: IProductCommandRepository,
        private readonly productBrandRepository: IBrandQueryRepository,
        private readonly productCategoryRepository: ICategoryQueryRepository
    ) { }

    async getDetailProduct(id: string): Promise<Product | null> {
        const product = await this.productQueryRepository.get(id);

        if (!product || product.status === ModelStatus.DELETED) {
            throw ErrDataNotFound;
        }

        return product;
    }

    async listProducts(cond: ProductCondDTO, paging: PagingDTO): Promise<Product[]> {
        const parseCond = ProductCondSchema.parse(cond);
        return await this.productQueryRepository.list(parseCond, paging);
    }

    async createNewProduct(data: ProductCreateDTO): Promise<string> {
        const dto = ProductCreateSchema.parse(data);

        if (dto.brandId) {
            const brand = await this.productBrandRepository.get(dto.brandId);
            if (!brand) {
                throw ErrBrandNotFound;
            }
        }

        if (dto.categoryId) {
            const category = await this.productCategoryRepository.get(dto.categoryId);
            if (!category) {
                throw ErrCategoryNotFound;
            }
        }

        const newId = v7();
        const newProduct: Product = {
            ...dto,
            id: newId,
            status: ModelStatus.ACTIVE,
            rating: 0,
            saleCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await this.productCommandRepository.insert(newProduct);
        return newId;
    }

    async updateProduct(id: string, data: ProductUpdateDTO): Promise<boolean> {
        const dto = ProductUpdateSchema.parse(data);

        const product = await this.productQueryRepository.get(id);

        if (!product || product.status === ModelStatus.DELETED) {
            throw ErrDataNotFound;
        }

        await this.productCommandRepository.update(id, dto);
        return true;

    }

    async deleteProduct(id: string): Promise<boolean> {
        const product = await this.productQueryRepository.get(id);
        if (!product || product.status === ModelStatus.DELETED) {
            throw ErrDataNotFound;
        }

        await this.productCommandRepository.delete(id, false);
        return true;
    }

}

