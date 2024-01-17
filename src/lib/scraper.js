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
var joinRichText = function (richTextArray, useWrappers) {
    if (useWrappers === void 0) { useWrappers = false; }
    return useWrappers
        ? richTextArray
            .map(function (entity) {
            var content = entity.text.content;
            // Apply formatting based on annotations
            if (entity.annotations.bold) {
                content = "**".concat(content, "**");
            }
            if (entity.annotations.italic) {
                content = "*".concat(content, "*");
            }
            if (entity.annotations.strikethrough) {
                content = "~~".concat(content, "~~");
            }
            if (entity.annotations.underline) {
                content = "<u>".concat(content, "</u>");
            }
            if (entity.annotations.code) {
                content = "`".concat(content, "`");
            }
            if (entity.text.link) {
                content = "[".concat(content, "](").concat(entity.text.link, ")");
            }
            return content;
        })
            .join("")
        : richTextArray.map(function (entity) { return entity.plain_text; }).join("");
};
exports.joinRichText = joinRichText;
var eternifyFile = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("https://filepod.keepish.net?url=".concat(encodeURIComponent(url)), {
                    method: 'GET',
                }).then(function (r) { return r.json(); })];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.id];
        }
    });
}); };
exports.eternifyFile = eternifyFile;
var sanitizeEntry = function (_a) { return __awaiter(void 0, void 0, void 0, function () {
    var sanitized, _i, _b, _c, field, value, i, newUrlRes;
    var id = _a.id, entry = __rest(_a, ["id"]);
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                sanitized = {
                    id: id,
                };
                _i = 0, _b = Object.entries(entry);
                _d.label = 1;
            case 1:
                if (!(_i < _b.length)) return [3 /*break*/, 6];
                _c = _b[_i], field = _c[0], value = _c[1];
                sanitized[field] = value.type ? value[value.type] : value;
                if (["title", "rich_text"].includes(value.type)) {
                    sanitized[field] = {
                        rich: (0, exports.joinRichText)(sanitized[field], true),
                        plain: (0, exports.joinRichText)(sanitized[field]),
                    };
                }
                if (!Array.isArray(sanitized[field])) return [3 /*break*/, 5];
                i = 0;
                _d.label = 2;
            case 2:
                if (!(i < sanitized[field].length)) return [3 /*break*/, 5];
                if (!(sanitized[field][i].type === 'file')) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, exports.eternifyFile)(sanitized[field][i].file.url)];
            case 3:
                newUrlRes = _d.sent();
                sanitized[field][i].file.url = "https://filepod.keepish.net/".concat(newUrlRes);
                _d.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/, sanitized];
        }
    });
}); };
exports.sanitizeEntry = sanitizeEntry;
