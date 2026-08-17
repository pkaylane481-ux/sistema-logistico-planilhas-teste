import { useMemo, useState, type ReactNode } from "react";

import { useSistema } from "../context/SistemaContext";
import ExportarExcel from "../components/ExportarExcel";

type Aba = "geral" | "produtividade" | "sla" | "qualidade" | "resultados";
type Evento = {
  id: string;
  referencia: string;
  data: string;
  dataFim: string;
  area: string;
  processo: string;
  responsavel: string;
  status: string;
  quantidade: number;
  finalizado: boolean;
  marketplace: string;
  transportadora: string;
  motivo: string;
  naoEntregue: boolean;
  valorFrete: number;
  valorEstorno: number;
};

const ABAS: Array<{ id: Aba; nome: string; icone: string }> = [
  { id: "geral", nome: "Visão geral", icone: "◫" },
  { id: "produtividade", nome: "Produtividade", icone: "↗" },
  { id: "sla", nome: "SLA e prazos", icone: "◷" },
  { id: "qualidade", nome: "Qualidade e falhas", icone: "!" },
  { id: "resultados", nome: "Resultados logísticos", icone: "⇄" }
];

const texto = (valor: unknown) => String(valor ?? "").trim();
const normalizar = (valor: unknown) => texto(valor).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const numero = (valor: unknown) => Number(valor) || 0;
const dataItem = (item: any) => texto(item.data_entrada ?? item.dataEntrada ?? item.data ?? item.data_cadastro ?? item.dataCadastro ?? item.created_at).slice(0, 10);
const dataFimItem = (item: any) => texto(item.data_finalizacao ?? item.dataFinalizacao ?? item.data_conclusao ?? item.dataConclusao ?? item.updated_at).slice(0, 10);
const responsavelItem = (item: any) => texto(item.operador ?? item.responsavel ?? item.responsavel_nome ?? item.usuario) || "Não informado";
const referenciaItem = (item: any) => texto(item.pedido ?? item.cliente ?? item.nota_fiscal ?? item.id) || "—";
const STATUS_FINAIS = ["finalizado", "finalizada", "resolvido", "resolvida", "concluido", "concluida", "cancelado", "cancelada", "enviado", "reenviado", "estornado", "estoque"];
const finalizado = (status: unknown) => STATUS_FINAIS.some((item) => normalizar(status).includes(item));
const hoje = () => new Date().toISOString().slice(0, 10);

