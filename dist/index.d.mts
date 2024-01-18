import * as _notionhq_client_build_src_api_endpoints from '@notionhq/client/build/src/api-endpoints';
import { Client } from '@notionhq/client';

type DatabaseMappings = {
    [key: string]: string;
};
interface QueryParams {
    [key: string]: any;
}
interface Entity {
    [key: string]: any;
}
interface ResultsMetadata {
    page: number;
    limit: number;
    has_more: boolean;
    next_cursor?: string | null;
}
interface MetaParams {
    page?: number;
    limit?: number;
    next_cursor?: string | null;
}
type UUID = string;
interface NotionClientConfig {
    parents?: UUID[];
    mappings: DatabaseMappings;
    token: string;
}
declare class NotionClient {
    private readonly parents?;
    mappings: DatabaseMappings;
    readonly client: Client;
    constructor(config: NotionClientConfig);
    init(): Promise<void>;
    private _dbQuery;
    private _pageQuery;
    private _createQuery;
    private _childrenQuery;
    private _populateChildDBs;
    get(alias: keyof DatabaseMappings, query: QueryParams, meta?: MetaParams): Promise<{
        results: Entity[];
        meta: ResultsMetadata;
    } | any>;
    getOne(alias: keyof DatabaseMappings, query: QueryParams): Promise<Entity | any>;
    getOneById(id: string): Promise<Entity | any>;
    create(alias: keyof DatabaseMappings, properties: Entity): Promise<_notionhq_client_build_src_api_endpoints.CreatePageResponse>;
}

export { NotionClient };
