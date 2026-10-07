
import { v7 } from "uuid";
import { ICommandHandler, IRepository } from "../../../share/interface";
import { CreateCommannd, IBrandRepository } from "../interface";
import { BrandCreateDTOSchema } from "../model/dto";
import { ErrBrandNameDuplicate } from "../model/error";
import { ModelStatus } from "../../../share/model/base-model";


export class CreateNewBrandCmdUseCase implements ICommandHandler<CreateCommannd, string> {

    constructor(private readonly repository: IBrandRepository) { }

    async execute(command: CreateCommannd): Promise<string> {
        const { success, data: parsedData, error } = BrandCreateDTOSchema.safeParse(command.cmd);

        if (!success) {
            throw new Error(error.message);
        }

        const isExist = await this.repository.findByCond({ name: parsedData.name });

        if (isExist) {
            throw ErrBrandNameDuplicate;
        }

        const newId = v7()
        const newBrand = {
            ...parsedData,
            id: newId,
            status: ModelStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.repository.insert(newBrand);

        return newId
    }

}