function formatarData(data: string) {
  if (!data) return "—";
  const [ano, mes, dia] = data.slice(0, 10).split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : data;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function criarEvento(item: any, area: string, processo?: string): Evento | null {
  const data = dataItem(item);
  if (!data) return null;
  const status = texto(item.status) || "Registrado";
  return {
    id: `${normalizar(area)}-${item.id}`,
    referencia: referenciaItem(item),
    data,
    dataFim: dataFimItem(item),
    area,
    processo: processo || texto(item.atividade ?? item.tipo) || area,
    responsavel: responsavelItem(item),
    status,
    quantidade: Math.max(1, numero(item.quantidade)),
    finalizado: finalizado(status),
    marketplace: texto(item.marketplace),
    transportadora: texto(item.transportadora),
    motivo: texto(item.motivo ?? item.descricao ?? item.divergencia),
    naoEntregue: normalizar(status) === "nao entregue" || Boolean(item.data_informada_entrega),
    valorFrete: numero(item.valor_frete ?? item.valorFrete),
    valorEstorno: numero(item.valor_estorno ?? item.valorEstorno)
  };
}

function diasUteis(inicio: string, fim: string) {
  if (!inicio || !fim || fim <= inicio) return 0;
  const atual = new Date(`${inicio}T12:00:00`);
  const limite = new Date(`${fim}T12:00:00`);
  let dias = 0;
  while (atual < limite) {
    atual.setDate(atual.getDate() + 1);
    if (atual.getDay() !== 0 && atual.getDay() !== 6) dias += 1;
  }
  return dias;
}

function prazoEvento(evento: Evento, regras: any[]) {
  const processo = normalizar(evento.processo);
  const area = normalizar(evento.area);
  const regra = regras
    .filter((item) => texto(item.processo) && numero(item.prazo) > 0 && normalizar(item.status) !== "inativo")
    .map((item) => {
      const nome = normalizar(item.processo);
      const pontos = nome === processo ? 100 : nome.includes(processo) || processo.includes(nome) ? 70 : nome.includes(area) || area.includes(nome) ? 50 : 0;
      return { item, pontos };
    })
    .sort((a, b) => b.pontos - a.pontos)[0];
  if (!regra?.pontos) return { situacao: "Sem regra", prazo: 0, atraso: 0 };
  const prazo = numero(regra.item.prazo);
  const fimAvaliacao = evento.finalizado ? evento.dataFim || evento.data : hoje();
  const decorridos = diasUteis(evento.data, fimAvaliacao);
  if (evento.finalizado) return { situacao: decorridos <= prazo ? "Cumprido" : "Concluído fora", prazo, atraso: Math.max(0, decorridos - prazo) };
  if (decorridos > prazo) return { situacao: "Vencido", prazo, atraso: decorridos - prazo };
  if (prazo - decorridos <= 1) return { situacao: "Próximo", prazo, atraso: 0 };
  return { situacao: "Dentro", prazo, atraso: 0 };
}

export default function Dashboard() {
  const sistema = useSistema() as any;
  const {
    trocas = [], devolucoesLogistica = [], devolucaoMarketplace = [], prioridades = [],
    falhas = [], produtividade = [], slas = [], operadores = []
  } = sistema;

  const [aba, setAba] = useState<Aba>("geral");
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [filtroOperador, setFiltroOperador] = useState("Todos");
  const [filtroArea, setFiltroArea] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [busca, setBusca] = useState("");

  const eventos = useMemo(() => {
    const resultado: Evento[] = [];
    const tiposTroca = trocas.map((item: any) => normalizar(item.tipo));
    const temMarketplaceNovo = tiposTroca.some((tipo: string) => tipo === "marketplace");
    const temFalhasNovas = tiposTroca.some((tipo: string) => tipo.startsWith("falha"));

    trocas.forEach((item: any) => {
      const tipo = normalizar(item.tipo);
      const area = tipo === "marketplace" ? "Marketplace" : tipo.startsWith("falha") ? "Falhas" : "Troquecommerce";
      const evento = criarEvento(item, area, texto(item.atividade) || texto(item.tipo) || area);
      if (evento) resultado.push(evento);
    });
    if (!temMarketplaceNovo) devolucaoMarketplace.forEach((item: any) => { const evento = criarEvento(item, "Marketplace", "Marketplace"); if (evento) resultado.push(evento); });
    if (!temFalhasNovas) falhas.forEach((item: any) => { const evento = criarEvento(item, "Falhas", texto(item.tipo) || "Falhas"); if (evento) resultado.push(evento); });
    devolucoesLogistica.forEach((item: any) => { const evento = criarEvento(item, "Devolução logística", "Devolução logística"); if (evento) resultado.push(evento); });
    prioridades.forEach((item: any) => { const evento = criarEvento(item, "Pedidos prioritários", "Pedidos prioritários"); if (evento) resultado.push(evento); });
    return resultado.sort((a, b) => b.data.localeCompare(a.data));
  }, [trocas, devolucoesLogistica, devolucaoMarketplace, prioridades, falhas]);

  const intervalo = useMemo(() => {
    const fim = new Date();
    const inicio = new Date();
    if (periodo === "hoje") inicio.setHours(0, 0, 0, 0);
    if (periodo === "semana") inicio.setDate(inicio.getDate() - 6);
    if (periodo === "mes") inicio.setDate(1);
    return {
      inicio: periodo === "personalizado" ? dataInicial : inicio.toISOString().slice(0, 10),
      fim: periodo === "personalizado" ? dataFinal : fim.toISOString().slice(0, 10)
    };
  }, [periodo, dataInicial, dataFinal]);

  const areas = useMemo(() => [...new Set(eventos.map((item) => item.area))].sort(), [eventos]);
  const responsaveis = useMemo(() => [...new Set([...operadores.map((item: any) => texto(item.nome)), ...eventos.map((item) => item.responsavel)].filter(Boolean))].sort(), [operadores, eventos]);
  const statusDisponiveis = useMemo(() => [...new Set(eventos.map((item) => item.status))].sort(), [eventos]);

  const eventosFiltrados = useMemo(() => eventos.filter((item) => {
    if (intervalo.inicio && item.data < intervalo.inicio) return false;
    if (intervalo.fim && item.data > intervalo.fim) return false;
    if (filtroOperador !== "Todos" && item.responsavel !== filtroOperador) return false;
    if (filtroArea !== "Todas" && item.area !== filtroArea) return false;
    if (filtroStatus !== "Todos" && item.status !== filtroStatus) return false;
    if (busca && !normalizar(`${item.referencia} ${item.processo} ${item.responsavel} ${item.motivo}`).includes(normalizar(busca))) return false;
    return true;
  }), [eventos, intervalo, filtroOperador, filtroArea, filtroStatus, busca]);

  const producao = useMemo(() => {
    const automaticos = eventosFiltrados.filter((item) => item.area === "Troquecommerce");
    const manuais = produtividade.map((item: any) => criarEvento(item, "Atividades externas", texto(item.atividade) || "Atividade externa")).filter((item: Evento | null): item is Evento => Boolean(item)).filter((item: Evento) => {
      if (intervalo.inicio && item.data < intervalo.inicio) return false;
      if (intervalo.fim && item.data > intervalo.fim) return false;
      if (filtroOperador !== "Todos" && item.responsavel !== filtroOperador) return false;
      if (filtroArea !== "Todas" && filtroArea !== "Atividades externas") return false;
      if (filtroStatus !== "Todos" && item.status !== filtroStatus) return false;
      if (busca && !normalizar(`${item.referencia} ${item.processo} ${item.responsavel} ${item.motivo}`).includes(normalizar(busca))) return false;
      return true;
    });
    return [...automaticos, ...manuais];
  }, [eventosFiltrados, produtividade, intervalo, filtroOperador, filtroArea, filtroStatus, busca]);

  const avaliacaoSLA = useMemo(() => eventosFiltrados.map((item) => ({ evento: item, ...prazoEvento(item, slas) })), [eventosFiltrados, slas]);
  const totalProduzido = producao.reduce((soma, item) => soma + item.quantidade, 0);
  const backlog = eventosFiltrados.filter((item) => !item.finalizado).length;
  const falhasAbertas = eventosFiltrados.filter((item) => item.area === "Falhas" && !item.finalizado).length;
  const prioridadesAbertas = eventosFiltrados.filter((item) => item.area === "Pedidos prioritários" && !item.finalizado).length;
  const operadoresAtivos = new Set(producao.map((item) => item.responsavel).filter((item) => item !== "Não informado")).size;
  const avaliadosConcluidos = avaliacaoSLA.filter((item) => ["Cumprido", "Concluído fora"].includes(item.situacao));
  const cumprimentoSLA = avaliadosConcluidos.length ? Math.round(avaliadosConcluidos.filter((item) => item.situacao === "Cumprido").length / avaliadosConcluidos.length * 100) : 0;

  const porArea = useMemo(() => areas.map((area) => {
    const lista = eventosFiltrados.filter((item) => item.area === area);
    const pendentes = lista.filter((item) => !item.finalizado).length;
    const taxa = lista.length ? Math.round((lista.length - pendentes) / lista.length * 100) : 0;
    return { nome: area, total: lista.length, pendentes, finalizados: lista.length - pendentes, taxa };
  }).filter((item) => item.total > 0), [areas, eventosFiltrados]);

  const evolucaoProducao = useMemo(() => agrupar(producao, (item) => item.data, (item) => item.quantidade).slice(-14), [producao]);
  const producaoOperador = useMemo(() => agrupar(producao, (item) => item.responsavel, (item) => item.quantidade).sort((a, b) => b.valor - a.valor), [producao]);
  const producaoAtividade = useMemo(() => agrupar(producao, (item) => item.processo, (item) => item.quantidade).sort((a, b) => b.valor - a.valor), [producao]);
  const backlogArea = porArea.map((item) => ({ nome: item.nome, valor: item.pendentes })).sort((a, b) => b.valor - a.valor);

  const slaSituacoes = useMemo(() => agrupar(avaliacaoSLA, (item) => item.situacao, () => 1), [avaliacaoSLA]);
  const slaArea = useMemo(() => areas.map((area) => {
    const lista = avaliacaoSLA.filter((item) => item.evento.area === area && item.situacao !== "Sem regra");
    const dentro = lista.filter((item) => ["Dentro", "Cumprido"].includes(item.situacao)).length;
    return { nome: area, valor: lista.length ? Math.round(dentro / lista.length * 100) : 0 };
  }).filter((item) => item.valor > 0), [areas, avaliacaoSLA]);

  const falhasFiltradas = eventosFiltrados.filter((item) => item.area === "Falhas");
  const falhasTipo = agrupar(falhasFiltradas, (item) => item.processo, () => 1).sort((a, b) => b.valor - a.valor);
  const falhasMotivo = agrupar(falhasFiltradas, (item) => item.motivo || "Não informado", () => 1).sort((a, b) => b.valor - a.valor);
  const falhasTransportadora = agrupar(falhasFiltradas.filter((item) => item.transportadora), (item) => item.transportadora, () => 1).sort((a, b) => b.valor - a.valor);

  const devolucoes = eventosFiltrados.filter((item) => item.area === "Devolução logística");
  const resultados = ["Reenviado", "Estornado", "Cancelado"].map((nome) => ({ nome, valor: devolucoes.filter((item) => normalizar(`${item.status} ${item.processo}` ).includes(normalizar(nome).replace("reenviado", "reenv"))).length }));
  const totalFrete = devolucoes.reduce((soma, item) => soma + item.valorFrete, 0);
  const totalEstorno = devolucoes.reduce((soma, item) => soma + item.valorEstorno, 0);

  const alertas = useMemo(() => {
    const lista: Array<{ urgencia: string; area: string; referencia: string; motivo: string; responsavel: string; prazo: string }> = [];
    avaliacaoSLA.filter((item) => item.situacao === "Vencido").forEach((item) => lista.push({ urgencia: "Crítico", area: item.evento.area, referencia: item.evento.referencia, motivo: "SLA vencido", responsavel: item.evento.responsavel, prazo: `${item.atraso} dia(s) útil(eis)` }));
    avaliacaoSLA.filter((item) => item.situacao === "Próximo").forEach((item) => lista.push({ urgencia: "Atenção", area: item.evento.area, referencia: item.evento.referencia, motivo: "Próximo do vencimento", responsavel: item.evento.responsavel, prazo: "Até 1 dia útil" }));
    eventosFiltrados.filter((item) => !item.finalizado && item.responsavel === "Não informado").forEach((item) => lista.push({ urgencia: "Atenção", area: item.area, referencia: item.referencia, motivo: "Sem responsável", responsavel: "—", prazo: "Definir responsável" }));
    return lista.sort((a, b) => a.urgencia === "Crítico" && b.urgencia !== "Crítico" ? -1 : 1).slice(0, 20);
  }, [avaliacaoSLA, eventosFiltrados]);

  const exportacao = eventosFiltrados.map((item) => ({ ...item, dataFormatada: formatarData(item.data) }));
  const colunasExportacao = [
    { campo: "dataFormatada", titulo: "Data" }, { campo: "area", titulo: "Área" },
    { campo: "referencia", titulo: "Referência" }, { campo: "processo", titulo: "Processo" },
    { campo: "responsavel", titulo: "Responsável" }, { campo: "status", titulo: "Status" }
  ];

  const limparFiltros = () => { setPeriodo("mes"); setDataInicial(""); setDataFinal(""); setFiltroOperador("Todos"); setFiltroArea("Todas"); setFiltroStatus("Todos"); setBusca(""); };

  return (
    <main className="p-6" style={{ minHeight: "100vh", background: "#faf9ff" }}>
      <style>{`.dash-duplo{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.dash-triplo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:950px){.dash-duplo,.dash-triplo{grid-template-columns:1fr!important}}`}</style>
      <header className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 shadow-sm" style={headerStyle}>
        <div><div style={tagHeaderStyle}>CENTRAL DE COMANDO</div><h1 className="text-2xl font-bold text-white" style={{ margin: "4px 0 0" }}>Dashboard Operacional</h1><p className="text-purple-200 text-sm mt-1" style={{ marginBottom: 0 }}>Visão consolidada da logística, produtividade, qualidade e prazos</p></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><span style={atualizacaoStyle}>Atualizado em {new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span><ExportarExcel dados={exportacao} nomeArquivo="dashboard_operacional" nomeAba="Operação" titulo="Exportar Excel" colunas={colunasExportacao} /></div>
      </header>

      <section style={{ ...cardStyle, marginBottom: 18 }}><div style={secaoHeaderStyle}><div><h2 style={tituloStyle}>Filtros globais</h2><p style={subtituloStyle}>Todos os indicadores e análises respondem a estes filtros</p></div><button type="button" onClick={limparFiltros} style={botaoSecundarioStyle}>Limpar filtros</button></div><div style={filtrosStyle}>
        <Campo titulo="Período"><select style={inputStyle} value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option value="hoje">Hoje</option><option value="semana">Últimos 7 dias</option><option value="mes">Este mês</option><option value="personalizado">Personalizado</option></select></Campo>
        {periodo === "personalizado" && <><Campo titulo="Data inicial"><input type="date" style={inputStyle} value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} /></Campo><Campo titulo="Data final"><input type="date" style={inputStyle} value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} /></Campo></>}
        <Campo titulo="Operador / Responsável"><select style={inputStyle} value={filtroOperador} onChange={(e) => setFiltroOperador(e.target.value)}><option>Todos</option>{responsaveis.map((item) => <option key={item}>{item}</option>)}</select></Campo>
        <Campo titulo="Área"><select style={inputStyle} value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}><option>Todas</option>{areas.map((item) => <option key={item}>{item}</option>)}</select></Campo>
        <Campo titulo="Status"><select style={inputStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}><option>Todos</option>{statusDisponiveis.map((item) => <option key={item}>{item}</option>)}</select></Campo>
        <Campo titulo="Buscar"><input style={inputStyle} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pedido, processo ou responsável" /></Campo>
      </div></section>

      <section style={kpiGridStyle}><Kpi titulo="Produção total" valor={totalProduzido} detalhe={`${producao.length} lançamentos`} cor="#7c3aed" /><Kpi titulo="Backlog operacional" valor={backlog} detalhe="casos não finalizados" cor="#f59e0b" /><Kpi titulo="Cumprimento do SLA" valor={`${cumprimentoSLA}%`} detalhe="casos concluídos avaliados" cor="#2563eb" /><Kpi titulo="Prioridades abertas" valor={prioridadesAbertas} detalhe="pendentes ou em andamento" cor="#dc2626" /><Kpi titulo="Falhas abertas" valor={falhasAbertas} detalhe="ainda não resolvidas" cor="#be123c" /><Kpi titulo="Operadores ativos" valor={operadoresAtivos} detalhe="com produção no período" cor="#16a34a" /></section>

      <nav style={abasStyle}>{ABAS.map((item) => <button key={item.id} type="button" onClick={() => setAba(item.id)} style={botaoAbaStyle(aba === item.id)}><span>{item.icone}</span>{item.nome}</button>)}</nav>

      {aba === "geral" && <VisaoGeral porArea={porArea} backlogArea={backlogArea} evolucao={evolucaoProducao} producaoArea={agrupar(producao, (item) => item.area, (item) => item.quantidade)} alertas={alertas} />}
      {aba === "produtividade" && <VisaoProdutividade total={totalProduzido} ativos={operadoresAtivos} producao={producao} operadores={producaoOperador} atividades={producaoAtividade} evolucao={evolucaoProducao} />}
      {aba === "sla" && <VisaoSLA situacoes={slaSituacoes} areas={slaArea} avaliacao={avaliacaoSLA} cumprimento={cumprimentoSLA} />}
      {aba === "qualidade" && <VisaoQualidade falhas={falhasFiltradas} tipos={falhasTipo} motivos={falhasMotivo} transportadoras={falhasTransportadora} totalProduzido={totalProduzido} />}
      {aba === "resultados" && <VisaoResultados devolucoes={devolucoes} resultados={resultados} totalFrete={totalFrete} totalEstorno={totalEstorno} />}
    </main>
  );
}

