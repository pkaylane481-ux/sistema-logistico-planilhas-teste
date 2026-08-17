import { useMemo, useState } from "react";
import { useSistema } from "../context/SistemaContext";
import ExportarExcel from "../components/ExportarExcel";
import { supabase } from "../services/supabase";

type RegistroProdutividade = {
  id: string;
  idOriginal: string | number;
  dataEntrada: string;
  operador: string;
  atividade: string;
  quantidade: number;
  origem: string;
  tipoRegistro: "Manual" | "Automático";
  status: string;
  sla?: string;
  observacao?: string;
  editavel: boolean;
};

const STATUS = ["Pendente", "Em andamento", "Finalizado"];
const hoje = () => new Date().toISOString().slice(0, 10);
const texto = (valor: unknown) => String(valor ?? "").trim();
const numero = (valor: unknown) => Math.max(0, Number(valor) || 0);
const dataRegistro = (item: any) => texto(item.dataEntrada || item.data_entrada || item.data || item.dataCadastro || item.data_cadastro || item.created_at).slice(0, 10);
const operadorRegistro = (item: any) => texto(item.operador || item.responsavel || item.usuario || item.criadoPor || item.criado_por) || "Não informado";
const areaManual = (item: any) => {
  const direta = texto(item.origem || item.area);
  if (direta) return direta;
  const encontrada = texto(item.observacao).match(/^\[Área: ([^\]]+)\]/);
  return encontrada?.[1] || "Atividade externa";
};

