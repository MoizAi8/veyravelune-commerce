type Searchable = { title: string; description: string; material: string; category: {name:string; slug:string}; variants: {finish:string}[] };

function normalize(text: string) {
  return text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// Allow one insertion, deletion, substitution or adjacent transposition on substantial words.
function near(word: string, term: string) {
  if (term.length < 4 || Math.abs(word.length-term.length)>1) return false;
  let i=0;
  while (i<word.length && word[i]===term[i]) i++;
  if (word.length===term.length) {
    return word.slice(i+1)===term.slice(i+1) ||
      (word[i]===term[i+1] && word[i+1]===term[i] && word.slice(i+2)===term.slice(i+2));
  }
  return word.length>term.length ? word.slice(i+1)===term.slice(i) : word.slice(i)===term.slice(i+1);
}

export function searchScore(item: Searchable, query: string) {
  const phrase=normalize(query);
  const terms=phrase.split(" ").filter(t=>t && t!=="collection" && t!=="collections");
  if (!terms.length) return 0;
  const title=normalize(item.title);
  const fields=[
    {text:title,weight:12}, {text:normalize(item.category.name+" "+item.category.slug),weight:8},
    {text:normalize(item.material+" "+item.variants.map(v=>v.finish).join(" ")),weight:6},
    {text:normalize(item.description),weight:2}
  ];
  let total=title===phrase ? 150 : title.includes(phrase) ? 50 : 0;
  for (const term of terms) {
    let best=0;
    for(const {text,weight} of fields) for(const word of text.split(" ")) {
      const quality=word===term ? 5 : word.startsWith(term) ? 4 : word.includes(term) ? 3 : near(word,term) ? 1 : 0;
      best=Math.max(best,quality*weight);
    }
    if(!best)return 0;
    total+=best;
  }
  return total;
}
