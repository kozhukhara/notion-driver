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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeEntry = exports.eternifyFile = exports.joinRichText = void 0;
const joinRichText = (richTextArray, useWrappers = false) => {
    return useWrappers
        ? richTextArray
            .map((entity) => {
            let content = entity.text.content;
            // Apply formatting based on annotations
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
        })
            .join("")
        : richTextArray.map((entity) => entity.plain_text).join("");
};
exports.joinRichText = joinRichText;
const eternifyFile = () => __awaiter(void 0, void 0, void 0, function* () {
});
exports.eternifyFile = eternifyFile;
const sanitizeEntry = (_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { id } = _a, entry = __rest(_a, ["id"]);
    const sanitized = {
        id,
    };
    for (const [field, value] of Object.entries(entry)) {
        sanitized[field] = value.type ? value[value.type] : value;
        console.log(value);
        if (["title", "rich_text"].includes(value.type)) {
            sanitized[field] = {
                rich: (0, exports.joinRichText)(sanitized[field], true),
                plain: (0, exports.joinRichText)(sanitized[field]),
            };
        }
        if (Array.isArray(sanitized[field])) {
            for (let i = 0; i < sanitized[field]; i++) {
                if (sanitized[field][i].type === 'file') {
                    sanitized[field][i] = yield 0;
                }
            }
        }
    }
    return sanitized;
});
exports.sanitizeEntry = sanitizeEntry;
//# sourceMappingURL=scraper.js.map