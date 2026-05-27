import { FINISH } from "@/styles/finishes.js";
import { C } from "@/styles/tokens.js";

const tiffany = "#1fc8d1";

function HelpText({ children }) {
  return <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7, marginBottom: 10, margin: "0 0 10px" }}>{children}</p>;
}
function HelpTip({ children }) {
  return (
    <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: C.amber, lineHeight: 1.6 }}>
      💡 {children}
    </div>
  );
}
function HelpNote({ children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: C.t2, lineHeight: 1.6 }}>
      ℹ️ {children}
    </div>
  );
}
function HelpStep({ number, children }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.amberDim, border: `1px solid ${C.amber}66`, color: C.amber, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{number}</div>
      <span style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}
function HelpBadge({ color }) {
  const fin = FINISH[color] ?? FINISH.Comum;
  return <span style={{ background: fin.bg, border: `1px solid ${fin.border}`, color: fin.color, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700, display: "inline-block", margin: "0 3px" }}>{fin.label}</span>;
}
function HelpDivider() {
  return <div style={{ height: 1, background: C.border, margin: "14px 0" }} />;
}

const mono = { fontFamily: "monospace", fontSize: 11, color: "#fff", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 12px", marginBottom: 10, lineHeight: 2 };

export const SECTIONS = [
  {
    id: "overview", icon: "📖", title: "O que é este app?",
    content: (
      <>
        {/* AJUDA: atualizar se a descrição geral do app mudar */}
        <HelpText>O <strong style={{ color: "#fff" }}>Álbum Copa 2026</strong> é um gerenciador digital da sua coleção de figurinhas Panini do álbum oficial da FIFA World Cup 2026. Registre o que você tem, o que falta e o que está repetido — tudo no celular, sem papel.</HelpText>
        <HelpText>O álbum oficial tem <strong style={{ color: "#fff" }}>994 figurinhas</strong> no total: 980 regulares + 14 Coca-Cola. Além disso, existem <strong style={{ color: "#fff" }}>80 Extra Stickers</strong> (20 jogadores × 4 tipos) que são raras e não têm espaço fixo no álbum.</HelpText>
        <HelpTip>As Extra Stickers são rastreadas automaticamente quando você lança uma figurinha de um dos 20 jogadores com tipo Lilás, Bronze, Prata ou Ouro.</HelpTip>
      </>
    ),
  },
  {
    id: "nav", icon: "🧭", title: "Navegação — as 6 abas",
    content: (
      <>
        {/* AJUDA: atualizar se novas abas forem adicionadas */}
        {[
          { icon: "🏠", name: "Início",    desc: "Resumo da coleção, cards de progresso, ranking de seleções e últimas figurinhas adicionadas." },
          { icon: "🌍", name: "Seleções",  desc: "Veja todas as 48 seleções e as seções extras (FWC, Coca-Cola, Extra Stickers). Filtre por grupo e ordene como quiser." },
          { icon: "📒", name: "Álbum",     desc: "Grid de todas as figurinhas. Filtre por status, tipo e posição. Clique em qualquer figurinha para editar." },
          { icon: "➕", name: "Adicionar", desc: "Lance figurinhas na sua coleção: modo Individual, Por Seleção ou Lote Livre." },
          { icon: "🔄", name: "Trocas",    desc: "Lista de figurinhas repetidas disponíveis para troca. Compartilhe pelo WhatsApp." },
          { icon: "📊", name: "Status",    desc: "Estatísticas completas, estimativa de pacotes e opção de resetar o álbum." },
        ].map(tab => (
          <div key={tab.name} style={{ display: "flex", gap: 12, marginBottom: 10, padding: "10px 12px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{tab.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{tab.name}</div>
              <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{tab.desc}</div>
            </div>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "types", icon: "🎨", title: "Tipos de figurinha",
    content: (
      <>
        {/* AJUDA: atualizar se novos tipos forem criados */}
        <HelpText>Cada figurinha tem um tipo que indica seu acabamento:</HelpText>
        {[
          { key: "Comum",      desc: "Jogadores regulares e Fotos de Equipe. Tipo padrão do álbum." },
          { key: "Lilás",      desc: "Versão base das Extra Stickers. Rara — 1:100 pacotes." },
          { key: "Bronze",     desc: "Versão Bronze das Extra Stickers." },
          { key: "Prata",      desc: "Versão Prata das Extra Stickers." },
          { key: "Ouro",       desc: "Versão mais rara das Extra Stickers." },
          { key: "Metalizado", desc: "Escudos e figurinhas FWC. Tipo fixo — não pode ser alterado." },
          { key: "Coca-Cola",  desc: "Figurinhas CC1–CC14 patrocinadas pela Coca-Cola. Tipo fixo." },
        ].map(t => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <HelpBadge color={t.key} />
            <span style={{ fontSize: 12, color: C.t2 }}>{t.desc}</span>
          </div>
        ))}
        <HelpNote>Tipos fixos (Metalizada e Coca-Cola) são definidos automaticamente pelo álbum e não podem ser alterados pelo usuário.</HelpNote>
      </>
    ),
  },
  {
    id: "add", icon: "➕", title: "Como adicionar figurinhas",
    content: (
      <>
        {/* AJUDA: atualizar se os modos de adição mudarem */}
        <HelpText>A aba <strong style={{ color: "#fff" }}>Adicionar</strong> tem 3 modos:</HelpText>
        <HelpDivider />
        <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>📌 Individual</div>
        <HelpStep number={1}>Digite o código da figurinha (ex: <code style={{ color: tiffany }}>BRA10</code>, <code style={{ color: tiffany }}>CC1</code>, <code style={{ color: tiffany }}>FWC5</code>)</HelpStep>
        <HelpStep number={2}>Selecione a figurinha na lista de sugestões. Busque por código, nome da seleção ou nome do jogador.</HelpStep>
        <HelpStep number={3}>O app identifica o tipo automaticamente. Para Extra Stickers, selecione a quantidade por tipo.</HelpStep>
        <HelpStep number={4}>Clique em <strong style={{ color: "#fff" }}>Confirmar</strong>. Status definido automaticamente: <em>Faltando → Tenho</em> ou <em>Tenho → Repetida</em>.</HelpStep>
        <HelpTip>Se já tiver a figurinha (Tenho), ela vira Repetida automaticamente ao adicionar mais.</HelpTip>
        <HelpDivider />
        <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>🌍 Por Seleção</div>
        <HelpStep number={1}>Busque e selecione uma seleção.</HelpStep>
        <HelpStep number={2}>Veja todas as figurinhas daquela seleção e marque as que você tem.</HelpStep>
        <HelpStep number={3}>Para Extra Stickers, selecione o tipo correto.</HelpStep>
        <HelpTip>Use este modo ao abrir um pacote focado em uma seleção específica.</HelpTip>
        <HelpDivider />
        <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>📋 Lote Livre</div>
        <HelpText>Digite vários códigos de uma vez, separados por vírgula ou espaço:</HelpText>
        <div style={mono}>
          <div><span style={{ color: tiffany }}>BRA5, ARG17, FWC10</span> → figurinhas normais</div>
          <div><span style={{ color: "#a855f7" }}>ARG17:L</span> → Messi Lilás ⭐</div>
          <div><span style={{ color: "#d97706" }}>ARG17:B</span> → Messi Bronze ⭐</div>
          <div><span style={{ color: "#cbd5e1" }}>ARG17:P</span> → Messi Prata ⭐</div>
          <div><span style={{ color: "#fbbf24" }}>ARG17:O</span> → Messi Ouro ⭐</div>
        </div>
        <HelpNote>O sufixo <strong style={{ color: "#fff" }}>:L :B :P :O</strong> só funciona para os 20 jogadores Extra Stickers. Para outros, o tipo é automático.</HelpNote>
        <HelpTip>Use o botão <strong style={{ color: "#fff" }}>✕ Limpar</strong> para cancelar qualquer lançamento em andamento — uma confirmação será solicitada.</HelpTip>
      </>
    ),
  },
  {
    id: "es", icon: "⭐", title: "Extra Stickers — os 20 jogadores",
    content: (
      <>
        {/* AJUDA: atualizar se a lista de ES ou a lógica mudar */}
        <HelpText>As Extra Stickers são figurinhas raras de 20 jogadores estrelas, disponíveis em 4 tipos: <HelpBadge color="Lilás" /><HelpBadge color="Bronze" /><HelpBadge color="Prata" /><HelpBadge color="Ouro" /></HelpText>
        <HelpNote>Ao lançar a figurinha de um dos 20 jogadores com tipo Lilás, Bronze, Prata ou Ouro, o app registra automaticamente como Extra Sticker.</HelpNote>
        <HelpText>Os 20 jogadores Extra Stickers são:</HelpText>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, fontSize: 11, color: C.t2, marginBottom: 10 }}>
          {["🇦🇷 Messi (ARG17)", "🇵🇹 C. Ronaldo (POR15)", "🇧🇷 Vinícius Jr (BRA14)", "🇪🇸 L. Yamal (ESP15)", "🇳🇴 Haaland (NOR15)", "🇧🇪 De Bruyne (BEL15)", "🇫🇷 Mbappé (FRA20)", "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Bellingham (ENG11)", "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Kane (ENG18)", "🇪🇸 Pedri (ESP11)", "🇳🇱 Van Dijk (NED3)", "🇩🇪 Musiala (GER15)", "🇰🇷 Son (KOR18)", "🇺🇾 Valverde (URU10)", "🇩🇪 Kimmich (GER10)", "🇧🇷 Rodrygo (BRA15)", "🇧🇷 G. Magalhães (BRA6)", "🇲🇽 S. Giménez (MEX16)", "🇭🇷 Gvardiol (CRO4)", "🇨🇴 Lerma (COL10)"].map(p => (
            <div key={p} style={{ padding: "5px 8px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>{p}</div>
          ))}
        </div>
        <HelpTip>Veja o progresso das Extra Stickers na aba <strong style={{ color: "#fff" }}>Seleções → Extras → Extra Stickers</strong> e na aba <strong style={{ color: "#fff" }}>Status</strong>.</HelpTip>
      </>
    ),
  },
  {
    id: "album", icon: "📒", title: "Aba Álbum — visualizar e editar",
    content: (
      <>
        {/* AJUDA: atualizar se os filtros ou o modal mudarem */}
        <HelpText>O Álbum exibe todas as figurinhas com 3 linhas de filtros:</HelpText>
        <HelpStep number={1}><strong style={{ color: "#fff" }}>Status:</strong> Todos · Minhas · Tenho · Faltando · Repetida</HelpStep>
        <HelpStep number={2}><strong style={{ color: "#fff" }}>Tipo:</strong> Todos · Comum · Lilás · Bronze · Prata · Ouro · Metalizada · Coca-Cola</HelpStep>
        <HelpStep number={3}><strong style={{ color: "#fff" }}>Posição:</strong> Todos · Goleiro · Defensor · Meio-Campista · Atacante · Foto Equipe · Escudo · Especial · Extra Stickers</HelpStep>
        <HelpDivider />
        <HelpText><strong style={{ color: "#fff" }}>Clique em qualquer card</strong> para abrir o modal de edição:</HelpText>
        <HelpStep number={1}>Altere o status: Faltando · Tenho · Repetida</HelpStep>
        <HelpStep number={2}>Para figurinhas ES em Repetida: selecione a quantidade por tipo</HelpStep>
        <HelpStep number={3}>Para outras repetidas: ajuste a quantidade total</HelpStep>
        <HelpStep number={4}>Clique em <strong style={{ color: "#fff" }}>Salvar</strong></HelpStep>
        <HelpNote>Para marcar como Repetida a partir de zero (Faltando), você precisa selecionar pelo menos 2 figurinhas no total.</HelpNote>
        <HelpTip>Cards com borda brilhante e fundo colorido = você <strong style={{ color: "#fff" }}>tem</strong> essa figurinha. Cards apagados = ainda falta.</HelpTip>
      </>
    ),
  },
  {
    id: "trades", icon: "🔄", title: "Aba Trocas — compartilhar repetidas",
    content: (
      <>
        {/* AJUDA: atualizar se o formato de compartilhamento mudar */}
        <HelpText>A aba Trocas lista todas as suas figurinhas repetidas, agrupadas por seleção.</HelpText>
        <HelpStep number={1}>Toque no nome/bandeira da seleção para expandir ou ir para a aba Seleções.</HelpStep>
        <HelpStep number={2}>Toque em uma figurinha para ir direto ao Álbum com ela em foco.</HelpStep>
        <HelpStep number={3}>Use o botão <strong style={{ color: "#fff" }}>Compartilhar</strong> por figurinha ou por seleção inteira.</HelpStep>
        <div style={{ ...mono, lineHeight: 1.8 }}>
          <div>📒 Figurinhas Disponíveis para Troca...</div>
          <div>🇧🇷 Brasil</div>
          <div>BRA10 — Casemiro | Meio-Campista</div>
          <div>Tipo: Comum (2×)</div>
        </div>
        <HelpTip>Use o botão ▼ para colapsar seleções que já negociou, deixando a lista mais limpa.</HelpTip>
      </>
    ),
  },
  {
    id: "teams", icon: "🌍", title: "Aba Seleções",
    content: (
      <>
        {/* AJUDA: atualizar se grupos ou filtros mudarem */}
        <HelpText>Veja o progresso de cada seleção e acesse as figurinhas extras.</HelpText>
        <HelpStep number={1}><strong style={{ color: "#fff" }}>Ordenação:</strong> % Completo · Nome A-Z · Grupo</HelpStep>
        <HelpStep number={2}><strong style={{ color: "#fff" }}>Grupo:</strong> A a L · Extras</HelpStep>
        <HelpDivider />
        <HelpText>A seção <strong style={{ color: "#fff" }}>Extras</strong> tem 3 sub-abas:</HelpText>
        <HelpStep number={1}>🌐 <strong style={{ color: "#fff" }}>FIFA World Cup</strong> — figurinhas FWC00 a FWC19 (Metalizada)</HelpStep>
        <HelpStep number={2}>🥤 <strong style={{ color: "#fff" }}>Coca-Cola</strong> — figurinhas CC1 a CC14</HelpStep>
        <HelpStep number={3}>⭐ <strong style={{ color: "#fff" }}>Extra Stickers</strong> — os 20 jogadores com 4 bolinhas coloridas por tipo</HelpStep>
        <HelpTip>Clique em um jogador Extra Sticker para ir ao Álbum com o filtro Extra Stickers já aplicado.</HelpTip>
      </>
    ),
  },
  {
    id: "status", icon: "📊", title: "Aba Status",
    content: (
      <>
        {/* AJUDA: atualizar se categorias ou cálculos mudarem */}
        <HelpText>Estatísticas completas da sua coleção:</HelpText>
        <HelpStep number={1}><strong style={{ color: "#fff" }}>Mini-boxes:</strong> Coletadas · Faltando · Repetidas</HelpStep>
        <HelpStep number={2}><strong style={{ color: "#fff" }}>Estimativa:</strong> quantos pacotes faltam para completar o álbum (R$ 7,00/pacote, 7 figurinhas por pacote)</HelpStep>
        <HelpStep number={3}><strong style={{ color: "#fff" }}>Por Categoria:</strong> Jogadores · Fotos de Equipe · Escudos · FWC · Coca-Cola</HelpStep>
        <HelpStep number={4}><strong style={{ color: "#fff" }}>Extra Stickers:</strong> matriz visual de 20 jogadores × 4 tipos com bolinhas coloridas</HelpStep>
        <HelpDivider />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>🗑️ Zona de Perigo — Resetar Álbum</div>
        <HelpText>O botão <strong style={{ color: "#fff" }}>Resetar Álbum</strong> apaga todas as figurinhas coletadas e volta ao estado inicial. Requer dupla confirmação.</HelpText>
        <HelpNote>Se após o reset as figurinhas ainda aparecerem, use o botão <strong style={{ color: "#fff" }}>🔄 Limpar cache e reiniciar app</strong> que aparece no modal de confirmação.</HelpNote>
      </>
    ),
  },
  {
    id: "codes", icon: "🔢", title: "Códigos das figurinhas",
    content: (
      <>
        {/* AJUDA: atualizar se o formato de código mudar */}
        <HelpText>Cada figurinha tem um código único sem espaços:</HelpText>
        <div style={{ ...mono, lineHeight: 2.2 }}>
          <div><span style={{ color: tiffany }}>BRA10</span> → Brasil, figurinha nº 10</div>
          <div><span style={{ color: tiffany }}>ARG17</span> → Argentina, figurinha nº 17 (Messi)</div>
          <div><span style={{ color: tiffany }}>FWC1</span>  → FIFA World Cup, figurinha 1</div>
          <div><span style={{ color: tiffany }}>FWC00</span> → Capa do álbum</div>
          <div><span style={{ color: tiffany }}>CC1</span>   → Coca-Cola, figurinha 1</div>
        </div>
        <HelpNote>A busca aceita com ou sem espaço: <code style={{ color: tiffany }}>BRA10</code> e <code style={{ color: tiffany }}>BRA 10</code> retornam o mesmo resultado.</HelpNote>
      </>
    ),
  },
  {
    id: "faq", icon: "❓", title: "Dúvidas frequentes",
    content: (
      <>
        {/* AJUDA: adicionar novas dúvidas conforme surgirem */}
        {[
          { q: "Por que minha figurinha virou Repetida automaticamente?", a: "Ao adicionar uma figurinha que já está como Tenho, o app a converte automaticamente para Repetida — você já tem uma cópia e está adicionando outra." },
          { q: "As Extra Stickers contam no total do álbum?", a: "Não. O total do álbum é 994 figurinhas (980 regulares + 14 Coca-Cola). As 80 Extra Stickers são rastreadas separadamente e não entram nessa contagem." },
          { q: "O que são as bolinhas coloridas na seção Extra Stickers?", a: "Cada bolinha representa um tipo: Lilás · Bronze · Prata · Ouro. Bolinha preenchida = você tem esse tipo. Vazia = ainda falta." },
          { q: "Como compartilho minhas trocas pelo WhatsApp?", a: "Na aba Trocas, clique no botão Compartilhar de uma figurinha individual ou de uma seleção inteira. O WhatsApp abre com a mensagem pronta." },
          { q: "Resetei o álbum mas as figurinhas ainda aparecem. O que fazer?", a: "Use o botão '🔄 Limpar cache e reiniciar app' que aparece na segunda etapa do modal de reset. Ele limpa todos os dados do app e reinicia." },
          { q: "Posso usar o app sem internet?", a: "Sim. Todos os dados ficam salvos no seu dispositivo. Você só precisa de internet para acessar o app pela primeira vez." },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "12px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 5 }}>{item.q}</div>
            <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </>
    ),
  },
];
