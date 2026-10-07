import { PagingDTO } from "../model/paging";

export interface IRepository<Entity, CondDTO, UpdateDTO> extends IqueryRepository<Entity, CondDTO>, ICommandRepository<Entity, UpdateDTO> { }

export interface IqueryRepository<Entity, CondDTO> {
    get(id: string): Promise<Entity | null>;
    findByCond(cond: CondDTO): Promise<Entity | null>;
    list(cond: CondDTO, paging: PagingDTO): Promise<Entity[]>;
}

export interface ICommandRepository<Entity, UpdateDTO> {
    insert(data: Entity): Promise<boolean>;
    update(id: string, data: UpdateDTO): Promise<boolean>;
    delete(id: string, isHard: boolean): Promise<boolean>;
}

export interface ICommandHandler<Cmd, Result> {
    execute(command: Cmd): Promise<Result>;
}

export interface IQueryHandler<Query, Result> {
    query(query: Query): Promise<Result>;
}