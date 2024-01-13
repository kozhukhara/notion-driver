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
const src_1 = require("../src");
const driver = new src_1.NotionClient({
    mappings: {
        products: "f972d2f4bdc6473ca3892cfe30bc96a1",
    },
    token: "secret_4UX8sogrwlgcIXf4ircKhaHTMXlSndJKM0hSkRDPYuS",
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const { results, meta } = yield driver.get("products", {
        property: "Name",
        rich_text: {
            contains: "b",
        },
    }, {
        limit: 3,
        page: 1
    });
    console.log(results);
    // fs.writeFileSync("./data.json", JSON.stringify(results, null, 2));
}))();
//# sourceMappingURL=app.js.map