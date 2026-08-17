import { useMemo, useState, type ReactNode } from "react";

import { useSistema } from "../context/SistemaContext";
import ExportarExcel from "../components/ExportarExcel";

type RegraSLA = {
  id: string | number;
  processo: string;
  prazo: number;
  status?: string | null;
};

type CasoSLA = {
  id: string;
  referencia: string;
  origem: string;
  processo: string;
  responsavel: string;
  dataInicio: string;
  dataLimite: string;
  prazo: number | null;
  diasDecorridos: number;
  statusCaso: string;
  situacaoSLA: SituacaoSLA;
};

type SituacaoSLA =
  | "Dentro do prazo"
  | "Próximo do vencimento"
  | "Vencido"
  | "Cumprido"
  | "Concluído fora do prazo"
  | "Sem regra";

const STATUS_FINALIZADOS = [
  "finalizado",
  "finalizada",
  "resolvido",
  "resolvida",
  "concluido",
  "concluida",
  "cancelado",
  "cancelada",
  "enviado",
  "reenviado",
  "estornado",
  "estoque"
];

const hoje = () => new Date().toISOString().slice(0, 10);
const texto = (valor: unknown) => String(valor ?? "").trim();
const normalizar = (valor: unknown) =>
  texto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const dataRegistro = (item: any) =>
  texto(
    item.data_entrada ??
      item.dataEntrada ??
      item.data_inicio ??
      item.data ??
      item.data_cadastro ??
      item.dataCadastro ??
      item.created_at
  ).slice(0, 10);

const dataConclusao = (item: any) =>
  texto(
    item.data_finalizacao ??
      item.dataFinalizacao ??
      item.data_conclusao ??
      item.dataConclusao ??
      item.updated_at
  ).slice(0, 10);

const responsavelRegistro = (item: any) =>
  texto(item.responsavel ?? item.operador ?? item.usuario ?? item.criado_por) || "Não informado";

const referenciaRegistro = (item: any) =>
  texto(item.pedido ?? item.cliente ?? item.nota_fiscal ?? item.notaFiscal ?? item.id) || "—";

function paraData(data: string) {
  return new Date(`${data}T12:00:00`);
}

function formatarData(data: string) {
  if (!data) return "—";
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}

function adicionarDiasUteis(dataInicial: string, quantidade: number) {
  const data = paraData(dataInicial);
  let adicionados = 0;

  while (adicionados < quantidade) {
    data.setDate(data.getDate() + 1);
    const diaSemana = data.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) adicionados += 1;
  }

  return data.toISOString().slice(0, 10);
}

function contarDiasUteis(dataInicial: string, dataFinal: string) {
  if (!dataInicial || !dataFinal || dataFinal <= dataInicial) return 0;
  const atual = paraData(dataInicial);
  const fim = paraData(dataFinal);
  let dias = 0;

  while (atual < fim) {
    atual.setDate(atual.getDate() + 1);
    const diaSemana = atual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) dias += 1;
  }

  return dias;
}

function estaFinalizado(status: unknown) {
  const valor = normalizar(status);
  return STATUS_FINALIZADOS.some((item) => valor.includes(item));
}

function encontrarRegra(processo: string, origem: string, regras: RegraSLA[]) {
  const processoNormalizado = normalizar(processo);
  const origemNormalizada = normalizar(origem);

  return regras
    .map((regra) => {
      const regraNormalizada = normalizar(regra.processo);
      let pontos = 0;

      if (regraNormalizada === processoNormalizado) pontos = 100;
      else if (
        processoNormalizado &&
        (regraNormalizada.includes(processoNormalizado) || processoNormalizado.includes(regraNormalizada))
      )
        pontos = 70;
      else if (
        origemNormalizada &&
        (regraNormalizada.includes(origemNormalizada) || origemNormalizada.includes(regraNormalizada))
      )
        pontos = 50;

      return { regra, pontos };
    })
    .sort((a, b) => b.pontos - a.pontos)[0]?.pontos
    ? regras
        .map((regra) => {
          const regraNormalizada = normalizar(regra.processo);
          const pontos =
            regraNormalizada === processoNormalizado
              ? 100
              : processoNormalizado &&
                  (regraNormalizada.includes(processoNormalizado) ||
                    processoNormalizado.includes(regraNormalizada))
                ? 70
                : origemNormalizada &&
                    (regraNormalizada.includes(origemNormalizada) ||
                      origemNormalizada.includes(regraNormalizada))
                  ? 50
                  : 0;
          return { regra, pontos };
        })
        .sort((a, b) => b.pontos - a.pontos)[0].regra
    : undefined;
}

