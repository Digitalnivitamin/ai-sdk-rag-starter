import { XMLParser } from "fast-xml-parser";

export async function getSiteUrls() {

  const parser = new XMLParser();

  const sitemapXML = await fetch("https://www.d-vitamin.si/sitemap.xml")
    .then(r => r.text());

  const sitemap = parser.parse(sitemapXML);

  let urls:string[] = [];

  // če je sitemap index
  if(sitemap.sitemapindex){

    const subSitemaps = sitemap.sitemapindex.sitemap.map((s:any)=>s.loc);

    for(const sm of subSitemaps){

      const subXML = await fetch(sm).then(r=>r.text());

      const sub = parser.parse(subXML);

      const subUrls = sub.urlset.url.map((u:any)=>u.loc);

      urls.push(...subUrls);

    }

  }

  // če ni index ampak direktni urls
  if(sitemap.urlset){

    urls = sitemap.urlset.url.map((u:any)=>u.loc);

  }

  return urls;

}
