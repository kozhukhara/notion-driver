import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type DatabaseMappings = { [key: string]: string };

interface QueryParams {
  [key: string]: any;
}

interface Entity {
  [key: string]: any;
}

interface ResultsMetadata {
  page: number;
  limit: number;
  total: number;
}

interface MetaParams {
  page: number;
  limit: number;
}

interface NotionClientConfig {
  mappings: DatabaseMappings;
  token: string;
}

export class NotionClient {
  private readonly mappings!: DatabaseMappings;
  private readonly client!: Client;

  constructor(config: NotionClientConfig) {
    this.mappings = config.mappings;
    this.client = new Client({
      auth: config.token,
    });
  }

  private async _dbquery(
    databaseId: string,
    filter,
    page_size: number = 1,
    start_cursor: string = undefined,
  ) {
    return await this.client.databases.query({
      database_id: databaseId,
      ...(filter ? { filter } : {}),
      page_size,
      ...(start_cursor ? { start_cursor } : {}),
    });
  }

  private async _pagequery(page_id: string) {
    return await this.client.pages.retrieve({ page_id });
  }

  async get(
    alias: keyof DatabaseMappings,
    query: QueryParams,
    meta: MetaParams = { limit: 15, page: 1 },
  ): Promise<
    | {
        results: Entity[];
        meta: ResultsMetadata;
      }
    | any
  > {
    const databaseId = this.mappings[alias];
    const pageSize = meta.limit || 15;
    let currentPage = meta.page || 0;
    let totalResults = [];

    let response = await this._dbquery(databaseId, query, pageSize);

    // Accumulate results and handle pagination
    while (
      response.results.length > 0 &&
      totalResults.length < pageSize * currentPage
    ) {
      totalResults = [...totalResults, ...response.results];
      if (!response.has_more) {
        break;
      }
      response = await this._dbquery(
        databaseId,
        query,
        pageSize,
        response.next_cursor,
      );
    }

    // Prepare the `meta` object
    const metadata = {
      page: currentPage,
      total: totalResults.length,
      limit: pageSize,
    };

    const pageResults = totalResults.slice(
      pageSize * (currentPage - 1),
      pageSize * currentPage,
    );
    return {
      results: pageResults.map((r) => ({ id: r.id, ...r.properties })),
      meta: metadata,
    };
  }

  async getOne(
    alias: keyof DatabaseMappings,
    query: QueryParams,
  ): Promise<Entity | any> {
    const databaseId = this.mappings[alias];
    const response = await this._dbquery(databaseId, query);
    if (!response.results.length) return null;
    const firstResult = response.results[0];
    return {
      id: response.results[0].id,
      ...(firstResult as DatabaseObjectResponse).properties,
    };
  }

  async getOneById(id: string): Promise<Entity | any> {
    const response = await this._pagequery(id).catch((e) => null);
    return response ? { id: response.id, ...response.properties } : null;
  }
}
