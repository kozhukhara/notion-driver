var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import { Client } from "@notionhq/client";

// src/lib/scraper.ts
var joinRichText = (richTextArray, useWrappers = false) => {
  return useWrappers ? richTextArray.map((entity) => {
    let content = entity.text.content;
    if (entity.annotations.bold) {
      content = `**${content}**`;
    }
    if (entity.annotations.italic) {
      content = `*${content}*`;
    }
    if (entity.annotations.strikethrough) {
      content = `~~${content}~~`;
    }
    if (entity.annotations.underline) {
      content = `<u>${content}</u>`;
    }
    if (entity.annotations.code) {
      content = `\`${content}\``;
    }
    if (entity.text.link) {
      content = `[${content}](${entity.text.link})`;
    }
    return content;
  }).join("") : richTextArray.map((entity) => entity.plain_text).join("");
};
var eternifyFile = (url) => __async(void 0, null, function* () {
  const res = yield fetch(
    `https://filepod.keepish.net?url=${encodeURIComponent(url)}`,
    {
      method: "GET"
    }
  ).then((r) => r.json());
  return res.id;
});
var sanitizeEntry = (_a) => __async(void 0, null, function* () {
  var _b = _a, { id } = _b, entry = __objRest(_b, ["id"]);
  const sanitized = {
    id
  };
  for (const [field, value] of Object.entries(entry)) {
    sanitized[field] = value.type ? value[value.type] : value;
    if (["title", "rich_text"].includes(value.type)) {
      sanitized[field] = {
        rich: joinRichText(sanitized[field], true),
        plain: joinRichText(sanitized[field])
      };
    }
    if (Array.isArray(sanitized[field])) {
      for (let i = 0; i < sanitized[field].length; i++) {
        if (sanitized[field][i].type === "file") {
          const newUrlRes = yield eternifyFile(sanitized[field][i].file.url);
          sanitized[field][i].file.url = `https://filepod.keepish.net/${newUrlRes}`;
        }
      }
    }
  }
  return sanitized;
});

// src/index.ts
String.prototype.toCamelCase = function() {
  let result = this.replace(/[^a-zA-Z0-9 ']/g, "").split(" ").map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join("").replace(/^(\d)/, "_$1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
var NotionClient = class {
  constructor(config) {
    this.mappings = __spreadValues(__spreadValues({}, this.mappings), config.mappings);
    this.parents = config.parents;
    this.client = new Client({
      auth: config.token
    });
  }
  init() {
    return __async(this, null, function* () {
      var _a;
      if ((_a = this.parents) == null ? void 0 : _a.length) {
        let mappings = {};
        for (const parent of this.parents) {
          const dbs = yield this._populateChildDBs(parent);
          mappings = __spreadValues(__spreadValues({}, mappings), dbs);
        }
        this.mappings = __spreadValues(__spreadValues({}, this.mappings), mappings);
      }
    });
  }
  _dbQuery(databaseId, filter, page_size = 1, start_cursor) {
    return __async(this, null, function* () {
      return this.client.databases.query(__spreadValues(__spreadProps(__spreadValues({
        database_id: databaseId
      }, filter ? { filter } : {}), {
        page_size
      }), start_cursor ? { start_cursor } : {}));
    });
  }
  _pageQuery(page_id) {
    return __async(this, null, function* () {
      return this.client.pages.retrieve({ page_id });
    });
  }
  _createQuery(database_id, properties) {
    return __async(this, null, function* () {
      return this.client.pages.create({
        parent: {
          database_id
        },
        properties
      });
    });
  }
  _childrenQuery(block_id) {
    return __async(this, null, function* () {
      return this.client.blocks.children.list({ block_id });
    });
  }
  _populateChildDBs(page_id) {
    return __async(this, null, function* () {
      const children = yield this._childrenQuery(page_id);
      const DBS = {};
      for (const block of children.results) {
        if ((block == null ? void 0 : block.type) !== "child_database")
          continue;
        DBS[block.child_database.title.toCamelCase()] = block.id;
      }
      return DBS;
    });
  }
  get(_0, _1) {
    return __async(this, arguments, function* (alias, query, meta = { limit: 15, page: 1, next_cursor: null }) {
      var _a, _b;
      const databaseId = this.mappings[alias];
      const pageSize = meta.limit || 15;
      let currentPage = meta.page || 1;
      let totalResults = [];
      let has_more = false;
      let next_cursor = (_a = meta.next_cursor) != null ? _a : null;
      let response = yield this._dbQuery(databaseId, query, pageSize, null);
      while (response.results.length > 0 && totalResults.length < pageSize * currentPage) {
        totalResults = [...totalResults, ...response.results];
        if (!response.has_more) {
          break;
        }
        has_more = (_b = response.has_more) != null ? _b : false;
        next_cursor = response.next_cursor;
        response = yield this._dbQuery(
          databaseId,
          query,
          pageSize,
          response.next_cursor
        );
      }
      const metadata = {
        page: currentPage,
        limit: pageSize,
        has_more,
        next_cursor
      };
      const pageResults = totalResults.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      );
      const results = [];
      for (const pageResult of pageResults) {
        results.push(
          yield sanitizeEntry(__spreadValues({ id: pageResult.id }, pageResult.properties))
        );
      }
      return {
        results,
        meta: metadata
      };
    });
  }
  getOne(alias, query) {
    return __async(this, null, function* () {
      const databaseId = this.mappings[alias];
      const response = yield this._dbQuery(databaseId, query, 1, null);
      if (!response.results.length)
        return null;
      const firstResult = response.results[0];
      return sanitizeEntry(__spreadValues({
        id: response.results[0].id
      }, firstResult.properties));
    });
  }
  getOneById(id) {
    return __async(this, null, function* () {
      const response = yield this._pageQuery(id).catch((e) => null);
      return response ? sanitizeEntry(__spreadValues({
        id: response.id
      }, response.properties)) : null;
    });
  }
  create(alias, properties) {
    return __async(this, null, function* () {
      return this._createQuery(this.mappings[alias], properties);
    });
  }
};
export {
  NotionClient
};
//# sourceMappingURL=index.mjs.map