function agrupar<T>(lista: T[], chave: (item: T) => string, valor: (item: T) => number) {
  const mapa = new Map<string, number>();
  lista.forEach((item) => { const nome = chave(item) || "Não informado"; mapa.set(nome, (mapa.get(nome) ?? 0) + valor(item)); });
  return [...mapa.entries()].map(([nome, total]) => ({ nome, valor: total }));
}

function VisaoGeral({ porArea, backlogArea, evolucao, producaoArea, alertas }: any) {
  return <div style={{ display: "grid", gap: 18 }}><section className="dash-duplo" style={duploStyle}><Painel titulo="Saúde operacional" subtitulo="Volume, backlog e finalização por área"><div style={{ overflowX: "auto", marginTop: 14 }}><table style={tableStyle}><thead><tr style={headStyle}>{["Área","Total","Pendentes","Finalizados","Saúde"].map((item) => <th key={item} style={cellStyle}>{item}</th>)}</tr></thead><tbody>{porArea.map((item: any) => <tr key={item.nome} style={rowStyle}><td style={{ ...cellStyle, fontWeight: 750, color: "#4c1d95" }}>{item.nome}</td><td style={cellStyle}>{item.total}</td><td style={cellStyle}>{item.pendentes}</td><td style={cellStyle}>{item.finalizados}</td><td style={cellStyle}><Saude taxa={item.taxa} /></td></tr>)}</tbody></table></div></Painel><Painel titulo="Backlog por área" subtitulo="Casos não finalizados"><Barras dados={backlogArea} cor="#f59e0b" /></Painel></section><section className="dash-duplo" style={duploStyle}><Painel titulo="Evolução diária da produção" subtitulo="Últimos 14 dias do período"><Linha dados={evolucao} /></Painel><Painel titulo="Produção por área" subtitulo="Participação de cada origem"><Rosca dados={producaoArea} /></Painel></section><Painel titulo="Casos que exigem ação" subtitulo="SLA vencido, próximo do limite ou sem responsável"><TabelaAlertas dados={alertas} /></Painel></div>;
}

