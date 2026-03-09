import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

const sitemap = "https://www.d-vitamin.si/sitemap.xml";

async function run() {

  const parser = new XMLParser();

  const xml = await fetch(sitemap).then(r => r.text());
  const data = parser.parse(xml);

  const sitemapUrls = data.sitemapindex.sitemap.map((s:any) => s.loc);

  let urls:string[] = [];

  for (const sm of sitemapUrls) {

    const sub = await fetch(sm).then(r => r.text());
    const json = parser.parse(sub);

    urls.push(...json.urlset.url.map((u:any)=>u.loc));

  }

  console.log(urls);

}

run();