export default function Produtividade() {
  const sistema = useSistema() as any;
  const {
    produtividade = [], adicionarProdutividade, removerProdutividade,
    operadores = [], atividades = [], trocas = [], devolucoes = [],
    devolucoesLogistica = [], prioridades = [], falhas = []
  } = sistema;
  const atualizarProdutividade = sistema.atualizarProdutividade as ((id: string | number, dados: any) => Promise<unknown>) | undefined;
  const carregarDados = sistema.carregarDados as (() => Promise<unknown>) | undefined;

  const [aba, setAba] = useState("equipe");
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroOperador, setFiltroOperador] = useState("Todos");
  const [filtroOrigem, setFiltroOrigem] = useState("Todas");
  const [filtroAtividade, setFiltroAtividade] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [statusLocal, setStatusLocal] = useState<Record<string, string>>({});
  const [alterandoStatus, setAlterandoStatus] = useState<string | null>(null);

  const [data, setData] = useState(hoje);
  const [operador, setOperador] = useState("");
  const [atividade, setAtividade] = useState("");
  const [area, setArea] = useState("Atividade externa");
  const [quantidade, setQuantidade] = useState(1);
  const [sla, setSla] = useState("");
  const [status, setStatus] = useState("Finalizado");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const registros = useMemo<RegistroProdutividade[]>(() => {
    const manuais = produtividade.map((item: any) => ({
      id: `manual-${item.id}`, idOriginal: item.id,
      dataEntrada: dataRegistro(item), operador: operadorRegistro(item),
      atividade: texto(item.atividade) || "Atividade externa",
      quantidade: numero(item.quantidade) || 1,
      origem: areaManual(item),
      tipoRegistro: "Manual" as const,
      status: statusLocal[`manual-${item.id}`] || texto(item.status) || "Finalizado",
      sla: texto(item.sla), observacao: texto(item.observacao), editavel: true,
    }));

    const fonte = (lista: any[], origem: string, atividadePadrao: string) => lista.map((item: any) => ({
      id: `${origem}-${item.id}`, idOriginal: item.id,
      dataEntrada: dataRegistro(item), operador: operadorRegistro(item),
      atividade: texto(item.atividade || item.acao) || atividadePadrao,
      quantidade: numero(item.quantidade) || 1,
      origem, tipoRegistro: "Automático" as const,
      status: texto(item.status) || "Registrado",
      observacao: texto(item.observacao), editavel: false,
    }));

    const devolucoesUnificadas = devolucoesLogistica.length ? devolucoesLogistica : devolucoes;
    return [
      ...manuais,
      ...fonte(trocas, "Troquecommerce / Marketplace", "Registro operacional"),
      ...fonte(devolucoesUnificadas, "Devolução logística", "Tratativa de devolução"),
      ...fonte(prioridades, "Pedidos prioritários", "Tratativa prioritária"),
      ...fonte(falhas, "Falhas", "Tratativa de falha"),
    ];
  }, [produtividade, trocas, devolucoes, devolucoesLogistica, prioridades, falhas, statusLocal]);

  const limitesPeriodo = useMemo(() => {
    const fim = new Date();
    const inicio = new Date();
    if (periodo === "hoje") inicio.setHours(0, 0, 0, 0);
    if (periodo === "semana") inicio.setDate(inicio.getDate() - 6);
    if (periodo === "mes") inicio.setDate(1);
    return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
  }, [periodo]);

  const registrosFiltrados = useMemo(() => registros.filter((item) => {
    const inicio = periodo === "personalizado" ? dataInicio : limitesPeriodo.inicio;
    const fim = periodo === "personalizado" ? dataFim : limitesPeriodo.fim;
    if (inicio && item.dataEntrada && item.dataEntrada < inicio) return false;
    if (fim && item.dataEntrada && item.dataEntrada > fim) return false;
    if (filtroOperador !== "Todos" && item.operador !== filtroOperador) return false;
    if (filtroOrigem !== "Todas" && item.origem !== filtroOrigem) return false;
    if (filtroAtividade !== "Todas" && item.atividade !== filtroAtividade) return false;
    if (filtroTipo !== "Todos" && item.tipoRegistro !== filtroTipo) return false;
    return true;
  }), [registros, periodo, dataInicio, dataFim, limitesPeriodo, filtroOperador, filtroOrigem, filtroAtividade, filtroTipo]);

  const operadoresDisponiveis = useMemo(() => Array.from(new Set(registros.map((item) => item.operador))).sort(), [registros]);
  const origens = useMemo(() => Array.from(new Set(registros.map((item) => item.origem))).sort(), [registros]);
  const atividadesDisponiveis = useMemo(() => Array.from(new Set(registros.map((item) => item.atividade))).sort(), [registros]);
  const totalProduzido = registrosFiltrados.reduce((soma, item) => soma + item.quantidade, 0);
  const operadoresAtivos = new Set(registrosFiltrados.map((item) => item.operador).filter((nome) => nome !== "Não informado")).size;
  const finalizados = registrosFiltrados.filter((item) => ["Finalizado", "Finalizada", "Concluído", "Concluída", "Dentro do SLA"].includes(item.status)).reduce((soma, item) => soma + item.quantidade, 0);
  const pendentes = registrosFiltrados.filter((item) => ["Pendente", "Em andamento"].includes(item.status)).reduce((soma, item) => soma + item.quantidade, 0);
  const taxaFinalizacao = totalProduzido ? Math.round((finalizados / totalProduzido) * 100) : 0;

  const porOperador = useMemo(() => agrupar(registrosFiltrados, "operador"), [registrosFiltrados]);
  const porAtividade = useMemo(() => agrupar(registrosFiltrados, "atividade"), [registrosFiltrados]);
  const porOrigem = useMemo(() => agrupar(registrosFiltrados, "origem"), [registrosFiltrados]);
  const evolucao = useMemo(() => {
    const mapa = new Map<string, { total: number; operadores: Set<string> }>();
    registrosFiltrados.forEach((item) => {
      if (!item.dataEntrada) return;
      const atual = mapa.get(item.dataEntrada) || { total: 0, operadores: new Set<string>() };
      atual.total += item.quantidade;
      atual.operadores.add(item.operador);
      mapa.set(item.dataEntrada, atual);
    });
    return Array.from(mapa, ([data, valor]) => ({ data, total: valor.total, operadores: Array.from(valor.operadores).join(", ") })).sort((a, b) => a.data.localeCompare(b.data));
  }, [registrosFiltrados]);

  async function salvarRegistro() {
    if (!operador || !atividade || quantidade <= 0) {
      alert("Selecione operador e atividade e informe uma quantidade válida.");
      return;
    }
    try {
      setSalvando(true);
      const observacaoComArea = area === "Atividade externa" ? observacao : `[Área: ${area}] ${observacao}`.trim();
      await adicionarProdutividade({ dataEntrada: data || hoje(), operador, atividade, quantidade, sla, status, observacao: observacaoComArea });
      setData(hoje()); setOperador(""); setAtividade(""); setArea("Atividade externa");
      setQuantidade(1); setSla(""); setStatus("Finalizado"); setObservacao("");
    } catch (erro) {
      console.error("Erro ao registrar produtividade:", erro);
      alert("Não foi possível registrar a atividade.");
    } finally { setSalvando(false); }
  }

  async function alterarStatus(item: RegistroProdutividade, novoStatus: string) {
    if (!item.editavel) return;
    const anterior = item.status;
    setStatusLocal((atual) => ({ ...atual, [item.id]: novoStatus }));
    setAlterandoStatus(item.id);
    try {
      if (atualizarProdutividade) await atualizarProdutividade(item.idOriginal, { status: novoStatus });
      else {
        const { error } = await supabase.from("produtividade").update({ status: novoStatus }).eq("id", item.idOriginal);
        if (error) throw error;
      }
      if (carregarDados) await carregarDados();
    } catch (erro) {
      setStatusLocal((atual) => ({ ...atual, [item.id]: anterior }));
      console.error("Erro ao atualizar status:", erro);
      alert("Não foi possível atualizar o status.");
    } finally { setAlterandoStatus(null); }
  }

  const colunasExportacao = [
    { campo: "dataEntrada", titulo: "Data" }, { campo: "operador", titulo: "Operador" },
    { campo: "origem", titulo: "Área" }, { campo: "atividade", titulo: "Atividade" },
    { campo: "quantidade", titulo: "Quantidade" }, { campo: "tipoRegistro", titulo: "Origem do registro" },
    { campo: "status", titulo: "Status" }, { campo: "sla", titulo: "SLA" },
    { campo: "observacao", titulo: "Observação" },
  ];

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd6fe", borderRadius: 9, background: "#fff" };
  const cardStyle = { background: "#fff", border: "1px solid #ede9fe", borderRadius: 14, boxShadow: "0 3px 12px rgba(76,29,149,.08)", padding: 20 };
  const botaoPrincipal = { padding: "11px 17px", border: 0, borderRadius: 10, background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" } as const;
  const botaoAba = (ativa: boolean) => ({ padding: "10px 15px", borderRadius: 10, border: ativa ? "1px solid #7c3aed" : "1px solid #ddd6fe", background: ativa ? "#7c3aed" : "#fff", color: ativa ? "#fff" : "#5b21b6", fontWeight: 700, cursor: "pointer" } as const);

  return <div className="p-6" style={{ minHeight: "100vh", background: "#faf9ff" }}>
    <header className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
      <div><h1 className="text-2xl font-bold text-white">Produtividade Operacional</h1><p className="text-purple-200 text-sm mt-1">Desempenho completo da equipe e dos operadores</p></div>
      <ExportarExcel dados={registrosFiltrados} nomeArquivo="produtividade" nomeAba="Produtividade" titulo="Exportar Excel" colunas={colunasExportacao} />
    </header>

    <section style={{ ...cardStyle, marginBottom: 18 }}>
      <h2 style={tituloStyle}>Filtros</h2>
      <div style={gridFiltros}>
        <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Período</span><select style={inputStyle} value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option value="hoje">Hoje</option><option value="semana">Últimos 7 dias</option><option value="mes">Este mês</option><option value="personalizado">Personalizado</option></select></label>
        <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Operador</span><select style={inputStyle} value={filtroOperador} onChange={(e) => setFiltroOperador(e.target.value)}><option>Todos</option>{operadoresDisponiveis.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
        <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Origem / Área</span><select style={inputStyle} value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}><option>Todas</option>{origens.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
        <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Atividade</span><select style={inputStyle} value={filtroAtividade} onChange={(e) => setFiltroAtividade(e.target.value)}><option>Todas</option>{atividadesDisponiveis.map((nome) => <option key={nome}>{nome}</option>)}</select></label>
        <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Tipo de registro</span><select style={inputStyle} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}><option>Todos</option><option>Automático</option><option>Manual</option></select></label>
        {periodo === "personalizado" && <><label style={campoFiltroStyle}><span style={labelFiltroStyle}>Data inicial</span><input type="date" style={inputStyle} value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></label><label style={campoFiltroStyle}><span style={labelFiltroStyle}>Data final</span><input type="date" style={inputStyle} value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></label></>}
      </div>
    </section>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 18 }}>
      <Kpi titulo="Total produzido" valor={totalProduzido} detalhe={`${registrosFiltrados.length} registros`} cor="#7c3aed" />
      <Kpi titulo="Operadores ativos" valor={operadoresAtivos} detalhe="no período" cor="#2563eb" />
      <Kpi titulo="Média por operador" valor={operadoresAtivos ? Math.round(totalProduzido / operadoresAtivos) : 0} detalhe="atividades" cor="#0891b2" />
      <Kpi titulo="Finalizados" valor={`${taxaFinalizacao}%`} detalhe={`${finalizados} atividades`} cor="#16a34a" />
      <Kpi titulo="Pendentes" valor={pendentes} detalhe="pendente ou em andamento" cor="#f59e0b" />
    </div>

    <nav style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 18 }}>
      {[['equipe','Visão da equipe'],['individual','Por operador'],['atividade','Por atividade'],['registros','Registros']].map(([id, rotulo]) => <button key={id} type="button" style={botaoAba(aba === id)} onClick={() => setAba(id)}>{rotulo}</button>)}
    </nav>

    {aba === "equipe" && <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
        <section style={cardStyle}><h2 style={tituloStyle}>Evolução diária da produção</h2><GraficoLinha dados={evolucao} /></section>
        <section style={cardStyle}><h2 style={tituloStyle}>Produção por operador</h2><Barras dados={porOperador.slice(0, 8)} cor="#7c3aed" /></section>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
        <section style={cardStyle}><h2 style={tituloStyle}>Produção por área</h2><Rosca dados={porOrigem.slice(0, 6)} total={totalProduzido} /></section>
        <section style={cardStyle}><h2 style={tituloStyle}>Atividades mais executadas</h2><Barras dados={porAtividade.slice(0, 8)} cor="#6d28d9" /></section>
      </div>
    </div>}

    {aba === "individual" && <section style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}><h2 style={tituloStyle}>Desempenho individual</h2><select style={{ ...inputStyle, maxWidth: 230 }} value={filtroOperador} onChange={(e) => setFiltroOperador(e.target.value)}><option>Todos</option>{operadoresDisponiveis.map((nome) => <option key={nome}>{nome}</option>)}</select></div>
      {filtroOperador === "Todos" ? <p style={vazioStyle}>Selecione um operador para visualizar sua produtividade individual.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}><Barras dados={porAtividade.slice(0, 12)} cor="#7c3aed" /><GraficoLinha dados={evolucao} /></div>}
    </section>}

    {aba === "atividade" && <section style={cardStyle}><h2 style={tituloStyle}>Produção por atividade</h2><div style={{ overflowX: "auto" }}><table style={tableStyle}><thead><tr style={headStyle}><th style={cellStyle}>Atividade</th><th style={cellStyle}>Quantidade</th><th style={cellStyle}>Participação</th></tr></thead><tbody>{porAtividade.map((item) => <tr key={item.nome} style={rowStyle}><td style={cellStyle}>{item.nome}</td><td style={cellStyle}>{item.valor}</td><td style={cellStyle}>{totalProduzido ? Math.round(item.valor / totalProduzido * 100) : 0}%</td></tr>)}</tbody></table></div></section>}

    {aba === "registros" && <section style={cardStyle}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><h2 style={tituloStyle}>Registros detalhados</h2><span style={{ color: "#6b7280" }}>{registrosFiltrados.length} registro(s)</span></div><div style={{ overflowX: "auto" }}><table style={{ ...tableStyle, minWidth: 980 }}><thead><tr style={headStyle}>{["Data","Operador","Área","Atividade","Qtd.","Origem","Status","Ação"].map((item) => <th key={item} style={cellStyle}>{item}</th>)}</tr></thead><tbody>{registrosFiltrados.map((item) => <tr key={item.id} style={rowStyle}><td style={cellStyle}>{formatarData(item.dataEntrada)}</td><td style={cellStyle}>{item.operador}</td><td style={cellStyle}>{item.origem}</td><td style={cellStyle}>{item.atividade}</td><td style={cellStyle}>{item.quantidade}</td><td style={cellStyle}><Tag texto={item.tipoRegistro} /></td><td style={cellStyle}>{item.editavel ? <select aria-label={`Status de ${item.atividade}`} disabled={alterandoStatus === item.id} style={{ ...inputStyle, minWidth: 145, padding: "7px 9px" }} value={item.status} onChange={(e) => alterarStatus(item, e.target.value)}>{STATUS.map((opcao) => <option key={opcao}>{opcao}</option>)}</select> : <span>{item.status}</span>}</td><td style={cellStyle}>{item.editavel ? <button type="button" style={botaoExcluir} onClick={() => { if (confirm("Excluir este registro de produtividade?")) removerProdutividade(item.idOriginal); }}>Excluir</button> : <span style={{ color: "#9ca3af" }}>Automático</span>}</td></tr>)}{!registrosFiltrados.length && <tr><td colSpan={8} style={vazioStyle}>Nenhum registro encontrado.</td></tr>}</tbody></table></div></section>}

    <section style={{ ...cardStyle, marginTop: 18 }}>
      <h2 style={tituloStyle}>Registrar atividade realizada fora da plataforma</h2>
      <div style={gridFiltros}>
        <input aria-label="Data" type="date" style={inputStyle} value={data} onChange={(e) => setData(e.target.value)} />
        <select style={inputStyle} value={operador} onChange={(e) => setOperador(e.target.value)}><option value="">Selecione o operador</option>{operadores.map((item: any) => <option key={item.id ?? item.nome} value={item.nome}>{item.nome}</option>)}</select>
        <select style={inputStyle} value={atividade} onChange={(e) => setAtividade(e.target.value)}><option value="">Selecione a atividade</option>{atividades.map((item: any) => <option key={item.id ?? item.nome} value={item.nome}>{item.nome}</option>)}</select>
        <select style={inputStyle} value={area} onChange={(e) => setArea(e.target.value)}><option>Atividade externa</option><option>Troquecommerce</option><option>Marketplace</option><option>Devolução logística</option><option>Falhas</option><option>Pedidos prioritários</option></select>
        <input aria-label="Quantidade" type="number" min={1} style={inputStyle} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
        <input aria-label="SLA ou tempo gasto" placeholder="SLA ou tempo gasto" style={inputStyle} value={sla} onChange={(e) => setSla(e.target.value)} />
        <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((opcao) => <option key={opcao}>{opcao}</option>)}</select>
        <input aria-label="Observação" placeholder="Observação" style={inputStyle} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      </div>
      <button type="button" disabled={salvando} style={{ ...botaoPrincipal, marginTop: 14, opacity: salvando ? .65 : 1 }} onClick={salvarRegistro}>{salvando ? "Registrando..." : "Registrar atividade"}</button>
    </section>
  </div>;
}