function VisaoProdutividade({ total, ativos, producao, operadores, atividades, evolucao }: any) {
  const finalizados = producao.filter((item: Evento) => item.finalizado).length;
  const taxa = producao.length ? Math.round(finalizados / producao.length * 100) : 0;
  return <div style={{ display: "grid", gap: 18 }}><section style={miniKpiGridStyle}><MiniKpi titulo="Produção total" valor={total} /><MiniKpi titulo="Média por operador" valor={ativos ? Math.round(total / ativos) : 0} /><MiniKpi titulo="Operadores ativos" valor={ativos} /><MiniKpi titulo="Taxa de finalização" valor={`${taxa}%`} /></section><section className="dash-duplo" style={duploStyle}><Painel titulo="Ranking por operador" subtitulo="Quantidade produzida"><Ranking dados={operadores} /></Painel><Painel titulo="Produção por atividade" subtitulo="Atividades com maior volume"><Barras dados={atividades} cor="#7c3aed" /></Painel></section><Painel titulo="Evolução da produção" subtitulo="Comportamento diário no período"><Linha dados={evolucao} /></Painel></div>;
}

function VisaoSLA({ situacoes, areas, avaliacao, cumprimento }: any) {
  const vencidos = avaliacao.filter((item: any) => item.situacao === "Vencido").length;
  const proximos = avaliacao.filter((item: any) => item.situacao === "Próximo").length;
  const semRegra = avaliacao.filter((item: any) => item.situacao === "Sem regra").length;
  const criticos = avaliacao.filter((item: any) => item.situacao === "Vencido").sort((a: any, b: any) => b.atraso - a.atraso).slice(0, 8);
  return <div style={{ display: "grid", gap: 18 }}><section style={miniKpiGridStyle}><MiniKpi titulo="Cumprimento" valor={`${cumprimento}%`} /><MiniKpi titulo="Vencidos" valor={vencidos} /><MiniKpi titulo="Próximos do limite" valor={proximos} /><MiniKpi titulo="Sem regra" valor={semRegra} /></section><section className="dash-duplo" style={duploStyle}><Painel titulo="Situação geral" subtitulo="Distribuição dos casos monitorados"><Rosca dados={situacoes} /></Painel><Painel titulo="Cumprimento por área" subtitulo="Percentual dentro do prazo"><BarrasPercentuais dados={areas} /></Painel></section><Painel titulo="Casos mais críticos" subtitulo="Maiores atrasos em dias úteis"><div style={{ overflowX: "auto", marginTop: 14 }}><table style={tableStyle}><thead><tr style={headStyle}>{["Referência","Área","Processo","Responsável","Atraso"].map((item) => <th key={item} style={cellStyle}>{item}</th>)}</tr></thead><tbody>{criticos.map((item: any) => <tr key={item.evento.id} style={rowStyle}><td style={cellStyle}>{item.evento.referencia}</td><td style={cellStyle}>{item.evento.area}</td><td style={cellStyle}>{item.evento.processo}</td><td style={cellStyle}>{item.evento.responsavel}</td><td style={{ ...cellStyle, color: "#dc2626", fontWeight: 800 }}>{item.atraso} dia(s)</td></tr>)}</tbody></table></div></Painel></div>;
}

