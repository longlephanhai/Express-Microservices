
import { v7 } from "uuid";
import { CreateCommand, IBrandRepository } from "../interface";
import { BrandCreateDTOSchema } from "../model/dto";
import { ErrBrandNameDuplicate } from "../model/errors";
import { ICommandHandler } from "../../../share/interface";
import { ModelStatus } from "../../../share/model/base-model";

export class CreateNewBrandCmdHandler implements ICommandHandler<CreateCommand, string> {
  constructor(private readonly repository: IBrandRepository) { }

  async execute(command: CreateCommand): Promise<string> {
    const { success, data: parsedData, error } = BrandCreateDTOSchema.safeParse(command.dto);

    if (!success) {
      throw new Error('Invalid data');
    }

    const isExist = await this.repository.findByCond({ name: parsedData.name });

    if (isExist) {
      throw ErrBrandNameDuplicate;
    }

    const newId = v7();

    const newBrand = {
      ...parsedData,
      id: newId,
      status: ModelStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.insert(newBrand);

    return newId;
  }
}