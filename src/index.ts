import { Client, iteratePaginatedAPI } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { sanitizeEntry } from "./lib/scraper";
import * as path from "path";

// @ts-ignore
String.prototype.toCamelCase = function (this) {
  let result = this
    // Remove non-alphanumeric characters except spaces and apostrophes
    .replace(/[^a-zA-Z0-9 ']/g, "")
    // Split the string into words using space as a delimiter
    .split(" ")
    // Capitalize the first letter of each word
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("")
    // Handle strings that start with numbers by prefixing an underscore
    .replace(/^(\d)/, "_$1");

  // Capitalize the first letter of the result, if it's a letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};

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
  has_more: boolean;
  next_cursor?: string | null;
}

interface MetaParams {
  page?: number;
  limit?: number;
}

type UUID = string;

interface NotionClientConfig {
  parents?: UUID[];
  mappings: DatabaseMappings;
  token: string;
}

export class NotionClient {
  private readonly parents?: UUID[];
  mappings!: DatabaseMappings;
  readonly client!: Client;

  constructor(config: NotionClientConfig) {
    this.mappings = { ...this.mappings, ...config.mappings };
    this.parents = config.parents;
    this.client = new Client({
      auth: config.token,
    });
  }

  async init() {
    if (this.parents?.length) {
      let mappings = {};
      for (const parent of this.parents) {
        const dbs = await this._populateChildDBs(parent);
        mappings = { ...mappings, ...dbs };
      }
      this.mappings = { ...this.mappings, ...mappings };
    }
  }

  private async _dbQuery(
    databaseId: string,
    filter: any,
    page_size: number = 1,
    start_cursor: string | null,
  ) {
    return this.client.databases.query({
      database_id: databaseId,
      ...(filter ? { filter } : {}),
      page_size,
      ...(start_cursor ? { start_cursor } : {}),
    });
  }

  private async _pageQuery(page_id: string) {
    return this.client.pages.retrieve({ page_id });
  }

  private async _createQuery(
    database_id: string,
    properties: { [key: string]: any },
  ) {
    return this.client.pages.create({
      parent: {
        database_id,
      },
      properties,
    });
  }

  private async _childrenQuery(block_id: string) {
    return this.client.blocks.children.list({ block_id });
  }

  private async _populateChildDBs(page_id: string) {
    const children = await this._childrenQuery(page_id);
    const DBS = {};
    for (const block of children.results) {
      // @ts-ignore
      if (block?.type !== "child_database") continue;
      // @ts-ignore
      DBS[block.child_database.title.toCamelCase()] = block.id;
    }

    return DBS;
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
    let currentPage = meta.page || 1;
    let totalResults: string | any[] = [];
    let has_more = false;
    let next_cursor = null;

    let response = await this._dbQuery(databaseId, query, pageSize, null);
    while (
      response.results.length > 0 &&
      totalResults.length < pageSize * currentPage
    ) {
      totalResults = [...totalResults, ...response.results];
      if (!response.has_more) {
        break;
      }
      has_more = response.has_more ?? false;
      next_cursor = response.next_cursor ?? undefined;
      response = await this._dbQuery(
        databaseId,
        query,
        pageSize,
        response.next_cursor,
      );
    }

    // Prepare the `meta` object
    const metadata = {
      page: currentPage,
      limit: pageSize,
      has_more,
      next_cursor,
    };

    const pageResults = totalResults.slice(
      pageSize * (currentPage - 1),
      pageSize * currentPage,
    );
    const results = [];
    for (const pageResult of pageResults) {
      results.push(
        await sanitizeEntry({ id: pageResult.id, ...pageResult.properties }),
      );
    }
    return {
      results,
      meta: metadata,
    };
  }

  async getOne(
    alias: keyof DatabaseMappings,
    query: QueryParams,
  ): Promise<Entity | any> {
    const databaseId = this.mappings[alias];
    const response = await this._dbQuery(databaseId, query, 1, null);
    if (!response.results.length) return null;
    const firstResult = response.results[0];
    return sanitizeEntry({
      id: response.results[0].id,
      ...(firstResult as DatabaseObjectResponse).properties,
    });
  }

  async getOneById(id: string): Promise<Entity | any> {
    const response = await this._pageQuery(id).catch((e) => null);
    return response
      ? sanitizeEntry({
          id: response.id,
          ...(response as { properties: any }).properties,
        })
      : null;
  }

  async create(alias: keyof DatabaseMappings, properties: Entity) {
    return this._createQuery(this.mappings[alias], properties);
  }
}
