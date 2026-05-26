import { TEAMS } from "./teams.js";
import { SQUADS, DEFAULT_SQUAD, POSITIONS } from "./squads.js";
import { FWC_LIST } from "./fwc.js";
import { CC_LIST } from "./cocacola.js";
import { MY_COUNT } from "./userCollection.js";

export function buildDatabase() {
  const db = [];
  let id = 1;

  const mk = (obj) => {
    const code = obj.code.toUpperCase();
    const cnt = MY_COUNT[code] || 0;
    return {
      id: id++,
      ...obj,
      code,
      status: cnt > 0 ? (cnt >= 2 ? "Repetida" : "Tenho") : "Faltando",
      duplicates: cnt >= 2 ? cnt : 0,
      addedAt: cnt > 0 ? new Date(Date.now() - Math.random() * 5 * 86400000).toISOString() : null,
    };
  };

  // FWC (20 especiais incluindo capa)
  FWC_LIST.forEach((f) =>
    db.push(
      mk({
        code: f.n === "00" ? "FWC00" : `FWC${f.n}`,
        name: f.name,
        team: "FWC",
        teamName: "FIFA World Cup",
        section: "Especiais FIFA",
        position: "Especial",
        number: f.n === "00" ? 0 : parseInt(f.n),
        rarity: "Metalizado",
      })
    )
  );

  // 48 seleções × 20
  TEAMS.forEach((team, ti) => {
    const squad = SQUADS[team.id] || DEFAULT_SQUAD;
    const shieldFinish = "Metalizado";

    // #1 Escudo
    db.push(
      mk({
        code: `${team.id}1`,
        name: `Escudo – ${team.name}`,
        team: team.id,
        teamName: team.name,
        section: team.name,
        position: "Escudo",
        number: 1,
        rarity: shieldFinish,
      })
    );

    // #2-12 Jogadores
    for (let pi = 0; pi < 11; pi++) {
      const num = pi + 2;
      db.push(
        mk({
          code: `${team.id}${num}`,
          name: squad[pi] || `Jogador ${pi + 1}`,
          team: team.id,
          teamName: team.name,
          section: team.name,
          position: POSITIONS[pi] || "Jogador",
          number: num,
          rarity: "Comum",
        })
      );
    }

    // #13 Foto da Equipe
    db.push(
      mk({
        code: `${team.id}13`,
        name: `Foto da Equipe – ${team.name}`,
        team: team.id,
        teamName: team.name,
        section: team.name,
        position: "Foto Equipe",
        number: 13,
        rarity: "Comum",
      })
    );

    // #14-20 Jogadores
    for (let pi = 0; pi < 7; pi++) {
      const num = pi + 14;
      db.push(
        mk({
          code: `${team.id}${num}`,
          name: squad[pi + 11] || `Jogador ${pi + 12}`,
          team: team.id,
          teamName: team.name,
          section: team.name,
          position: POSITIONS[pi + 11] || "Jogador",
          number: num,
          rarity: "Comum",
        })
      );
    }
  });

  // 14 figurinhas Coca-Cola
  CC_LIST.forEach((cc) =>
    db.push(
      mk({
        code: cc.n,
        name: cc.name,
        team: "CC",
        teamName: cc.teamName,
        section: "Coca-Cola",
        position: cc.teamName,
        number: parseInt(cc.n.replace("CC", "")),
        rarity: "Coca-Cola",
      })
    )
  );

  return db;
}

export const FULL_DB = buildDatabase();

// Gera uma cópia do DB com todos os status zerados (ignora MY_COUNT)
// Usar no reset para garantir álbum 100% em branco
export function buildEmptyDatabase() {
  return FULL_DB.map((s) => ({
    ...s,
    status: "Faltando",
    duplicates: 0,
    addedAt: null,
    typeBreakdown: undefined,
    obs: undefined,
  }));
}
