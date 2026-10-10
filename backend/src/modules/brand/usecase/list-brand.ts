
import { IQueryHandler, IQueryRepository } from "../../../share/interface";
import { ListQuery } from "../interface";
import { Brand } from "../model/brand";
import { BrandCondDTO } from "../model/dto";

export class ListBrandQuery implements IQueryHandler<ListQuery, Brand[]> {
  constructor(private readonly repository: IQueryRepository<Brand, BrandCondDTO>) { }

  async query(query: ListQuery): Promise<Brand[]> {
    const collection = await this.repository.list(query.cond, query.paging);
    return collection;
  }
}