function criarCaso(item: any, origem: string, processo: string, regras: RegraSLA[]): CasoSLA | null {
  const inicio = dataRegistro(item);
  if (!inicio) return null;

  const regra = encontrarRegra(processo, origem, regras);
  const statusCaso = texto(item.status) || "Sem status";
  const finalizado = estaFinalizado(statusCaso);
  const fimAvaliacao = finalizado ? dataConclusao(item) || hoje() : hoje();
  const limite = regra ? adicionarDiasUteis(inicio, regra.prazo) : "";
  const diasDecorridos = contarDiasUteis(inicio, fimAvaliacao);
  let situacaoSLA: SituacaoSLA = "Sem regra";

  if (regra) {
    if (finalizado) {
      situacaoSLA = fimAvaliacao <= limite ? "Cumprido" : "Concluído fora do prazo";
    } else if (fimAvaliacao > limite) {
      situacaoSLA = "Vencido";
    } else {
      const diasRestantes = contarDiasUteis(fimAvaliacao, limite);
      situacaoSLA = diasRestantes <= 1 ? "Próximo do vencimento" : "Dentro do prazo";
    }
  }

  return {
    id: `${origem}-${item.id}`,
    referencia: referenciaRegistro(item),
    origem,
    processo,
    responsavel: responsavelRegistro(item),
    dataInicio: inicio,
    dataLimite: limite,
    prazo: regra?.prazo ?? null,
    diasDecorridos,
    statusCaso,
    situacaoSLA
  };
}