function VisaoQualidade({ falhas, tipos, motivos, transportadoras, totalProduzido }: any) {
  const abertas = falhas.filter((item: Evento) => !item.finalizado).length;
  const resolvidas = falhas.length - abertas;
  const taxaResolucao = falhas.length ? Math.round(resolvidas / falhas.length * 100) : 0;
  const taxaFalhas = totalProduzido ? (falhas.length / totalProduzido * 100).toFixed(1) : "0.0";
  return <div style={{ display: "grid", gap: 18 }}><section style={miniKpiGridStyle}><MiniKpi titulo="Total de falhas" valor={falhas.length} /><MiniKpi titulo="Falhas abertas" valor={abertas} /><MiniKpi titulo="Taxa de resolução" valor={`${taxaResolucao}%`} /><MiniKpi titulo="Falhas ÷ produção" valor={`${taxaFalhas}%`} /></section><section className="dash-triplo" style={triploStyle}><Painel titulo="Falhas por tipo" subtitulo="Peça, entrega e outras"><Rosca dados={tipos} /></Painel><Painel titulo="Principais motivos" subtitulo="Causas mais recorrentes"><Ranking dados={motivos} /></Painel><Painel titulo="Transportadoras" subtitulo="Ocorrências de entrega"><Barras dados={transportadoras} cor="#dc2626" /></Painel></section></div>;
}

