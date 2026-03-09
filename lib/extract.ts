export function extractText(html:string){

  const cleaned = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,"")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi,"")
    .replace(/<[^>]+>/g," ");

  return cleaned.replace(/\s+/g," ").trim();

}
