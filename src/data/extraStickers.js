export const ES_PLAYERS = [
  { id: "ES1",  name: "Lionel Messi",      linkedCode: "ARG17", team: "ARG", teamName: "Argentina",     flag: "🇦🇷", position: "Atacante"      },
  { id: "ES2",  name: "Cristiano Ronaldo", linkedCode: "POR15", team: "POR", teamName: "Portugal",      flag: "🇵🇹", position: "Meio-Campista" },
  { id: "ES3",  name: "Vinícius Júnior",   linkedCode: "BRA14", team: "BRA", teamName: "Brasil",        flag: "🇧🇷", position: "Meio-Campista" },
  { id: "ES4",  name: "Lamine Yamal",      linkedCode: "ESP15", team: "ESP", teamName: "Espanha",       flag: "🇪🇸", position: "Meio-Campista" },
  { id: "ES5",  name: "Erling Haaland",    linkedCode: "NOR15", team: "NOR", teamName: "Noruega",       flag: "🇳🇴", position: "Meio-Campista" },
  { id: "ES6",  name: "Kevin De Bruyne",   linkedCode: "BEL15", team: "BEL", teamName: "Bélgica",       flag: "🇧🇪", position: "Meio-Campista" },
  { id: "ES7",  name: "Kylian Mbappé",     linkedCode: "FRA20", team: "FRA", teamName: "França",        flag: "🇫🇷", position: "Atacante"      },
  { id: "ES8",  name: "Jude Bellingham",   linkedCode: "ENG11", team: "ENG", teamName: "Inglaterra",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Meio-Campista" },
  { id: "ES9",  name: "Harry Kane",        linkedCode: "ENG18", team: "ENG", teamName: "Inglaterra",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", position: "Atacante"      },
  { id: "ES10", name: "Pedri",             linkedCode: "ESP11", team: "ESP", teamName: "Espanha",       flag: "🇪🇸", position: "Meio-Campista" },
  { id: "ES11", name: "Virgil van Dijk",   linkedCode: "NED3",  team: "NED", teamName: "Holanda",       flag: "🇳🇱", position: "Defensor"      },
  { id: "ES12", name: "Jamal Musiala",     linkedCode: "GER15", team: "GER", teamName: "Alemanha",      flag: "🇩🇪", position: "Meio-Campista" },
  { id: "ES13", name: "Son Heung-min",     linkedCode: "KOR18", team: "KOR", teamName: "Coreia do Sul", flag: "🇰🇷", position: "Atacante"      },
  { id: "ES14", name: "Federico Valverde", linkedCode: "URU10", team: "URU", teamName: "Uruguai",       flag: "🇺🇾", position: "Meio-Campista" },
  { id: "ES15", name: "Joshua Kimmich",    linkedCode: "GER10", team: "GER", teamName: "Alemanha",      flag: "🇩🇪", position: "Meio-Campista" },
  { id: "ES16", name: "Rodrygo",           linkedCode: "BRA15", team: "BRA", teamName: "Brasil",        flag: "🇧🇷", position: "Meio-Campista" },
  { id: "ES17", name: "Gabriel Magalhães", linkedCode: "BRA6",  team: "BRA", teamName: "Brasil",        flag: "🇧🇷", position: "Defensor"      },
  { id: "ES18", name: "Santiago Giménez",  linkedCode: "MEX16", team: "MEX", teamName: "México",        flag: "🇲🇽", position: "Meio-Campista" },
  { id: "ES19", name: "Joško Gvardiol",    linkedCode: "CRO4",  team: "CRO", teamName: "Croácia",       flag: "🇭🇷", position: "Defensor"      },
  { id: "ES20", name: "Jefferson Lerma",   linkedCode: "COL10", team: "COL", teamName: "Colômbia",      flag: "🇨🇴", position: "Meio-Campista" },
];

export const ES_RARITY_TYPES = ["Lilás", "Bronze", "Prata", "Gold"];

export const ES_BY_CODE = Object.fromEntries(ES_PLAYERS.map((p) => [p.linkedCode, p]));