function VisaoResultados({ devolucoes, resultados, totalFrete, totalEstorno }: any) {
  const reenviados = resultados.find((item: any) => item.nome === "Reenviado")?.valor ?? 0;
  const estornados = resultados.find((item: any) => item.nome === "Estornado")?.valor ?? 0;
  const naoEntregues = devolucoes.filter((item: Evento) => item.naoEntregue).length;
  return <div style={{ display: "grid", gap: 18 }}><section style={miniKpiGridStyle}><MiniKpi titulo="Total de devoluções" valor={devolucoes.length} /><MiniKpi titulo="Não entregues" valor={naoEntregues} /><MiniKpi titulo="Reenviados" valor={reenviados} /><MiniKpi titulo="Estornados" valor={estornados} /><MiniKpi titulo="Custo médio do reenvio" valor={moeda(reenviados ? totalFrete / reenviados : 0)} /></section><section className="dash-duplo" style={duploStyle}><Painel titulo="Resultado final" subtitulo="Reenviado, estornado e cancelado"><CardsResultado dados={resultados} total={devolucoes.length} /></Painel><Painel titulo="Comparação financeira" subtitulo="Fretes de reenvio e valores estornados"><Financeiro frete={totalFrete} estorno={totalEstorno} /></Painel></section></div>;
}

