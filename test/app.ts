import {NotionClient} from "../src";
import {joinRichText} from "../src/lib/scraper";
import * as fs from "fs";
import {faker} from '@faker-js/faker';

const driver = new NotionClient({
    parents: ['d25cd280cae84eccbd99f3b66be35a39', 'ec184b7ca3e84d949e0476289596d07d'],
    mappings: {
        products: "f972d2f4bdc6473ca3892cfe30bc96a1",
    },
    token: "secret_4UX8sogrwlgcIXf4ircKhaHTMXlSndJKM0hSkRDPYuS",
});

(async () => {
    await driver.init();
    console.log(driver.mappings)
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
        const inserted = await driver.create('BigDataTest', {
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
                            content: faker.person.firstName()
                        }
                    }
                ]
            },
            LastName: {
                rich_text: [
                    {
                        text: {
                            content: faker.person.lastName()
                        }
                    }
                ]
            },
            Published: {
                checkbox: Math.random() > 0.5
            },
            Entropy: {
                number: faker.number.float({min: 0, max: 100, precision: 2})
            }
        })
        console.log(`${i.toString().padStart(3, ' ')}. Inserted object ${inserted.id}`)
        await new Promise(r => setTimeout(r, 3000))
    }

})();