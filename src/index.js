"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionClient = void 0;
var client_1 = require("@notionhq/client");
var scraper_1 = require("./lib/scraper");
// @ts-ignore
String.prototype.toCamelCase = function () {
    var result = this
        // Remove non-alphanumeric characters except spaces and apostrophes
        .replace(/[^a-zA-Z0-9 ']/g, '')
        // Split the string into words using space as a delimiter
        .split(' ')
        // Capitalize the first letter of each word
        .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); })
        .join('')
        // Handle strings that start with numbers by prefixing an underscore
        .replace(/^(\d)/, '_$1');
    // Capitalize the first letter of the result, if it's a letter
    return result.charAt(0).toUpperCase() + result.slice(1);
};
var NotionClient = /** @class */ (function () {
    function NotionClient(config) {
        this.mappings = __assign(__assign({}, this.mappings), config.mappings);
        this.parents = config.parents;
        this.client = new client_1.Client({
            auth: config.token,
        });
    }
    NotionClient.prototype.init = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var mappings, _i, _b, parent_1, dbs;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!((_a = this.parents) === null || _a === void 0 ? void 0 : _a.length)) return [3 /*break*/, 5];
                        mappings = {};
                        _i = 0, _b = this.parents;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 4];
                        parent_1 = _b[_i];
                        return [4 /*yield*/, this._populateChildDBs(parent_1)];
                    case 2:
                        dbs = _c.sent();
                        mappings = __assign(__assign({}, mappings), dbs);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.mappings = __assign(__assign({}, this.mappings), mappings);
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    NotionClient.prototype._dbQuery = function (databaseId, filter, page_size, start_cursor) {
        if (page_size === void 0) { page_size = 1; }
        if (start_cursor === void 0) { start_cursor = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.databases.query(__assign(__assign(__assign({ database_id: databaseId }, (filter ? { filter: filter } : {})), { page_size: page_size }), (start_cursor ? { start_cursor: start_cursor } : {})))];
            });
        });
    };
    NotionClient.prototype._pageQuery = function (page_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.pages.retrieve({ page_id: page_id })];
            });
        });
    };
    NotionClient.prototype._createQuery = function (database_id, properties) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.pages.create({
                        parent: {
                            database_id: database_id
                        },
                        properties: properties
                    })];
            });
        });
    };
    NotionClient.prototype._childrenQuery = function (block_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.blocks.children.list({ block_id: block_id })];
            });
        });
    };
    NotionClient.prototype._populateChildDBs = function (page_id) {
        return __awaiter(this, void 0, void 0, function () {
            var children, DBS, _i, _a, block;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._childrenQuery(page_id)];
                    case 1:
                        children = _b.sent();
                        DBS = {};
                        for (_i = 0, _a = children.results; _i < _a.length; _i++) {
                            block = _a[_i];
                            // @ts-ignore
                            if ((block === null || block === void 0 ? void 0 : block.type) !== 'child_database')
                                continue;
                            // @ts-ignore
                            DBS[block.child_database.title.toCamelCase()] = block.id;
                        }
                        return [2 /*return*/, DBS];
                }
            });
        });
    };
    NotionClient.prototype.get = function (alias, query, meta) {
        if (meta === void 0) { meta = { limit: 15, page: 1 }; }
        return __awaiter(this, void 0, void 0, function () {
            var databaseId, pageSize, currentPage, totalResults, response, metadata, pageResults, results, _i, pageResults_1, pageResult, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        databaseId = this.mappings[alias];
                        pageSize = meta.limit || 15;
                        currentPage = meta.page || 1;
                        totalResults = [];
                        return [4 /*yield*/, this._dbQuery(databaseId, query, pageSize)];
                    case 1:
                        response = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (!(response.results.length > 0 &&
                            totalResults.length < pageSize * currentPage)) return [3 /*break*/, 4];
                        totalResults = __spreadArray(__spreadArray([], totalResults, true), response.results, true);
                        if (!response.has_more) {
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, this._dbQuery(databaseId, query, pageSize, response.next_cursor)];
                    case 3:
                        response = _c.sent();
                        return [3 /*break*/, 2];
                    case 4:
                        metadata = {
                            page: currentPage,
                            total: totalResults.length,
                            limit: pageSize,
                        };
                        pageResults = totalResults.slice(pageSize * (currentPage - 1), pageSize * currentPage);
                        results = [];
                        _i = 0, pageResults_1 = pageResults;
                        _c.label = 5;
                    case 5:
                        if (!(_i < pageResults_1.length)) return [3 /*break*/, 8];
                        pageResult = pageResults_1[_i];
                        _b = (_a = results).push;
                        return [4 /*yield*/, (0, scraper_1.sanitizeEntry)(__assign({ id: pageResult.id }, pageResult.properties))];
                    case 6:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, {
                            results: results,
                            meta: metadata,
                        }];
                }
            });
        });
    };
    NotionClient.prototype.getOne = function (alias, query) {
        return __awaiter(this, void 0, void 0, function () {
            var databaseId, response, firstResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        databaseId = this.mappings[alias];
                        return [4 /*yield*/, this._dbQuery(databaseId, query)];
                    case 1:
                        response = _a.sent();
                        if (!response.results.length)
                            return [2 /*return*/, null];
                        firstResult = response.results[0];
                        return [2 /*return*/, (0, scraper_1.sanitizeEntry)(__assign({ id: response.results[0].id }, firstResult.properties))];
                }
            });
        });
    };
    NotionClient.prototype.getOneById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pageQuery(id).catch(function (e) { return null; })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response
                                ? (0, scraper_1.sanitizeEntry)(__assign({ id: response.id }, response.properties))
                                : null];
                }
            });
        });
    };
    NotionClient.prototype.create = function (alias, properties) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._createQuery(this.mappings[alias], properties)];
            });
        });
    };
    return NotionClient;
}());
exports.NotionClient = NotionClient;
