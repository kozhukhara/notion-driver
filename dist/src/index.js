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
// @ts-ignore
String.prototype.toCamelCase = function () {
    let result = this
        // Remove non-alphanumeric characters except spaces and apostrophes
        .replace(/[^a-zA-Z0-9 ']/g, '')
        // Split the string into words using space as a delimiter
        .split(' ')
        // Capitalize the first letter of each word
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        // Handle strings that start with numbers by prefixing an underscore
        .replace(/^(\d)/, '_$1');
    // Capitalize the first letter of the result, if it's a letter
    return result.charAt(0).toUpperCase() + result.slice(1);
};
class NotionClient {
    constructor(config) {
        this.mappings = Object.assign(Object.assign({}, this.mappings), config.mappings);
        this.parents = config.parents;
        this.client = new client_1.Client({
            auth: config.token,
        });
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.parents) === null || _a === void 0 ? void 0 : _a.length) {
                let mappings = {};
                for (const parent of this.parents) {
                    const dbs = yield this._populateChildDBs(parent);
                    mappings = Object.assign(Object.assign({}, mappings), dbs);
                }
                this.mappings = Object.assign(Object.assign({}, this.mappings), mappings);
            }
        });
    }
    _dbQuery(databaseId, filter, page_size = 1, start_cursor = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.databases.query(Object.assign(Object.assign(Object.assign({ database_id: databaseId }, (filter ? { filter } : {})), { page_size }), (start_cursor ? { start_cursor } : {})));
        });
    }
    _pageQuery(page_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.pages.retrieve({ page_id });
        });
    }
    _createQuery(database_id, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.pages.create({
                parent: {
                    database_id
                },
                properties
            });
        });
    }
    _childrenQuery(block_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client.blocks.children.list({ block_id });
        });
    }
    _populateChildDBs(page_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const children = yield this._childrenQuery(page_id);
            const DBS = {};
            for (const block of children.results) {
                // @ts-ignore
                if ((block === null || block === void 0 ? void 0 : block.type) !== 'child_database')
                    continue;
                // @ts-ignore
                DBS[block.child_database.title.toCamelCase()] = block.id;
            }
            return DBS;
        });
    }
    get(alias, query, meta = { limit: 15, page: 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const databaseId = this.mappings[alias];
            const pageSize = meta.limit || 15;
            let currentPage = meta.page || 1;
            let totalResults = [];
            let response = yield this._dbQuery(databaseId, query, pageSize);
            while (response.results.length > 0 &&
                totalResults.length < pageSize * currentPage) {
                totalResults = [...totalResults, ...response.results];
                if (!response.has_more) {
                    break;
                }
                response = yield this._dbQuery(databaseId, query, pageSize, response.next_cursor);
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
            const response = yield this._dbQuery(databaseId, query);
            if (!response.results.length)
                return null;
            const firstResult = response.results[0];
            return (0, scraper_1.sanitizeEntry)(Object.assign({ id: response.results[0].id }, firstResult.properties));
        });
    }
    getOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._pageQuery(id).catch((e) => null);
            return response
                ? (0, scraper_1.sanitizeEntry)(Object.assign({ id: response.id }, response.properties))
                : null;
        });
    }
    create(alias, properties) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._createQuery(this.mappings[alias], properties);
        });
    }
}
exports.NotionClient = NotionClient;
//# sourceMappingURL=index.js.map