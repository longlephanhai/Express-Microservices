import { IQueryHandler, IqueryRepository } from "../../../share/interface";
import { ErrDataNotFound } from "../../../share/model/base-error";
import { ModelStatus } from "../../../share/model/base-model";
import { GetDetailQuery } from "../interface";
import { Brand } from "../model/brand";
import { BrandCondDTO } from "../model/dto";

export class GetBrandDetailQuery implements IQueryHandler<GetDetailQuery, Brand | null> {

    constructor(private readonly repository: IqueryRepository<Brand, BrandCondDTO>) { }

    async query(query: GetDetailQuery): Promise<Brand | null> {
        const data = await this.repository.findByCond(query.id) as Brand | null;
        if (!data) {
            throw ErrDataNotFound;
        }

        return data;
    }

}