function Campo({ titulo, children }: { titulo: string; children: ReactNode }) { return <label style={campoStyle}><span style={labelStyle}>{titulo}</span>{children}</label>; }
function Painel({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) { return <section style={cardStyle}><h2 style={tituloStyle}>{titulo}</h2><p style={subtituloStyle}>{subtitulo}</p>{children}</section>; }
function Kpi({ titulo, valor, detalhe, cor }: { titulo: string; valor: string | number; detalhe: string; cor: string }) { return <article style={{ ...kpiStyle, borderLeftColor: cor }}><span style={kpiTituloStyle}>{titulo}</span><strong style={{ color: cor, fontSize: 29, lineHeight: 1.15, marginTop: 5 }}>{valor}</strong><span style={kpiDetalheStyle}>{detalhe}</span></article>; }
function MiniKpi({ titulo, valor }: { titulo: string; valor: string | number }) { return <article style={miniKpiStyle}><span style={kpiTituloStyle}>{titulo}</span><strong style={{ color: "#6d28d9", fontSize: 25, marginTop: 4 }}>{valor}</strong></article>; }

function Barras({ dados, cor }: { dados: Array<{ nome: string; valor: number }>; cor: string }) { const maior = Math.max(1, ...dados.map((item) => item.valor)); return <div style={{ display: "grid", gap: 12, marginTop: 17 }}>{dados.slice(0, 9).map((item) => <div key={item.nome}><div style={barraHeaderStyle}><span>{item.nome}</span><strong>{item.valor}</strong></div><div style={trilhoStyle}><div style={{ ...barraStyle, width: `${item.valor / maior * 100}%`, background: cor }} /></div></div>)}{!dados.length && <Vazio />}</div>; }
function BarrasPercentuais({ dados }: { dados: Array<{ nome: string; valor: number }> }) { return <div style={{ display: "grid", gap: 12, marginTop: 17 }}>{dados.map((item) => <div key={item.nome}><div style={barraHeaderStyle}><span>{item.nome}</span><strong>{item.valor}%</strong></div><div style={trilhoStyle}><div style={{ ...barraStyle, width: `${item.valor}%`, background: item.valor >= 90 ? "#16a34a" : item.valor >= 70 ? "#f59e0b" : "#dc2626" }} /></div></div>)}{!dados.length && <Vazio />}</div>; }
function Linha({ dados }: { dados: Array<{ nome: string; valor: number }> }) { if (!dados.length) return <Vazio />; const largura = 720, base = 155, topo = 20, maior = Math.max(1, ...dados.map((item) => item.valor)), passo = dados.length > 1 ? 670 / (dados.length - 1) : 0; const pontos = dados.map((item, i) => ({ ...item, x: 30 + i * passo, y: base - item.valor / maior * (base - topo) })); return <div style={{ overflowX: "auto", marginTop: 12 }}><svg viewBox={`0 0 ${largura} 195`} style={{ width: "100%", minWidth: 600, height: 205 }}><polyline fill="none" stroke="#7c3aed" strokeWidth="3" points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} />{pontos.map((p, i) => <g key={p.nome}><circle cx={p.x} cy={p.y} r="4" fill="#7c3aed" /><text x={p.x} y={p.y - 9} textAnchor="middle" fill="#4c1d95" fontSize="10" fontWeight="700">{p.valor}</text>{(i % Math.ceil(dados.length / 7) === 0 || i === dados.length - 1) && <text x={p.x} y={base + 22} textAnchor="middle" fill="#6b7280" fontSize="9">{formatarData(p.nome).slice(0,5)}</text>}</g>)}</svg></div>; }
function Rosca({ dados }: { dados: Array<{ nome: string; valor: number }> }) { const cores = ["#7c3aed", "#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#0891b2"]; const total = dados.reduce((s, i) => s + i.valor, 0); let acumulado = 0; const partes = total ? dados.map((item, i) => { const inicio = acumulado; acumulado += item.valor / total * 100; return `${cores[i % cores.length]} ${inicio}% ${acumulado}%`; }) : ["#e5e7eb 0% 100%"] ; return <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", marginTop: 17 }}><div style={{ width: 145, height: 145, borderRadius: "50%", background: `conic-gradient(${partes.join(",")})`, display: "grid", placeItems: "center" }}><div style={{ width: 83, height: 83, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", color: "#4c1d95", fontWeight: 850, fontSize: 21 }}>{total}</div></div><div style={{ display: "grid", gap: 8, flex: 1, minWidth: 180 }}>{dados.map((item, i) => <div key={item.nome} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}><span><i style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: cores[i % cores.length], marginRight: 7 }} />{item.nome}</span><strong>{item.valor}</strong></div>)}</div></div>; }
function Ranking({ dados }: { dados: Array<{ nome: string; valor: number }> }) { return <div style={{ display: "grid", gap: 8, marginTop: 15 }}>{dados.slice(0, 8).map((item, i) => <div key={item.nome} style={rankingStyle}><span style={posicaoStyle}>{i + 1}</span><span style={{ flex: 1, color: "#4c1d95", fontSize: 12, fontWeight: 700 }}>{item.nome}</span><strong style={{ color: "#7c3aed" }}>{item.valor}</strong></div>)}{!dados.length && <Vazio />}</div>; }
function Saude({ taxa }: { taxa: number }) { const textoSaude = taxa >= 85 ? "Saudável" : taxa >= 65 ? "Atenção" : "Crítico"; const cor = taxa >= 85 ? { bg: "#dcfce7", tx: "#166534" } : taxa >= 65 ? { bg: "#fef3c7", tx: "#92400e" } : { bg: "#fee2e2", tx: "#b91c1c" }; return <span style={{ padding: "5px 8px", borderRadius: 999, background: cor.bg, color: cor.tx, fontSize: 10, fontWeight: 800 }}>{textoSaude}</span>; }
function TabelaAlertas({ dados }: { dados: any[] }) { return <div style={{ overflowX: "auto", marginTop: 14 }}><table style={{ ...tableStyle, minWidth: 850 }}><thead><tr style={headStyle}>{["Urgência","Área","Referência","Motivo","Responsável","Prazo"].map((item) => <th key={item} style={cellStyle}>{item}</th>)}</tr></thead><tbody>{dados.map((item, i) => <tr key={`${item.area}-${item.referencia}-${i}`} style={rowStyle}><td style={cellStyle}><span style={{ color: item.urgencia === "Crítico" ? "#dc2626" : "#b45309", fontWeight: 800 }}>{item.urgencia}</span></td><td style={cellStyle}>{item.area}</td><td style={{ ...cellStyle, color: "#4c1d95", fontWeight: 750 }}>{item.referencia}</td><td style={cellStyle}>{item.motivo}</td><td style={cellStyle}>{item.responsavel}</td><td style={cellStyle}>{item.prazo}</td></tr>)}{!dados.length && <tr><td colSpan={6}><Vazio /></td></tr>}</tbody></table></div>; }
function CardsResultado({ dados, total }: { dados: Array<{ nome: string; valor: number }>; total: number }) { const cores: any = { Reenviado: "#2563eb", Estornado: "#16a34a", Cancelado: "#dc2626" }; return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginTop: 17 }}>{dados.map((item) => <div key={item.nome} style={{ padding: 16, borderRadius: 12, background: "#faf9ff", border: "1px solid #ede9fe", textAlign: "center" }}><strong style={{ display: "block", color: cores[item.nome], fontSize: 29 }}>{item.valor}</strong><span style={{ display: "block", color: "#4c1d95", fontSize: 12, fontWeight: 750 }}>{item.nome}</span><span style={{ color: "#8b7c98", fontSize: 10 }}>{total ? Math.round(item.valor / total * 100) : 0}% do total</span></div>)}</div>; }
function Financeiro({ frete, estorno }: { frete: number; estorno: number }) { const maior = Math.max(1, frete, estorno); return <div style={{ display: "grid", gap: 18, marginTop: 22 }}>{[{ nome: "Fretes de reenvio", valor: frete, cor: "#2563eb" },{ nome: "Valores estornados", valor: estorno, cor: "#16a34a" }].map((item) => <div key={item.nome}><div style={barraHeaderStyle}><span>{item.nome}</span><strong style={{ color: item.cor }}>{moeda(item.valor)}</strong></div><div style={{ ...trilhoStyle, height: 12 }}><div style={{ ...barraStyle, width: `${item.valor / maior * 100}%`, background: item.cor }} /></div></div>)}</div>; }
function Vazio() { return <div style={{ padding: 22, textAlign: "center", color: "#8b7c98", fontSize: 12 }}>Nenhum dado encontrado.</div>; }

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" } as const;
const tagHeaderStyle = { color: "#ddd6fe", fontSize: 10, fontWeight: 850, letterSpacing: ".14em" } as const;
const atualizacaoStyle = { color: "#ede9fe", fontSize: 11, padding: "8px 11px", border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, background: "rgba(255,255,255,.07)" } as const;
const cardStyle = { background: "#fff", border: "1px solid #ede9fe", borderRadius: 14, padding: 20, boxShadow: "0 3px 12px rgba(76,29,149,.07)", minWidth: 0 } as const;
const secaoHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } as const;
const tituloStyle = { margin: 0, color: "#4c1d95", fontSize: 18, fontWeight: 800 } as const;
const subtituloStyle = { margin: "4px 0 0", color: "#7c7189", fontSize: 12 } as const;
const filtrosStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: 12, marginTop: 15 } as const;
const campoStyle = { display: "flex", flexDirection: "column", gap: 6 } as const;
const labelStyle = { color: "#4c1d95", fontSize: 12, fontWeight: 750 } as const;
const inputStyle = { width: "100%", minHeight: 42, padding: "9px 11px", border: "1px solid #d8d2e8", borderRadius: 9, background: "#fff", color: "#1f2937", outlineColor: "#7c3aed" } as const;
const botaoSecundarioStyle = { padding: "9px 13px", borderRadius: 9, border: "1px solid #ddd6fe", background: "#fff", color: "#6d28d9", cursor: "pointer", fontWeight: 750 } as const;
const kpiGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 18 } as const;
const kpiStyle = { display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #ede9fe", borderLeft: "5px solid", borderRadius: 13, padding: "16px 17px", boxShadow: "0 3px 12px rgba(76,29,149,.06)" } as const;
const kpiTituloStyle = { color: "#6b7280", fontSize: 12, fontWeight: 650 } as const;
const kpiDetalheStyle = { color: "#9ca3af", fontSize: 10, marginTop: 4 } as const;
const miniKpiGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 13 } as const;
const miniKpiStyle = { display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #ede9fe", borderRadius: 12, padding: 16 } as const;
const abasStyle = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 } as const;
const botaoAbaStyle = (ativo: boolean) => ({ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 10, border: ativo ? "1px solid #6d28d9" : "1px solid #ddd6fe", background: ativo ? "#6d28d9" : "#fff", color: ativo ? "#fff" : "#5b21b6", cursor: "pointer", fontWeight: 750, fontSize: 12, boxShadow: ativo ? "0 5px 12px rgba(109,40,217,.18)" : "none" }) as const;
const duploStyle = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 18 } as const;
const triploStyle = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 } as const;
const tableStyle = { width: "100%", borderCollapse: "collapse" } as const;
const headStyle = { background: "#f5f3ff", color: "#5b21b6", textAlign: "left" } as const;
const rowStyle = { borderBottom: "1px solid #f0ebf8" } as const;
const cellStyle = { padding: 10, fontSize: 11, verticalAlign: "middle" } as const;
const barraHeaderStyle = { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, color: "#4c1d95", fontSize: 11 } as const;
const trilhoStyle = { height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" } as const;
const barraStyle = { height: "100%", minWidth: 3, borderRadius: 999 } as const;
const rankingStyle = { display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: "1px solid #ede9fe", borderRadius: 9, background: "#faf9ff" } as const;
const posicaoStyle = { width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: "#ede9fe", color: "#5b21b6", fontSize: 10, fontWeight: 850 } as const;
