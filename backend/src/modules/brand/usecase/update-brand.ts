
import { ICommandHandler } from "../../../share/interface";
import { ErrDataNotFound } from "../../../share/model/base-error";
import { ModelStatus } from "../../../share/model/base-model";
import { IBrandRepository, UpdateCommand } from "../interface";
import { BrandUpdateDTOSchema } from "../model/dto";

export class UpdateBrandCmdHandler implements ICommandHandler<UpdateCommand, void> {
  constructor(private readonly repository: IBrandRepository) { }

  async execute(command: UpdateCommand): Promise<void> {
    const { success, data: parsedData, error } = BrandUpdateDTOSchema.safeParse(command.dto);

    if (!success) {
      throw new Error('Invalid data');
    }

    const data = await this.repository.get(command.id);

    if (!data || data.status === ModelStatus.DELETED) {
      throw ErrDataNotFound;
    }

    await this.repository.update(command.id, parsedData);

    return;
  }
}