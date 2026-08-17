import { useMemo, useState } from "react";

import { useSistema } from "../context/SistemaContext";
import Operadores from "../components/configuracoes/Operadores";
import Usuarios from "../components/configuracoes/Usuarios";
import Atividades from "../components/configuracoes/Atividades";
import Transportadoras from "../components/configuracoes/Transportadoras";
import Motivos from "../components/configuracoes/Motivos";
import Marketplaces from "../components/configuracoes/Marketplaces";
import SLA from "../components/configuracoes/SLA";
import Produtos from "../components/configuracoes/Produtos";

type AbaConfiguracao =
  | "usuarios"
  | "operadores"
  | "atividades"
  | "transportadoras"
  | "motivos"
  | "marketplaces"
  | "produtos"
  | "sla";

type ItemMenu = {
  id: AbaConfiguracao;
  nome: string;
  descricao: string;
  icone: string;
};

const MENU: ItemMenu[] = [
  {
    id: "usuarios",
    nome: "Usuários",
    descricao: "Acessos e perfis do sistema",
    icone: "👥"
  },
  {
    id: "operadores",
    nome: "Operadores",
    descricao: "Equipe responsável pela operação",
    icone: "👤"
  },
  {
    id: "atividades",
    nome: "Atividades",
    descricao: "Tipos de tarefas e produtividade",
    icone: "📋"
  },
  {
    id: "transportadoras",
    nome: "Transportadoras",
    descricao: "Parceiros de entrega e devolução",
    icone: "🚚"
  },
  {
    id: "motivos",
    nome: "Motivos",
    descricao: "Motivos usados nos registros",
    icone: "🏷️"
  },
  {
    id: "marketplaces",
    nome: "Marketplaces",
    descricao: "Canais externos de venda",
    icone: "🏪"
  },
  {
    id: "produtos",
    nome: "Produtos",
    descricao: "Catálogo para autopreenchimento de falhas",
    icone: "👕"
  },
  {
    id: "sla",
    nome: "Regras de SLA",
    descricao: "Prazos definidos por processo",
    icone: "⏱️"
  }
];

