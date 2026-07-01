import { v7 } from "uuid";
import { ModelStatus } from "../../../share/model/base-model";
import { IRepository } from "../interface";
import { CategoryCreateDTO } from "../model/dto";
import { Category } from "../model/model";

export class CategoryUseCase {
    constructor(private readonly repository: IRepository) { }

    async createNewCategory(data: CategoryCreateDTO) {
        const newId = v7();
        const category: Category = {
            id: newId,
            name: data.name,
            position: 0,
            image: data.image,
            description: data.description,
            status: ModelStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        this.repository.insert(category);
    }
}