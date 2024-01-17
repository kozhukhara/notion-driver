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
const faker_1 = require("@faker-js/faker");
const driver = new src_1.NotionClient({
    parents: ['d25cd280cae84eccbd99f3b66be35a39', 'ec184b7ca3e84d949e0476289596d07d'],
    mappings: {
        products: "f972d2f4bdc6473ca3892cfe30bc96a1",
    },
    token: "secret_4UX8sogrwlgcIXf4ircKhaHTMXlSndJKM0hSkRDPYuS",
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield driver.init();
    console.log(driver.mappings);
    // const { results, meta } = await driver.get("products", {
    //   property: "Name",
    //   rich_text: {
    //     contains: "b",
    //   },
    // }, {
    //   limit: 3,
    //   page: 1
    // });
    //
    // console.log(`Found results with meta`, meta)
    // // fs.writeFileSync("./data.json", JSON.stringify(results, null, 2));
    for (let i = 1; i < 101; i++) {
        const inserted = yield driver.create('BigDataTest', {
            Title: {
                title: [
                    {
                        text: {
                            content: `${i}. ` + ['himik', 'is', 'gay', 'and', 'kozhukhar', 'not', 'why', 'bitch'].sort((p, n) => Math.random() > 0.5 ? -1 : 1).join(' ')
                        }
                    }
                ]
            },
            FirstName: {
                rich_text: [
                    {
                        text: {
                            content: faker_1.faker.person.firstName()
                        }
                    }
                ]
            },
            LastName: {
                rich_text: [
                    {
                        text: {
                            content: faker_1.faker.person.lastName()
                        }
                    }
                ]
            },
            Published: {
                checkbox: Math.random() > 0.5
            },
            Entropy: {
                number: faker_1.faker.number.float({ min: 0, max: 100, precision: 2 })
            }
        });
        console.log(`${i.toString().padStart(3, ' ')}. Inserted object ${inserted.id}`);
        yield new Promise(r => setTimeout(r, 3000));
    }
}))();
//# sourceMappingURL=app.js.map