export default function Configuracoes() {
  const sistema = useSistema() as any;
  const {
    usuarios = [],
    operadores = [],
    atividades = [],
    transportadoras = [],
    motivos = [],
    marketplaces = [],
    produtos = [],
    slas = []
  } = sistema;

  const [abaSelecionada, setAbaSelecionada] = useState<AbaConfiguracao>("operadores");

  const totais = useMemo(
    () => ({
      usuarios: usuarios.length,
      operadores: operadores.length,
      atividades: atividades.length,
      cadastrosOperacionais:
        transportadoras.length + motivos.length + marketplaces.length + produtos.length,
      slasAtivos: slas.filter(
        (item: any) => String(item.status ?? "Ativo").trim().toLowerCase() !== "inativo"
      ).length
    }),
    [usuarios, operadores, atividades, transportadoras, motivos, marketplaces, produtos, slas]
  );

  const itemAtivo = MENU.find((item) => item.id === abaSelecionada) ?? MENU[1];

  function renderizarConteudo() {
    switch (abaSelecionada) {
      case "usuarios":
        return <Usuarios />;
      case "operadores":
        return <Operadores />;
      case "atividades":
        return <Atividades />;
      case "transportadoras":
        return <Transportadoras />;
      case "motivos":
        return <Motivos />;
      case "marketplaces":
        return <Marketplaces />;
      case "produtos":
        return <Produtos />;
      case "sla":
        return <SLA />;
      default:
        return <Operadores />;
    }
  }

  return (
    <main className="p-6" style={{ minHeight: "100vh", background: "#faf9ff" }}>
      <style>{`
        .config-painel-principal {
          display: grid;
          grid-template-columns: minmax(230px, 280px) minmax(0, 1fr);
        }
        .configuracao-conteudo > div {
          padding: 21px !important;
        }
        .configuracao-conteudo > div > h2:first-child {
          display: none;
        }
        .configuracao-conteudo table {
          border-radius: 10px;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .config-painel-principal {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .configuracao-conteudo > div {
            padding: 15px !important;
          }
        }
      `}</style>
      <header
        className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 shadow-sm"
        style={headerStyle}
      >
        <div>
          <div style={headerTagStyle}>ADMINISTRAÇÃO DO SISTEMA</div>
          <h1 className="text-2xl font-bold text-white" style={{ margin: "5px 0 0" }}>
            Configurações
          </h1>
          <p className="text-purple-200 text-sm mt-1" style={{ marginBottom: 0 }}>
            Gerencie usuários, equipe e cadastros utilizados em toda a operação
          </p>
        </div>

        <div style={statusHeaderStyle}>
          <span style={statusDotStyle} />
          {MENU.length} módulos de configuração
        </div>
      </header>

      <section aria-label="Resumo das configurações" style={resumoGridStyle}>
        <ResumoCard titulo="Usuários" valor={totais.usuarios} detalhe="acessos cadastrados" cor="#7c3aed" />
        <ResumoCard titulo="Operadores" valor={totais.operadores} detalhe="na equipe operacional" cor="#2563eb" />
        <ResumoCard titulo="Atividades" valor={totais.atividades} detalhe="tipos disponíveis" cor="#0891b2" />
        <ResumoCard
          titulo="Cadastros operacionais"
          valor={totais.cadastrosOperacionais}
          detalhe="transportadoras, motivos e canais"
          cor="#16a34a"
        />
      </section>

      <section className="config-painel-principal" style={painelPrincipalStyle}>
        <aside style={menuLateralStyle} aria-label="Categorias de configuração">
          <div style={menuCabecalhoStyle}>
            <strong style={{ color: "#4c1d95" }}>Categorias</strong>
            <span style={{ color: "#7c6f91", fontSize: 12 }}>Selecione o que deseja gerenciar</span>
          </div>

          <nav style={{ display: "grid", gap: 8 }}>
            {MENU.map((item) => {
              const ativo = abaSelecionada === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAbaSelecionada(item.id)}
                  style={botaoMenuStyle(ativo)}
                  aria-current={ativo ? "page" : undefined}
                >
                  <span style={iconeMenuStyle(ativo)}>{item.icone}</span>
                  <span style={{ minWidth: 0, textAlign: "left" }}>
                    <span style={nomeMenuStyle(ativo)}>{item.nome}</span>
                    <span style={descricaoMenuStyle(ativo)}>{item.descricao}</span>
                  </span>
                  <span aria-hidden="true" style={{ color: ativo ? "#fff" : "#a78bfa", fontSize: 19 }}>
                    ›
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div style={conteudoStyle}>
          <div style={conteudoCabecalhoStyle}>
            <div style={iconeTituloStyle}>{itemAtivo.icone}</div>
            <div>
              <h2 style={{ margin: 0, color: "#3b0764", fontSize: 22, fontWeight: 800 }}>
                {itemAtivo.nome}
              </h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
                {itemAtivo.descricao}
              </p>
            </div>
          </div>

          {abaSelecionada === "sla" && (
            <div style={avisoSlaStyle}>
              <span style={{ fontSize: 19 }}>ℹ️</span>
              <div>
                <strong style={{ display: "block", color: "#5b21b6", fontSize: 13 }}>
                  Cadastro de regra
                </strong>
                <span style={{ color: "#6d5b7b", fontSize: 12 }}>
                  Defina aqui o prazo padrão. O acompanhamento dos resultados pertence à página Controle de SLA.
                </span>
              </div>
            </div>
          )}

          <div className="configuracao-conteudo" style={componenteStyle}>
            {renderizarConteudo()}
          </div>
        </div>
      </section>
    </main>
  );
}

function ResumoCard({
  titulo,
  valor,
  detalhe,
  cor
}: {
  titulo: string;
  valor: number;
  detalhe: string;
  cor: string;
}) {
  return (
    <article style={{ ...resumoCardStyle, borderLeftColor: cor }}>
      <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>{titulo}</div>
      <div style={{ color: cor, fontSize: 29, fontWeight: 850, lineHeight: 1.15, marginTop: 5 }}>
        {valor}
      </div>
      <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>{detalhe}</div>
    </article>
  );
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap"
} as const;

const headerTagStyle = {
  color: "#ddd6fe",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: ".14em"
} as const;

const statusHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "9px 13px",
  border: "1px solid rgba(255,255,255,.2)",
  borderRadius: 999,
  color: "#ede9fe",
  background: "rgba(255,255,255,.08)",
  fontSize: 12,
  fontWeight: 700
} as const;

const statusDotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#86efac",
  boxShadow: "0 0 0 4px rgba(134,239,172,.15)"
} as const;

const resumoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginBottom: 20
} as const;

const resumoCardStyle = {
  background: "#fff",
  borderRadius: 13,
  border: "1px solid #ede9fe",
  borderLeft: "5px solid",
  padding: "16px 18px",
  boxShadow: "0 3px 12px rgba(76,29,149,.06)"
} as const;

const painelPrincipalStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(230px, 280px) minmax(0, 1fr)",
  gap: 18,
  alignItems: "start"
} as const;

const menuLateralStyle = {
  background: "#fff",
  border: "1px solid #ede9fe",
  borderRadius: 15,
  padding: 12,
  boxShadow: "0 4px 16px rgba(76,29,149,.07)"
} as const;

const menuCabecalhoStyle = {
  display: "grid",
  gap: 3,
  padding: "7px 8px 13px"
} as const;

const botaoMenuStyle = (ativo: boolean) =>
  ({
    width: "100%",
    display: "grid",
    gridTemplateColumns: "38px minmax(0, 1fr) 14px",
    alignItems: "center",
    gap: 10,
    border: ativo ? "1px solid #6d28d9" : "1px solid transparent",
    borderRadius: 11,
    padding: "10px 9px",
    background: ativo ? "linear-gradient(135deg, #7c3aed, #5b21b6)" : "transparent",
    cursor: "pointer",
    transition: "all .18s ease",
    boxShadow: ativo ? "0 7px 16px rgba(109,40,217,.2)" : "none"
  }) as const;

const iconeMenuStyle = (ativo: boolean) =>
  ({
    width: 36,
    height: 36,
    display: "grid",
    placeItems: "center",
    borderRadius: 9,
    background: ativo ? "rgba(255,255,255,.16)" : "#f5f3ff",
    fontSize: 18
  }) as const;

const nomeMenuStyle = (ativo: boolean) =>
  ({
    display: "block",
    color: ativo ? "#fff" : "#4c1d95",
    fontSize: 13,
    fontWeight: 750,
    lineHeight: 1.25
  }) as const;

const descricaoMenuStyle = (ativo: boolean) =>
  ({
    display: "block",
    color: ativo ? "#e9d5ff" : "#8a7d99",
    fontSize: 10,
    lineHeight: 1.25,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis"
  }) as const;

const conteudoStyle = {
  minWidth: 0,
  background: "#fff",
  border: "1px solid #ede9fe",
  borderRadius: 15,
  boxShadow: "0 4px 16px rgba(76,29,149,.07)",
  overflow: "hidden"
} as const;

const conteudoCabecalhoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "18px 21px",
  borderBottom: "1px solid #f0ebf8",
  background: "linear-gradient(90deg, #faf7ff, #fff)"
} as const;

const iconeTituloStyle = {
  width: 43,
  height: 43,
  display: "grid",
  placeItems: "center",
  borderRadius: 11,
  background: "#ede9fe",
  fontSize: 21
} as const;

const avisoSlaStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  margin: "17px 21px 0",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid #ddd6fe",
  background: "#faf5ff"
} as const;

const componenteStyle = { padding: "0 4px 5px", minWidth: 0 } as const;
