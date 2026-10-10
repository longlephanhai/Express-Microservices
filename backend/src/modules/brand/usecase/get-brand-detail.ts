
import { IQueryHandler, IQueryRepository } from "../../../share/interface";
import { ErrDataNotFound } from "../../../share/model/base-error";
import { GetDetailQuery } from "../interface";
import { Brand } from "../model/brand";
import { BrandCondDTO } from "../model/dto";

export class GetBrandDetailQuery implements IQueryHandler<GetDetailQuery, Brand> {
  constructor(private readonly repository: IQueryRepository<Brand, BrandCondDTO>) { }

  async query(query: GetDetailQuery): Promise<Brand> {
    const data = await this.repository.get(query.id);

    if (!data) {
      throw ErrDataNotFound;
    }

    return data;
  }
}