export default function SLA() {
  const sistema = useSistema() as any;
  const {
    slas = [],
    trocas = [],
    devolucoesLogistica = [],
    devolucaoMarketplace = [],
    prioridades = [],
    falhas = []
  } = sistema;

  const [busca, setBusca] = useState("");
  const [filtroOrigem, setFiltroOrigem] = useState("Todas");
  const [filtroSituacao, setFiltroSituacao] = useState("Todas");
  const [filtroResponsavel, setFiltroResponsavel] = useState("Todos");

  const regrasAtivas = useMemo<RegraSLA[]>(
    () =>
      slas
        .filter((item: any) => {
          const status = normalizar(item.status);
          return texto(item.processo) && Number(item.prazo) > 0 && status !== "inativo";
        })
        .map((item: any) => ({
          id: item.id,
          processo: texto(item.processo),
          prazo: Math.max(1, Number(item.prazo)),
          status: item.status
        })),
    [slas]
  );

  const casos = useMemo(() => {
    const todos: Array<CasoSLA | null> = [];

    trocas.forEach((item: any) => {
      const origem = texto(item.tipo) || "Troquecommerce";
      const processo = texto(item.atividade) || origem;
      todos.push(criarCaso(item, origem, processo, regrasAtivas));
    });

    devolucoesLogistica.forEach((item: any) =>
      todos.push(criarCaso(item, "Devolução logística", "Devolução logística", regrasAtivas))
    );

    devolucaoMarketplace.forEach((item: any) =>
      todos.push(criarCaso(item, "Marketplace", "Marketplace", regrasAtivas))
    );

    prioridades.forEach((item: any) =>
      todos.push(criarCaso(item, "Pedidos prioritários", "Pedidos prioritários", regrasAtivas))
    );

    falhas.forEach((item: any) =>
      todos.push(criarCaso(item, "Falhas", texto(item.tipo) || "Falhas", regrasAtivas))
    );

    return todos
      .filter((item): item is CasoSLA => Boolean(item))
      .sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
  }, [trocas, devolucoesLogistica, devolucaoMarketplace, prioridades, falhas, regrasAtivas]);

  const origens = useMemo(
    () => [...new Set(casos.map((item) => item.origem))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [casos]
  );
  const responsaveis = useMemo(
    () =>
      [...new Set(casos.map((item) => item.responsavel))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [casos]
  );

  const casosFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    return casos.filter((item) => {
      if (termo && !normalizar(`${item.referencia} ${item.processo} ${item.responsavel}`).includes(termo))
        return false;
      if (filtroOrigem !== "Todas" && item.origem !== filtroOrigem) return false;
      if (filtroSituacao !== "Todas" && item.situacaoSLA !== filtroSituacao) return false;
      if (filtroResponsavel !== "Todos" && item.responsavel !== filtroResponsavel) return false;
      return true;
    });
  }, [casos, busca, filtroOrigem, filtroSituacao, filtroResponsavel]);

  const indicadores = useMemo(() => {
    const dentro = casosFiltrados.filter((item) =>
      ["Dentro do prazo", "Cumprido"].includes(item.situacaoSLA)
    ).length;
    const proximos = casosFiltrados.filter(
      (item) => item.situacaoSLA === "Próximo do vencimento"
    ).length;
    const vencidos = casosFiltrados.filter((item) =>
      ["Vencido", "Concluído fora do prazo"].includes(item.situacaoSLA)
    ).length;
    const semRegra = casosFiltrados.filter((item) => item.situacaoSLA === "Sem regra").length;
    const concluidosAvaliados = casosFiltrados.filter((item) =>
      ["Cumprido", "Concluído fora do prazo"].includes(item.situacaoSLA)
    );
    const cumpridos = concluidosAvaliados.filter((item) => item.situacaoSLA === "Cumprido").length;
    const cumprimento = concluidosAvaliados.length
      ? Math.round((cumpridos / concluidosAvaliados.length) * 100)
      : 0;

    return { total: casosFiltrados.length, dentro, proximos, vencidos, semRegra, cumprimento };
  }, [casosFiltrados]);

  const situacaoGeral = useMemo(() => {
    const ordem: SituacaoSLA[] = ["Dentro do prazo", "Próximo do vencimento", "Vencido", "Cumprido", "Concluído fora do prazo"];
    return ordem.map((nome) => ({ nome, valor: casosFiltrados.filter((item) => item.situacaoSLA === nome).length }));
  }, [casosFiltrados]);

  const cumprimentoPorArea = useMemo(() => {
    const mapa = new Map<string, { total: number; dentro: number }>();
    casosFiltrados.filter((item) => item.situacaoSLA !== "Sem regra").forEach((item) => {
      const atual = mapa.get(item.origem) ?? { total: 0, dentro: 0 };
      atual.total += 1;
      if (["Dentro do prazo", "Cumprido"].includes(item.situacaoSLA)) atual.dentro += 1;
      mapa.set(item.origem, atual);
    });
    return [...mapa.entries()].map(([nome, valor]) => ({ nome, total: valor.total, percentual: valor.total ? Math.round(valor.dentro / valor.total * 100) : 0 })).sort((a, b) => b.percentual - a.percentual);
  }, [casosFiltrados]);

  const evolucaoCumprimento = useMemo(() => {
    const mapa = new Map<string, { total: number; dentro: number }>();
    casosFiltrados.filter((item) => item.situacaoSLA !== "Sem regra").forEach((item) => {
      const atual = mapa.get(item.dataInicio) ?? { total: 0, dentro: 0 };
      atual.total += 1;
      if (["Dentro do prazo", "Cumprido"].includes(item.situacaoSLA)) atual.dentro += 1;
      mapa.set(item.dataInicio, atual);
    });
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([data, valor]) => ({ data, percentual: Math.round(valor.dentro / valor.total * 100) }));
  }, [casosFiltrados]);

  const rankingProcessos = useMemo(() => {
    const mapa = new Map<string, { total: number; atrasados: number }>();
    casosFiltrados.forEach((item) => {
      const atual = mapa.get(item.processo) ?? { total: 0, atrasados: 0 };
      atual.total += 1;
      if (["Vencido", "Concluído fora do prazo"].includes(item.situacaoSLA)) atual.atrasados += 1;
      mapa.set(item.processo, atual);
    });
    return [...mapa.entries()].map(([nome, valor]) => ({ nome, ...valor, taxa: valor.total ? Math.round(valor.atrasados / valor.total * 100) : 0 })).filter((item) => item.atrasados > 0).sort((a, b) => b.atrasados - a.atrasados || b.taxa - a.taxa).slice(0, 7);
  }, [casosFiltrados]);

  const agingVencidos = useMemo(() => {
    const faixas = [{ nome: "1 dia útil", valor: 0 }, { nome: "2 a 3 dias", valor: 0 }, { nome: "4 a 7 dias", valor: 0 }, { nome: "Acima de 7 dias", valor: 0 }];
    casosFiltrados.filter((item) => ["Vencido", "Concluído fora do prazo"].includes(item.situacaoSLA)).forEach((item) => {
      const atraso = Math.max(1, item.diasDecorridos - (item.prazo ?? 0));
      if (atraso === 1) faixas[0].valor += 1;
      else if (atraso <= 3) faixas[1].valor += 1;
      else if (atraso <= 7) faixas[2].valor += 1;
      else faixas[3].valor += 1;
    });
    return faixas;
  }, [casosFiltrados]);

  const proximosVencimentos = useMemo(() => casosFiltrados.filter((item) => item.situacaoSLA === "Próximo do vencimento").sort((a, b) => a.dataLimite.localeCompare(b.dataLimite)).slice(0, 6), [casosFiltrados]);

  const colunasExportacao = [
    { campo: "referencia", titulo: "Referência" },
    { campo: "origem", titulo: "Área" },
    { campo: "processo", titulo: "Processo" },
    { campo: "responsavel", titulo: "Responsável" },
    { campo: "dataInicio", titulo: "Data inicial" },
    { campo: "dataLimite", titulo: "Data limite" },
    { campo: "prazo", titulo: "Prazo em dias úteis" },
    { campo: "statusCaso", titulo: "Status do caso" },
    { campo: "situacaoSLA", titulo: "Situação do SLA" }
  ];

  const limparFiltros = () => {
    setBusca("");
    setFiltroOrigem("Todas");
    setFiltroSituacao("Todas");
    setFiltroResponsavel("Todos");
  };

  return (
    <main className="p-6" style={{ minHeight: "100vh", background: "#faf9ff" }}>
      <style>{`
        .sla-analises {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr);
        }
        @media (max-width: 900px) {
          .sla-analises {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <header
        className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 shadow-sm"
        style={headerStyle}
      >
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ margin: 0 }}>
            Controle de SLA
          </h1>
          <p className="text-purple-200 text-sm mt-1" style={{ marginBottom: 0 }}>
            Monitoramento automático dos prazos operacionais em dias úteis
          </p>
        </div>
        <ExportarExcel
          dados={casosFiltrados}
          nomeArquivo="controle_sla"
          nomeAba="SLA"
          titulo="Exportar Excel"
          colunas={colunasExportacao}
        />
      </header>

      <section style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={secaoCabecalhoStyle}>
          <div>
            <h2 style={tituloStyle}>Filtros</h2>
            <p style={subtituloStyle}>Os indicadores e registros respondem aos filtros abaixo</p>
          </div>
          <button type="button" onClick={limparFiltros} style={botaoSecundarioStyle}>
            Limpar filtros
          </button>
        </div>
        <div style={gridFiltrosStyle}>
          <Campo titulo="Buscar">
            <input
              style={inputStyle}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pedido, processo ou responsável"
            />
          </Campo>
          <Campo titulo="Área / Origem">
            <select style={inputStyle} value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}>
              <option>Todas</option>
              {origens.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Campo>
          <Campo titulo="Situação do SLA">
            <select
              style={inputStyle}
              value={filtroSituacao}
              onChange={(e) => setFiltroSituacao(e.target.value)}
            >
              <option>Todas</option>
              {["Dentro do prazo", "Próximo do vencimento", "Vencido", "Cumprido", "Concluído fora do prazo", "Sem regra"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </Campo>
          <Campo titulo="Responsável">
            <select
              style={inputStyle}
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
            >
              <option>Todos</option>
              {responsaveis.map((item) => <option key={item}>{item}</option>)}
            </select>
          </Campo>
        </div>
      </section>

      <section aria-label="Indicadores de SLA" style={kpiGridStyle}>
        <Kpi titulo="Casos monitorados" valor={indicadores.total} detalhe={`${regrasAtivas.length} regra(s) ativa(s)`} cor="#7c3aed" />
        <Kpi titulo="Dentro do prazo" valor={indicadores.dentro} detalhe="abertos e concluídos" cor="#16a34a" />
        <Kpi titulo="Próximos do vencimento" valor={indicadores.proximos} detalhe="até 1 dia útil" cor="#f59e0b" />
        <Kpi titulo="Fora do prazo" valor={indicadores.vencidos} detalhe="vencidos ou concluídos fora" cor="#dc2626" />
        <Kpi titulo="Sem regra" valor={indicadores.semRegra} detalhe="configure o prazo do processo" cor="#64748b" />
        <Kpi titulo="Cumprimento" valor={`${indicadores.cumprimento}%`} detalhe="entre casos concluídos" cor="#2563eb" />
      </section>

      {regrasAtivas.length === 0 && (
        <section style={alertaStyle}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <strong style={{ display: "block", color: "#92400e" }}>Nenhuma regra de SLA ativa</strong>
            <span style={{ color: "#78350f", fontSize: 13 }}>
              Vá em Configurações → Regras de SLA e cadastre o processo e seu prazo em dias.
            </span>
          </div>
        </section>
      )}

      <section className="sla-analises" style={analiseGridStyle}>
        <Painel titulo="Situação geral" subtitulo="Distribuição dos casos monitorados"><GraficoRosca dados={situacaoGeral} centro={`${indicadores.cumprimento}%`} /></Painel>
        <Painel titulo="Cumprimento por área" subtitulo="Percentual atendido dentro do prazo"><BarrasPercentuais dados={cumprimentoPorArea} /></Painel>
      </section>

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <h2 style={tituloStyle}>Evolução do cumprimento</h2>
        <p style={subtituloStyle}>Últimos 14 dias com meta operacional de 90%</p>
        <GraficoLinha dados={evolucaoCumprimento} />
      </section>

      <section className="sla-analises" style={{ ...analiseGridStyle, marginTop: 18 }}>
        <Painel titulo="Ranking de processos críticos" subtitulo="Processos com maior volume de atrasos"><RankingProcessos dados={rankingProcessos} /></Painel>
        <Painel titulo="Aging dos vencidos" subtitulo="Tempo acumulado além do prazo"><BarrasAging dados={agingVencidos} /></Painel>
      </section>

      <section className="sla-analises" style={{ ...analiseGridStyle, marginTop: 18 }}>
        <Painel titulo="Próximos vencimentos" subtitulo="Casos que vencem em até um dia útil"><ProximosVencimentos dados={proximosVencimentos} /></Painel>
        <div style={cardStyle}>
          <h2 style={tituloStyle}>Regras ativas</h2><p style={subtituloStyle}>Prazos usados no cálculo automático</p>
          <div style={{ display: "grid", gap: 9, marginTop: 16 }}>{regrasAtivas.map((regra) => <div key={regra.id} style={regraStyle}><div><strong style={{ display: "block", color: "#4c1d95", fontSize: 13 }}>{regra.processo}</strong><span style={{ color: "#8b7c98", fontSize: 11 }}>Prazo operacional</span></div><span style={prazoTagStyle}>{regra.prazo} dia(s) útil(eis)</span></div>)}{!regrasAtivas.length && <Vazio texto="Cadastre as regras em Configurações." />}</div>
        </div>
      </section>

      <section style={{ ...cardStyle, marginTop: 18 }}>
        <div style={secaoCabecalhoStyle}>
          <div>
            <h2 style={tituloStyle}>Acompanhamento dos casos</h2>
            <p style={subtituloStyle}>{casosFiltrados.length} caso(s) conforme os filtros</p>
          </div>
        </div>
        <div style={{ overflowX: "auto", marginTop: 15 }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headStyle}>
                {["Referência", "Área", "Processo", "Responsável", "Início", "Limite", "Status do caso", "SLA"].map((titulo) => (
                  <th key={titulo} style={cellStyle}>{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {casosFiltrados.map((item) => (
                <tr key={item.id} style={rowStyle}>
                  <td style={{ ...cellStyle, fontWeight: 750, color: "#4c1d95" }}>{item.referencia}</td>
                  <td style={cellStyle}>{item.origem}</td>
                  <td style={cellStyle}>{item.processo}</td>
                  <td style={cellStyle}>{item.responsavel}</td>
                  <td style={cellStyle}>{formatarData(item.dataInicio)}</td>
                  <td style={cellStyle}>{formatarData(item.dataLimite)}</td>
                  <td style={cellStyle}>{item.statusCaso}</td>
                  <td style={cellStyle}><Badge situacao={item.situacaoSLA} /></td>
                </tr>
              ))}
              {!casosFiltrados.length && (
                <tr><td colSpan={8} style={{ padding: 34, textAlign: "center", color: "#6b7280" }}>Nenhum caso encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Campo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return <label style={campoStyle}><span style={labelStyle}>{titulo}</span>{children}</label>;
}

function Kpi({ titulo, valor, detalhe, cor }: { titulo: string; valor: string | number; detalhe: string; cor: string }) {
  return (
    <article style={{ ...kpiStyle, borderLeftColor: cor }}>
      <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 650 }}>{titulo}</span>
      <strong style={{ color: cor, fontSize: 30, lineHeight: 1.15, marginTop: 5 }}>{valor}</strong>
      <span style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>{detalhe}</span>
    </article>
  );
}

function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return <div style={cardStyle}><h2 style={tituloStyle}>{titulo}</h2><p style={subtituloStyle}>{subtitulo}</p>{children}</div>;
}

function GraficoRosca({ dados, centro }: { dados: Array<{ nome: string; valor: number }>; centro: string }) {
  const cores = ["#16a34a", "#f59e0b", "#dc2626", "#2563eb", "#be123c"];
  const total = dados.reduce((soma, item) => soma + item.valor, 0);
  let acumulado = 0;
  const partes = total ? dados.map((item, indice) => { const inicio = acumulado; acumulado += item.valor / total * 100; return `${cores[indice]} ${inicio}% ${acumulado}%`; }) : ["#e5e7eb 0% 100%"];
  return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 22, marginTop: 18 }}><div style={{ width: 150, height: 150, borderRadius: "50%", background: `conic-gradient(${partes.join(",")})`, display: "grid", placeItems: "center" }}><div style={{ width: 88, height: 88, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", color: "#4c1d95", fontSize: 22, fontWeight: 850 }}>{centro}</div></div><div style={{ display: "grid", gap: 8, flex: 1, minWidth: 210 }}>{dados.map((item, indice) => <div key={item.nome} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: cores[indice], marginRight: 7 }} />{item.nome}</span><strong>{item.valor}</strong></div>)}</div></div>;
}

function BarrasPercentuais({ dados }: { dados: Array<{ nome: string; total: number; percentual: number }> }) {
  return <div style={{ display: "grid", gap: 13, marginTop: 18 }}>{dados.map((item) => <div key={item.nome}><div style={barraCabecalhoStyle}><strong style={{ color: "#4c1d95", fontSize: 12 }}>{item.nome}</strong><span style={{ color: "#6b7280", fontSize: 11 }}>{item.percentual}% · {item.total} casos</span></div><div style={trilhoStyle}><div style={{ ...barraStyle, width: `${item.percentual}%`, background: item.percentual >= 90 ? "#16a34a" : item.percentual >= 70 ? "#f59e0b" : "#dc2626" }} /></div></div>)}{!dados.length && <Vazio texto="Nenhuma área com regra configurada." />}</div>;
}

function GraficoLinha({ dados }: { dados: Array<{ data: string; percentual: number }> }) {
  if (!dados.length) return <Vazio texto="Ainda não há dados suficientes para a evolução." />;
  const largura = 760, altura = 210, esquerda = 34, topo = 18, base = 165;
  const passo = dados.length > 1 ? (largura - esquerda - 18) / (dados.length - 1) : 0;
  const pontos = dados.map((item, indice) => ({ ...item, x: esquerda + indice * passo, y: base - item.percentual / 100 * (base - topo) }));
  return <div style={{ overflowX: "auto", marginTop: 14 }}><svg viewBox={`0 0 ${largura} ${altura}`} style={{ width: "100%", minWidth: 650, height: 220 }}><line x1={esquerda} x2={largura - 15} y1={base - .9 * (base - topo)} y2={base - .9 * (base - topo)} stroke="#f59e0b" strokeDasharray="6 5" /><text x={largura - 68} y={base - .9 * (base - topo) - 5} fill="#b45309" fontSize="10">Meta 90%</text><polyline fill="none" stroke="#7c3aed" strokeWidth="3" points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} />{pontos.map((p, i) => <g key={p.data}><circle cx={p.x} cy={p.y} r="4" fill="#7c3aed" /><text x={p.x} y={p.y - 9} textAnchor="middle" fill="#4c1d95" fontSize="10" fontWeight="700">{p.percentual}%</text>{(i % Math.ceil(dados.length / 7) === 0 || i === dados.length - 1) && <text x={p.x} y={base + 21} textAnchor="middle" fill="#6b7280" fontSize="9">{formatarData(p.data).slice(0,5)}</text>}</g>)}</svg></div>;
}

function RankingProcessos({ dados }: { dados: Array<{ nome: string; total: number; atrasados: number; taxa: number }> }) {
  return <div style={{ display: "grid", gap: 9, marginTop: 16 }}>{dados.map((item, indice) => <div key={item.nome} style={rankingStyle}><span style={posicaoStyle}>{indice + 1}</span><div style={{ flex: 1, minWidth: 0 }}><strong style={{ display: "block", color: "#4c1d95", fontSize: 12 }}>{item.nome}</strong><span style={{ color: "#8b7c98", fontSize: 10 }}>{item.atrasados} atrasado(s) em {item.total}</span></div><strong style={{ color: item.taxa > 30 ? "#dc2626" : "#f59e0b", fontSize: 13 }}>{item.taxa}%</strong></div>)}{!dados.length && <Vazio texto="Nenhum processo com atraso." />}</div>;
}

function BarrasAging({ dados }: { dados: Array<{ nome: string; valor: number }> }) {
  const maior = Math.max(1, ...dados.map((item) => item.valor));
  const cores = ["#fbbf24", "#f97316", "#ef4444", "#991b1b"];
  return <div style={{ display: "grid", gap: 13, marginTop: 18 }}>{dados.map((item, indice) => <div key={item.nome}><div style={barraCabecalhoStyle}><span style={{ color: "#4c1d95", fontSize: 12 }}>{item.nome}</span><strong style={{ color: cores[indice] }}>{item.valor}</strong></div><div style={trilhoStyle}><div style={{ ...barraStyle, width: `${item.valor / maior * 100}%`, background: cores[indice] }} /></div></div>)}</div>;
}

function ProximosVencimentos({ dados }: { dados: CasoSLA[] }) {
  return <div style={{ display: "grid", gap: 8, marginTop: 16 }}>{dados.map((item) => <div key={item.id} style={proximoStyle}><div><strong style={{ display: "block", color: "#4c1d95", fontSize: 12 }}>{item.referencia} · {item.processo}</strong><span style={{ color: "#7c7189", fontSize: 10 }}>{item.responsavel}</span></div><span style={{ ...prazoTagStyle, background: item.dataLimite === hoje() ? "#fee2e2" : "#fef3c7", color: item.dataLimite === hoje() ? "#b91c1c" : "#92400e" }}>{item.dataLimite === hoje() ? "Hoje" : formatarData(item.dataLimite)}</span></div>)}{!dados.length && <Vazio texto="Nenhum vencimento imediato." />}</div>;
}

function Badge({ situacao }: { situacao: SituacaoSLA }) {
  const cores: Record<SituacaoSLA, { fundo: string; texto: string }> = {
    "Dentro do prazo": { fundo: "#dcfce7", texto: "#166534" },
    "Próximo do vencimento": { fundo: "#fef3c7", texto: "#92400e" },
    Vencido: { fundo: "#fee2e2", texto: "#b91c1c" },
    Cumprido: { fundo: "#dbeafe", texto: "#1d4ed8" },
    "Concluído fora do prazo": { fundo: "#ffe4e6", texto: "#be123c" },
    "Sem regra": { fundo: "#f1f5f9", texto: "#475569" }
  };
  const cor = cores[situacao];
  return <span style={{ padding: "5px 9px", borderRadius: 999, background: cor.fundo, color: cor.texto, fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>{situacao}</span>;
}

function Vazio({ texto }: { texto: string }) {
  return <div style={{ padding: 20, textAlign: "center", color: "#8b7c98", fontSize: 13 }}>{texto}</div>;
}

const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" } as const;
const cardStyle = { background: "#fff", border: "1px solid #ede9fe", borderRadius: 14, padding: 20, boxShadow: "0 3px 12px rgba(76,29,149,.07)" } as const;
const tituloStyle = { margin: 0, color: "#4c1d95", fontSize: 18, fontWeight: 800 } as const;
const subtituloStyle = { margin: "4px 0 0", color: "#7c7189", fontSize: 12 } as const;
const secaoCabecalhoStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } as const;
const gridFiltrosStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginTop: 15 } as const;
const campoStyle = { display: "flex", flexDirection: "column", gap: 6 } as const;
const labelStyle = { color: "#4c1d95", fontSize: 13, fontWeight: 700 } as const;
const inputStyle = { width: "100%", minHeight: 42, padding: "9px 11px", border: "1px solid #d8d2e8", borderRadius: 9, background: "#fff", color: "#1f2937", outlineColor: "#7c3aed" } as const;
const botaoSecundarioStyle = { padding: "9px 13px", borderRadius: 9, border: "1px solid #ddd6fe", background: "#fff", color: "#6d28d9", cursor: "pointer", fontWeight: 700 } as const;
const kpiGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14, marginBottom: 18 } as const;
const kpiStyle = { display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #ede9fe", borderLeft: "5px solid", borderRadius: 13, padding: "16px 17px", boxShadow: "0 3px 12px rgba(76,29,149,.06)" } as const;
const alertaStyle = { display: "flex", gap: 11, alignItems: "flex-start", padding: 15, marginBottom: 18, borderRadius: 12, border: "1px solid #fcd34d", background: "#fffbeb" } as const;
const analiseGridStyle = { display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, .65fr)", gap: 18 } as const;
const barraCabecalhoStyle = { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 } as const;
const trilhoStyle = { height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" } as const;
const barraStyle = { height: "100%", minWidth: 3, borderRadius: 999, transition: "width .2s ease" } as const;
const regraStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, border: "1px solid #ede9fe", background: "#faf9ff" } as const;
const prazoTagStyle = { padding: "5px 8px", borderRadius: 999, background: "#ede9fe", color: "#5b21b6", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" } as const;
const tableStyle = { width: "100%", minWidth: 1050, borderCollapse: "collapse" } as const;
const headStyle = { background: "#f5f3ff", color: "#5b21b6", textAlign: "left" } as const;
const rowStyle = { borderBottom: "1px solid #f0ebf8" } as const;
const cellStyle = { padding: 11, fontSize: 12, verticalAlign: "middle" } as const;
const rankingStyle = { display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", border: "1px solid #ede9fe", borderRadius: 10, background: "#faf9ff" } as const;
const posicaoStyle = { width: 25, height: 25, borderRadius: "50%", display: "grid", placeItems: "center", background: "#ede9fe", color: "#5b21b6", fontSize: 11, fontWeight: 850 } as const;
const proximoStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 11px", border: "1px solid #ede9fe", borderRadius: 10, background: "#fff" } as const;
