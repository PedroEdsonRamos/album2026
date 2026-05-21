import { ALL_TEAMS } from "./teams.js";
import { SQUADS, DEFAULT_SQUAD, POS2TO12, POS14TO20 } from "./squads.js";
import { FWC_LIST } from "./fwc.js";
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
        code: f.n,
        name: f.name,
        team: "FWC",
        teamName: "FIFA World Cup",
        section: "Especiais FIFA",
        position: "Especial",
        number: parseInt(f.n.replace("FWC", "")) || 0,
        rarity: f.r,
      })
    )
  );

  // 48 + 6 extras × 20
  ALL_TEAMS.forEach((team, ti) => {
    const squad = SQUADS[team.id] || DEFAULT_SQUAD;
    const shieldFinish = ti % 7 === 0 ? "Gold" : ti % 3 === 0 ? "Bronze" : "Prata";

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
          position: POS2TO12[pi] || "Jogador",
          number: num,
          rarity: "Normal",
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
        rarity: "Normal",
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
          position: POS14TO20[pi] || "Jogador",
          number: num,
          rarity: "Normal",
        })
      );
    }
  });

  return db;
}

export const FULL_DB = buildDatabase();