function agrupar(registros: RegistroProdutividade[], campo: "operador" | "atividade" | "origem") {
  const mapa = new Map<string, number>();
  registros.forEach((item) => mapa.set(item[campo], (mapa.get(item[campo]) || 0) + item.quantidade));
  return Array.from(mapa, ([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

function Kpi({ titulo, valor, detalhe, cor }: { titulo: string; valor: string | number; detalhe: string; cor: string }) {
  return <div style={{ background: "#fff", padding: 17, borderRadius: 12, borderLeft: `5px solid ${cor}`, boxShadow: "0 3px 10px rgba(0,0,0,.07)" }}><div style={{ color: "#6b7280", fontSize: 13 }}>{titulo}</div><div style={{ color: cor, fontSize: 30, fontWeight: 800, margin: "4px 0" }}>{valor}</div><div style={{ color: "#9ca3af", fontSize: 12 }}>{detalhe}</div></div>;
}

function Barras({ dados, cor }: { dados: { nome: string; valor: number }[]; cor: string }) {
  const maximo = Math.max(...dados.map((item) => item.valor), 1);
  if (!dados.length) return <p style={vazioStyle}>Sem dados para o período selecionado.</p>;
  return <div style={{ display: "grid", gap: 12, marginTop: 18 }}>{dados.map((item) => <div key={item.nome} style={{ display: "grid", gridTemplateColumns: "minmax(105px,1fr) 3fr 44px", gap: 9, alignItems: "center" }}><span title={item.nome} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{item.nome}</span><div style={{ height: 12, background: "#ede9fe", borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${item.valor / maximo * 100}%`, height: "100%", background: cor, borderRadius: 999 }} /></div><strong style={{ textAlign: "right", fontSize: 13 }}>{item.valor}</strong></div>)}</div>;
}

function GraficoLinha({ dados }: { dados: { data: string; total: number; operadores: string }[] }) {
  if (!dados.length) return <p style={vazioStyle}>Sem dados para o período selecionado.</p>;
  const largura = 620, altura = 210, margem = 28;
  const maximo = Math.max(...dados.map((item) => item.total), 1);
  const pontos = dados.map((item, indice) => ({ ...item, x: dados.length === 1 ? largura / 2 : margem + indice * (largura - margem * 2) / (dados.length - 1), y: altura - margem - item.total / maximo * (altura - margem * 2) }));
  return <div style={{ overflowX: "auto", marginTop: 12 }}><svg viewBox={`0 0 ${largura} ${altura + 28}`} role="img" aria-label="Evolução diária da produção" style={{ width: "100%", minWidth: 520 }}><line x1={margem} y1={altura - margem} x2={largura - margem} y2={altura - margem} stroke="#ddd6fe" /><polyline points={pontos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinejoin="round" />{pontos.map((p) => <g key={p.data}><circle cx={p.x} cy={p.y} r="5" fill="#7c3aed"><title>{`${formatarData(p.data)}: ${p.total} — ${p.operadores}`}</title></circle><text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#4c1d95">{p.total}</text><text x={p.x} y={altura + 3} textAnchor="middle" fontSize="10" fill="#6b7280">{formatarData(p.data).slice(0, 5)}</text></g>)}</svg></div>;
}

function Rosca({ dados, total }: { dados: { nome: string; valor: number }[]; total: number }) {
  if (!dados.length || !total) return <p style={vazioStyle}>Sem dados para o período selecionado.</p>;
  const cores = ["#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#f59e0b", "#dc2626"];
  let acumulado = 0;
  const partes = dados.map((item, indice) => { const inicio = acumulado; acumulado += item.valor / total * 100; return `${cores[indice % cores.length]} ${inicio}% ${acumulado}%`; });
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", marginTop: 18 }}><div aria-label="Distribuição da produção por área" style={{ width: 145, height: 145, borderRadius: "50%", background: `conic-gradient(${partes.join(",")})`, display: "grid", placeItems: "center" }}><div style={{ width: 82, height: 82, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", fontWeight: 800, color: "#4c1d95" }}>{total}</div></div><div style={{ display: "grid", gap: 8, flex: 1 }}>{dados.map((item, indice) => <div key={item.nome} style={{ display: "flex", justifyContent: "space-between", gap: 15, fontSize: 13 }}><span><i style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: cores[indice % cores.length], marginRight: 7 }} />{item.nome}</span><strong>{Math.round(item.valor / total * 100)}%</strong></div>)}</div></div>;
}

function Tag({ texto }: { texto: string }) { return <span style={{ display: "inline-block", padding: "5px 9px", borderRadius: 999, background: texto === "Manual" ? "#fef3c7" : "#ede9fe", color: texto === "Manual" ? "#92400e" : "#5b21b6", fontSize: 12, fontWeight: 700 }}>{texto}</span>; }
function formatarData(data: string) { if (!data) return "—"; const [ano, mes, dia] = data.slice(0, 10).split("-"); return dia && mes && ano ? `${dia}/${mes}/${ano}` : data; }

const tituloStyle = { margin: 0, color: "#4c1d95", fontSize: 18, fontWeight: 700 } as const;
const gridFiltros = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginTop: 14 } as const;
const campoFiltroStyle = { display: "flex", flexDirection: "column", gap: 6 } as const;
const labelFiltroStyle = { color: "#4c1d95", fontSize: 13, fontWeight: 700 } as const;
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: 14 } as const;
const headStyle = { background: "#f5f3ff", color: "#5b21b6", textAlign: "left" } as const;
const rowStyle = { borderBottom: "1px solid #eee" } as const;
const cellStyle = { padding: 11, fontSize: 13 } as const;
const vazioStyle = { padding: 28, textAlign: "center", color: "#6b7280" } as const;
const botaoExcluir = { border: "1px solid #fecaca", color: "#dc2626", background: "#fff", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 } as const;