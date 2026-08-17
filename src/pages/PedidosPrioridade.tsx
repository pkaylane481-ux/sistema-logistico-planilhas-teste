import { useMemo, useState } from "react";
import { useSistema } from "../context/SistemaContext";
import ExportarExcel from "../components/ExportarExcel";
import { supabase } from "../services/supabase";

const STATUS = ["Pendente", "Em andamento", "Finalizado", "Cancelado"];
const PRIORIDADES = ["Alta", "Média", "Baixa"];
const hoje = () => new Date().toISOString().slice(0, 10);

export default function PedidosPrioridade() {
  const sistema = useSistema() as any;
  const { prioridades = [], adicionarPrioridade, removerPrioridade, operadores = [] } = sistema;
  const atualizarPrioridade = (sistema as any).atualizarPrioridade as
    | ((id: string | number, dados: Record<string, unknown>) => Promise<unknown>)
    | undefined;
  const carregarDados = (sistema as any).carregarDados as (() => Promise<unknown>) | undefined;

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState("Todos");
  const [statusLocal, setStatusLocal] = useState<Record<string, string>>({});
  const [statusSalvando, setStatusSalvando] = useState<string | null>(null);

  const [pedido, setPedido] = useState("");
  const [cliente, setCliente] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [data, setData] = useState(hoje);
  const [prioridade, setPrioridade] = useState("Alta");
  const [status, setStatus] = useState("Pendente");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #ddd6fe",
    borderRadius: "9px",
    width: "100%",
    background: "#fff",
    outline: "none",
  };
  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 3px 12px rgba(76,29,149,.08)",
    border: "1px solid #f1edff",
  };

  async function salvarPedido() {
    if (!pedido.trim() || !cliente.trim()) {
      alert("Informe pedido e cliente.");
      return;
    }
    try {
      setSalvando(true);
      await adicionarPrioridade({
        pedido: pedido.trim(),
        cliente: cliente.trim(),
        responsavel,
        data_entrada: data || hoje(),
        prioridade,
        status,
        observacao: observacao.trim(),
      });
      setPedido("");
      setCliente("");
      setResponsavel("");
      setData(hoje());
      setPrioridade("Alta");
      setStatus("Pendente");
      setObservacao("");
    } catch (erro) {
      console.error("Erro ao registrar pedido prioritário:", erro);
      alert("Não foi possível registrar o pedido.");
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(item: any, novoStatus: string) {
    const chave = String(item.id);
    const anterior = statusLocal[chave] ?? item.status ?? "Pendente";
    setStatusLocal((atual) => ({ ...atual, [chave]: novoStatus }));
    setStatusSalvando(chave);
    try {
      if (atualizarPrioridade) {
        await atualizarPrioridade(item.id, { status: novoStatus });
      } else {
        const { error } = await supabase
          .from("pedidos_prioridade")
          .update({ status: novoStatus })
          .eq("id", item.id);
        if (error) throw error;
      }
      if (carregarDados) await carregarDados();
    } catch (erro) {
      setStatusLocal((atual) => ({ ...atual, [chave]: anterior }));
      console.error("Erro ao atualizar status:", erro);
      alert("Não foi possível atualizar o status.");
    } finally {
      setStatusSalvando(null);
    }
  }

  const registros = useMemo(() => {
    const busca = filtroTexto.trim().toLowerCase();
    return prioridades.filter((item: any) => {
      const statusAtual = statusLocal[String(item.id)] ?? item.status;
      if (busca && !`${item.pedido ?? ""} ${item.cliente ?? ""}`.toLowerCase().includes(busca)) return false;
      if (filtroStatus !== "Todos" && statusAtual !== filtroStatus) return false;
      if (filtroPrioridade !== "Todos" && item.prioridade !== filtroPrioridade) return false;
      if (filtroResponsavel !== "Todos" && item.responsavel !== filtroResponsavel) return false;
      return true;
    });
  }, [prioridades, filtroTexto, filtroStatus, filtroPrioridade, filtroResponsavel, statusLocal]);

  const total = registros.length;
  const pendentes = registros.filter((item: any) => (statusLocal[String(item.id)] ?? item.status) === "Pendente").length;
  const altas = registros.filter((item: any) => item.prioridade === "Alta").length;
  const finalizados = registros.filter((item: any) => (statusLocal[String(item.id)] ?? item.status) === "Finalizado").length;

  const colunasExportacao = [
    { campo: "pedido", titulo: "Pedido" },
    { campo: "cliente", titulo: "Cliente" },
    { campo: "responsavel", titulo: "Responsável" },
    { campo: "dataEntrada", titulo: "Data" },
    { campo: "prioridade", titulo: "Prioridade" },
    { campo: "status", titulo: "Status" },
    { campo: "observacao", titulo: "Observação" },
  ];

  return (
    <div className="p-6" style={{ minHeight: "100vh", background: "#faf9ff" }}>
      <div className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos de Prioridade</h1>
          <p className="text-purple-200 text-sm mt-1">Controle de pedidos críticos, SLA e tratativas prioritárias</p>
        </div>
        <ExportarExcel dados={registros} nomeArquivo="pedidos_prioridade" nomeAba="Prioridades" titulo="Exportar Excel" colunas={colunasExportacao} />
      </div>

      <section style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4c1d95", marginBottom: 14 }}>Filtros</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
          <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Buscar</span><input style={inputStyle} placeholder="Pedido ou cliente" value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} /></label>
          <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Status</span><select style={inputStyle} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option>Todos</option>{STATUS.map((opcao) => <option key={opcao}>{opcao}</option>)}
          </select></label>
          <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Prioridade</span><select style={inputStyle} value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
            <option>Todos</option>{PRIORIDADES.map((opcao) => <option key={opcao}>{opcao}</option>)}
          </select></label>
          <label style={campoFiltroStyle}><span style={labelFiltroStyle}>Responsável</span><select style={inputStyle} value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)}>
            <option>Todos</option>{operadores.map((op: any) => <option key={op.id ?? op.nome} value={op.nome}>{op.nome}</option>)}
          </select></label>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 15, marginBottom: 20 }}>
        <CardIndicador titulo="Total" valor={total} cor="#7c3aed" />
        <CardIndicador titulo="Pendentes" valor={pendentes} cor="#f59e0b" />
        <CardIndicador titulo="Alta prioridade" valor={altas} cor="#dc2626" />
        <CardIndicador titulo="Finalizados" valor={finalizados} cor="#16a34a" />
      </div>

      <section style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4c1d95", marginBottom: 14 }}>Registrar pedido prioritário</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
          <input style={inputStyle} placeholder="Número do pedido" value={pedido} onChange={(e) => setPedido(e.target.value)} />
          <input style={inputStyle} placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          <select style={inputStyle} value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
            <option value="">Selecione o responsável</option>{operadores.map((op: any) => <option key={op.id ?? op.nome} value={op.nome}>{op.nome}</option>)}
          </select>
          <input style={inputStyle} type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <select style={inputStyle} value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>{PRIORIDADES.map((opcao) => <option key={opcao}>{opcao}</option>)}</select>
          <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((opcao) => <option key={opcao}>{opcao}</option>)}</select>
        </div>
        <textarea style={{ ...inputStyle, marginTop: 12, minHeight: 90, resize: "vertical" }} placeholder="Observação" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        <button type="button" onClick={salvarPedido} disabled={salvando} style={{ marginTop: 12, padding: "12px 20px", background: salvando ? "#a78bfa" : "#7c3aed", color: "#fff", border: 0, borderRadius: 10, cursor: salvando ? "wait" : "pointer", fontWeight: 700 }}>
          {salvando ? "Registrando..." : "Registrar pedido"}
        </button>
      </section>

      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#4c1d95" }}>Registros</h2>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{total} registro(s)</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
            <thead><tr style={{ background: "#f5f3ff", color: "#5b21b6", textAlign: "left" }}>
              {["Data", "Pedido", "Cliente", "Prioridade", "Status", "Responsável", "Ação"].map((titulo) => <th key={titulo} style={{ padding: 12, fontSize: 13 }}>{titulo}</th>)}
            </tr></thead>
            <tbody>
              {registros.map((item: any) => {
                const chave = String(item.id);
                const statusAtual = statusLocal[chave] ?? item.status ?? "Pendente";
                return <tr key={chave} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{item.dataEntrada ? new Date(`${item.dataEntrada}T00:00:00`).toLocaleDateString("pt-BR") : "—"}</td>
                  <td style={{ padding: 12, fontWeight: 700, color: "#4c1d95" }}>{item.pedido}</td>
                  <td style={{ padding: 12 }}>{item.cliente}</td>
                  <td style={{ padding: 12 }}><span style={{ padding: "5px 9px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: item.prioridade === "Alta" ? "#fee2e2" : item.prioridade === "Média" ? "#fef3c7" : "#dcfce7", color: item.prioridade === "Alta" ? "#b91c1c" : item.prioridade === "Média" ? "#92400e" : "#166534" }}>{item.prioridade}</span></td>
                  <td style={{ padding: 12 }}><select aria-label={`Alterar status do pedido ${item.pedido}`} style={{ ...inputStyle, minWidth: 145, padding: "7px 9px" }} value={statusAtual} disabled={statusSalvando === chave} onChange={(e) => alterarStatus(item, e.target.value)}>{STATUS.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></td>
                  <td style={{ padding: 12 }}>{item.responsavel || "—"}</td>
                  <td style={{ padding: 12 }}><button type="button" onClick={() => { if (confirm(`Excluir o pedido ${item.pedido}?`)) removerPrioridade(item.id); }} style={{ border: "1px solid #fecaca", color: "#dc2626", background: "#fff", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Excluir</button></td>
                </tr>;
              })}
              {registros.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#6b7280" }}>Nenhum registro encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CardIndicador({ titulo, valor, cor }: { titulo: string; valor: number; cor: string }) {
  return <div style={{ background: "#fff", padding: 18, borderRadius: 12, borderLeft: `6px solid ${cor}`, boxShadow: "0 3px 10px rgba(0,0,0,.08)" }}>
    <div style={{ color: "#666", fontSize: 14 }}>{titulo}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color: cor }}>{valor}</div>
  </div>;
}

const campoFiltroStyle = { display: "flex", flexDirection: "column", gap: 6 } as const;
const labelFiltroStyle = { color: "#4c1d95", fontSize: 13, fontWeight: 700 } as const;
