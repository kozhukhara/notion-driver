"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionClient = void 0;
const client_1 = require("@notionhq/client");
const scraper_1 = require("./lib/scraper");
class NotionClient {
    constructor(config) {
        this.mappings = config.mappings;
        this.client = new client_1.Client({
            auth: config.token,
        });
    }
    _dbquery(databaseId, filter, page_size = 1, start_cursor = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.databases.query(Object.assign(Object.assign(Object.assign({ database_id: databaseId }, (filter ? { filter } : {})), { page_size }), (start_cursor ? { start_cursor } : {})));
        });
    }
    _pagequery(page_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.pages.retrieve({ page_id });
        });
    }
    get(alias, query, meta = { limit: 15, page: 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseId = this.mappings[alias];
            const pageSize = meta.limit || 15;
            let currentPage = meta.page || 1;
            let totalResults = [];
            let response = yield this._dbquery(databaseId, query, pageSize);
            while (response.results.length > 0 &&
                totalResults.length < pageSize * currentPage) {
                totalResults = [...totalResults, ...response.results];
                if (!response.has_more) {
                    break;
                }
                response = yield this._dbquery(databaseId, query, pageSize, response.next_cursor);
            }
            // Prepare the `meta` object
            const metadata = {
                page: currentPage,
                total: totalResults.length,
                limit: pageSize,
            };
            const pageResults = totalResults.slice(pageSize * (currentPage - 1), pageSize * currentPage);
            const results = [];
            for (const pageResult of pageResults) {
                results.push(yield (0, scraper_1.sanitizeEntry)(Object.assign({ id: pageResult.id }, pageResult.properties)));
            }
            return {
                results,
                meta: metadata,
            };
        });
    }
    getOne(alias, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseId = this.mappings[alias];
            const response = yield this._dbquery(databaseId, query);
            if (!response.results.length)
                return null;
            const firstResult = response.results[0];
            return (0, scraper_1.sanitizeEntry)(Object.assign({ id: response.results[0].id }, firstResult.properties));
        });
    }
    getOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._pagequery(id).catch((e) => null);
            return response
                ? (0, scraper_1.sanitizeEntry)(Object.assign({ id: response.id }, response.properties))
                : null;
        });
    }
}
exports.NotionClient = NotionClient;
//# sourceMappingURL=index.js.map