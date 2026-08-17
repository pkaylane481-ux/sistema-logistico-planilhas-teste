import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import FiltroRegistros from "../components/FiltroRegistros";
import ExportarExcel from "../components/ExportarExcel";
import { useSistema } from "../context/SistemaContext";
import { registrarEtapaProdutividade } from "../services";

type AbaAtiva = "formulario" | "dashboard";

interface RegistroDevolucao {
  id: string;
  data?: string;
  data_entrada?: string;
  dataEntrada?: string;
  pedido?: string;
  cliente?: string;
  transportadora?: string;
  motivo?: string;
  status?: string;
  responsavel?: string;
  observacao?: string;
  destino?: string;
  contatos?: number;
  quantidade_contatos?: number;
  decisao_final?: string;
  codigo_rastreio?: string;
  data_informada_entrega?: string;
  valor_frete?: number;
  valor_estorno?: number;
  created_at?: string;
  [chave: string]: unknown;
}

interface HistoricoDevolucao {
  id?: string;
  devolucao_id?: string;
  acao?: string;
  descricao?: string;
  usuario?: string;
  created_at?: string;
}

interface IndicadorProps {
  titulo: string;
  valor: number | string;
  icone: string;
  cor: string;
  detalhe?: string;
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#fff",
  color: "#111827",
  outline: "none"
};

const cardStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "16px",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)"
};

const buttonStyle = {
  padding: "11px 18px",
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: 700
};

const STATUS_FINALIZADOS = ["Enviado", "Cancelado", "Estoque"];
const STATUS_PENDENTES = ["Recebido", "Não entregue", "Em contato", "Reenviar", "Para estoque"];

function obterDataHoje(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterContatos(item: RegistroDevolucao): number {
  return Number(item.contatos ?? item.quantidade_contatos ?? 0);
}

function obterData(item: RegistroDevolucao): string {
  return String(item.data ?? item.data_entrada ?? item.dataEntrada ?? "");
}

function formatarData(valor?: string): string {
  if (!valor) return "-";
  const data = new Date(`${valor}T00:00:00`);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function converterValorMonetario(valor: string): number {
  const texto = valor.trim();
  if (!texto) return 0;

  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;
  const numero = Number(normalizado);

  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function decisaoPorStatus(status: string): string {
  const decisoes: Record<string, string> = {
    Recebido: "Em andamento",
    "Não entregue": "Em andamento",
    "Em contato": "Aguardando retorno",
    Reenviar: "Reenvio aprovado",
    Enviado: "Reenviado",
    Cancelado: "Cancelado",
    "Para estoque": "Aguardando estoque",
    Estoque: "Estornado"
  };
  return decisoes[status] ?? "";
}

export default function DevolucaoLogistica() {
  const {
    devolucoesLogistica,
    carregarDados,
    adicionarDevolucao,
    removerDevolucao,
    historicosDevolucao,
    carregarHistoricoDevolucao,
    registrarHistoricoDevolucao,
    atualizarDevolucao,
    operadores,
    transportadoras,
    motivos
  } = useSistema();

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("formulario");
  const [listaFiltrada, setListaFiltrada] = useState<RegistroDevolucao[] | null>(null);

  const [data, setData] = useState(obterDataHoje);
  const [pedido, setPedido] = useState("");
  const [cliente, setCliente] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [status, setStatus] = useState("Recebido");
  const [responsavel, setResponsavel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [precisaReenvio, setPrecisaReenvio] = useState("Não");
  const [novoPedido, setNovoPedido] = useState("");
  const [dataReenvio, setDataReenvio] = useState("");
  const [codigoRastreioCadastro, setCodigoRastreioCadastro] = useState("");
  const [dataInformadaEntrega, setDataInformadaEntrega] = useState("");
  const [salvandoCadastro, setSalvandoCadastro] = useState(false);

  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<RegistroDevolucao | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editObservacao, setEditObservacao] = useState("");
  const [editContatos, setEditContatos] = useState(0);
  const [editDecisaoFinal, setEditDecisaoFinal] = useState("");
  const [editCodigoRastreio, setEditCodigoRastreio] = useState("");
  const [editDataInformadaEntrega, setEditDataInformadaEntrega] = useState("");
  const [editValorFrete, setEditValorFrete] = useState("");
  const [editValorEstorno, setEditValorEstorno] = useState("");
  const [editOperadorEtapa, setEditOperadorEtapa] = useState("");
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const registros = useMemo(
    () => (devolucoesLogistica ?? []) as unknown as RegistroDevolucao[],
    [devolucoesLogistica]
  );

  const registrosExibidos = listaFiltrada ?? registros;

  const indicadores = useMemo(() => {
    const total = registrosExibidos.length;
    const pendentes = registrosExibidos.filter((item) =>
      STATUS_PENDENTES.includes(String(item.status ?? ""))
    ).length;
    const emContato = registrosExibidos.filter((item) => item.status === "Em contato").length;
    const naoEntregues = registrosExibidos.filter(
      (item) => item.status === "Não entregue" || Boolean(item.data_informada_entrega)
    ).length;
    const reenvios = registrosExibidos.filter(
      (item) => item.destino === "Reenvio" || item.status === "Reenviar" || item.status === "Enviado"
    ).length;
    const estoque = registrosExibidos.filter(
      (item) => item.destino === "Estoque" || item.status === "Para estoque" || item.status === "Estoque"
    ).length;
    const finalizados = registrosExibidos.filter((item) =>
      STATUS_FINALIZADOS.includes(String(item.status ?? ""))
    ).length;

    return { total, pendentes, naoEntregues, emContato, reenvios, estoque, finalizados };
  }, [registrosExibidos]);

  const colunasExportacao = [
    { campo: "data", titulo: "Data" },
    { campo: "pedido", titulo: "Pedido" },
    { campo: "cliente", titulo: "Cliente" },
    { campo: "transportadora", titulo: "Transportadora" },
    { campo: "motivo", titulo: "Motivo" },
    { campo: "status", titulo: "Status" },
    { campo: "responsavel", titulo: "Responsável" },
    { campo: "destino", titulo: "Destino" },
    { campo: "contatos", titulo: "Contatos" },
    { campo: "decisao_final", titulo: "Decisão final" },
    { campo: "codigo_rastreio", titulo: "Código de rastreio" },
    { campo: "data_informada_entrega", titulo: "Data informada como entregue" },
    { campo: "valor_frete", titulo: "Valor do frete" },
    { campo: "valor_estorno", titulo: "Valor do estorno" },
    { campo: "observacao", titulo: "Observação" }
  ];

  function limparFormulario() {
    setData(obterDataHoje());
    setPedido("");
    setCliente("");
    setTransportadora("");
    setMotivo("");
    setStatus("Recebido");
    setResponsavel("");
    setObservacao("");
    setPrecisaReenvio("Não");
    setNovoPedido("");
    setDataReenvio("");
    setCodigoRastreioCadastro("");
    setDataInformadaEntrega("");
  }

  async function salvarDevolucao() {
    if (!pedido.trim() || !cliente.trim()) {
      window.alert("Informe pedido e cliente.");
      return;
    }
    if (!responsavel.trim()) {
      window.alert("Selecione quem está cadastrando o caso.");
      return;
    }
    if (status === "Não entregue" && (!codigoRastreioCadastro.trim() || !dataInformadaEntrega)) {
      window.alert("Informe o código de rastreio e a data informada como entregue.");
      return;
    }

    setSalvandoCadastro(true);
    try {
      await adicionarDevolucao({
        data: data || obterDataHoje(),
        pedido: pedido.trim(),
        cliente: cliente.trim(),
        transportadora,
        motivo,
        status,
        responsavel,
        observacao,
        destino: precisaReenvio === "Sim" ? "Reenvio" : "Estoque",
        codigo_rastreio: status === "Não entregue" ? codigoRastreioCadastro.trim() : "",
        data_informada_entrega: status === "Não entregue" ? dataInformadaEntrega : undefined
      });
      const produtividadeRegistrada = await registrarEtapaProdutividade({
        operador: responsavel,
        atividade: "Cadastro de devolução logística",
        processo: "Devolução Logística",
        pedido: pedido.trim(),
        data: data || obterDataHoje()
      });
      await carregarDados();
      limparFormulario();
      window.alert(
        produtividadeRegistrada
          ? "Devolução registrada e produtividade contabilizada."
          : "Devolução registrada, mas não foi possível contabilizar a produtividade."
      );
    } catch (error) {
      console.error("Erro ao registrar devolução:", error);
      window.alert("Não foi possível registrar a devolução.");
    } finally {
      setSalvandoCadastro(false);
    }
  }

  async function abrirPainel(item: RegistroDevolucao) {
    const statusAtual = String(item.status ?? "Recebido");
    setRegistroSelecionado(item);
    setEditStatus(statusAtual);
    setEditObservacao(String(item.observacao ?? ""));
    setEditContatos(obterContatos(item));
    setEditDecisaoFinal(String(item.decisao_final ?? decisaoPorStatus(statusAtual)));
    setEditCodigoRastreio(String(item.codigo_rastreio ?? ""));
    setEditDataInformadaEntrega(String(item.data_informada_entrega ?? ""));
    setEditValorFrete(item.valor_frete == null ? "" : String(item.valor_frete));
    setEditValorEstorno(item.valor_estorno == null ? "" : String(item.valor_estorno));
    setEditOperadorEtapa("");
    setSomenteLeitura(STATUS_FINALIZADOS.includes(statusAtual));
    setEditando(true);

    try {
      await carregarHistoricoDevolucao(item.id);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  }

  function fecharPainel() {
    setEditando(false);
    setRegistroSelecionado(null);
  }

  function alterarStatus(novoStatus: string) {
    setEditStatus(novoStatus);
    setEditDecisaoFinal(decisaoPorStatus(novoStatus));
  }

  async function registrarContato() {
    if (!registroSelecionado) return;
    if (!editOperadorEtapa.trim()) {
      window.alert("Selecione quem realizou o contato.");
      return;
    }

    const novoTotal = editContatos + 1;
    try {
      await atualizarDevolucao(registroSelecionado.id, { contatos: novoTotal });
      await registrarHistoricoDevolucao({
        devolucao_id: registroSelecionado.id,
        acao: "Contato realizado",
        descricao: `${novoTotal}ª tentativa de contato registrada.`,
        usuario: editOperadorEtapa
      });
      const produtividadeRegistrada = await registrarEtapaProdutividade({
        operador: editOperadorEtapa,
        atividade: "Contato com cliente",
        processo: "Devolução Logística",
        pedido: String(registroSelecionado.pedido ?? ""),
        registroId: registroSelecionado.id,
        observacao: `${novoTotal}ª tentativa de contato`
      });
      setEditContatos(novoTotal);
      setRegistroSelecionado({ ...registroSelecionado, contatos: novoTotal });
      await carregarHistoricoDevolucao(registroSelecionado.id);
      await carregarDados();
      if (!produtividadeRegistrada) {
        window.alert("Contato registrado, mas não foi possível contabilizar a produtividade.");
      }
    } catch (error) {
      console.error("Erro ao registrar contato:", error);
      window.alert("Não foi possível registrar o contato.");
    }
  }

  async function salvarEdicao() {
    if (!registroSelecionado) return;

    if (editStatus === "Não entregue" && (!editCodigoRastreio.trim() || !editDataInformadaEntrega)) {
      window.alert("Informe o código de rastreio e a data informada como entregue.");
      return;
    }

    const houveAlteracao =
      String(registroSelecionado.status ?? "") !== editStatus ||
      String(registroSelecionado.observacao ?? "") !== editObservacao ||
      String(registroSelecionado.decisao_final ?? "") !== editDecisaoFinal ||
      String(registroSelecionado.codigo_rastreio ?? "") !== editCodigoRastreio.trim() ||
      String(registroSelecionado.data_informada_entrega ?? "") !== editDataInformadaEntrega ||
      Number(registroSelecionado.valor_frete ?? 0) !== converterValorMonetario(editValorFrete) ||
      Number(registroSelecionado.valor_estorno ?? 0) !== converterValorMonetario(editValorEstorno);

    if (houveAlteracao && !editOperadorEtapa.trim()) {
      window.alert("Selecione quem realizou esta etapa.");
      return;
    }
    if (!houveAlteracao) {
      window.alert("Nenhuma alteração foi realizada.");
      return;
    }

    setSalvandoEdicao(true);
    try {
      const statusAnterior = String(registroSelecionado.status ?? "");
      const observacaoAnterior = String(registroSelecionado.observacao ?? "");
      const decisaoAnterior = String(registroSelecionado.decisao_final ?? "");
      const rastreioAnterior = String(registroSelecionado.codigo_rastreio ?? "");
      const dataInformadaAnterior = String(registroSelecionado.data_informada_entrega ?? "");
      const freteAnterior = Number(registroSelecionado.valor_frete ?? 0);
      const estornoAnterior = Number(registroSelecionado.valor_estorno ?? 0);
      const valorFrete = converterValorMonetario(editValorFrete);
      const valorEstorno = converterValorMonetario(editValorEstorno);

      const statusFoiAlterado = statusAnterior !== editStatus;
      let registroAtualizado: RegistroDevolucao = registroSelecionado;

      // Salva o status isoladamente. Assim, um campo complementar recusado pelo
      // banco não impede a movimentação principal do caso.
      if (statusFoiAlterado) {
        const atualizadoComNovoStatus = await atualizarDevolucao(
          registroSelecionado.id,
          { status: editStatus } as Partial<RegistroDevolucao>
        );

        if (!atualizadoComNovoStatus || String(atualizadoComNovoStatus.status ?? "") !== editStatus) {
          throw new Error(
            `O banco não confirmou a alteração de status de "${statusAnterior}" para "${editStatus}".`
          );
        }

        registroAtualizado = atualizadoComNovoStatus as unknown as RegistroDevolucao;
      }

      const camposAlterados: Record<string, unknown> = {};
      if (observacaoAnterior !== editObservacao) camposAlterados.observacao = editObservacao;
      if (Number(registroSelecionado.contatos ?? 0) !== editContatos) camposAlterados.contatos = editContatos;
      if (decisaoAnterior !== editDecisaoFinal) camposAlterados.decisao_final = editDecisaoFinal;
      if (rastreioAnterior !== editCodigoRastreio.trim()) camposAlterados.codigo_rastreio = editCodigoRastreio.trim();
      if (dataInformadaAnterior !== editDataInformadaEntrega) camposAlterados.data_informada_entrega = editDataInformadaEntrega || null;
      if (freteAnterior !== valorFrete) camposAlterados.valor_frete = valorFrete;
      if (estornoAnterior !== valorEstorno) camposAlterados.valor_estorno = valorEstorno;

      if (Object.keys(camposAlterados).length > 0) {
        const atualizadoComComplementos = await atualizarDevolucao(
          registroSelecionado.id,
          camposAlterados as Partial<RegistroDevolucao>
        );

        if (!atualizadoComComplementos) {
          throw new Error("O banco não confirmou a atualização dos demais dados da devolução logística.");
        }

        registroAtualizado = atualizadoComComplementos as unknown as RegistroDevolucao;
      }

      const historicos = [];
      if (statusFoiAlterado) {
        historicos.push({ acao: "Status", descricao: `${statusAnterior} → ${editStatus}` });
      }
      if (observacaoAnterior !== editObservacao) {
        historicos.push({ acao: "Observação", descricao: "Observação alterada." });
      }
      if (decisaoAnterior !== editDecisaoFinal) {
        historicos.push({ acao: "Decisão final", descricao: `Alterada para ${editDecisaoFinal}.` });
      }
      if (rastreioAnterior !== editCodigoRastreio.trim()) {
        historicos.push({ acao: "Rastreio", descricao: `Código alterado para ${editCodigoRastreio.trim() || "não informado"}.` });
      }
      if (dataInformadaAnterior !== editDataInformadaEntrega) {
        historicos.push({ acao: "Data informada como entregue", descricao: `Alterada para ${editDataInformadaEntrega ? formatarData(editDataInformadaEntrega) : "não informada"}.` });
      }
      if (freteAnterior !== valorFrete) {
        historicos.push({ acao: "Valor do frete", descricao: `Alterado para ${formatarMoeda(valorFrete)}.` });
      }
      if (estornoAnterior !== valorEstorno) {
        historicos.push({ acao: "Valor do estorno", descricao: `Alterado para ${formatarMoeda(valorEstorno)}.` });
      }

      for (const historico of historicos) {
        await registrarHistoricoDevolucao({
          devolucao_id: registroSelecionado.id,
          ...historico,
          usuario: editOperadorEtapa
        });
      }

      const atividadeProdutividade = STATUS_FINALIZADOS.includes(editStatus)
        ? "Conclusão de devolução logística"
        : "Atualização de devolução logística";
      const produtividadeRegistrada = await registrarEtapaProdutividade({
        operador: editOperadorEtapa,
        atividade: atividadeProdutividade,
        processo: "Devolução Logística",
        pedido: String(registroSelecionado.pedido ?? ""),
        registroId: registroSelecionado.id,
        observacao: statusFoiAlterado ? `${statusAnterior} → ${editStatus}` : "Dados atualizados"
      });

      setRegistroSelecionado({
        ...(registroAtualizado as RegistroDevolucao),
        data_informada_entrega: registroAtualizado.data_informada_entrega ?? editDataInformadaEntrega
      });
      setSomenteLeitura(STATUS_FINALIZADOS.includes(editStatus));
      await carregarDados();
      await carregarHistoricoDevolucao(registroSelecionado.id);
      window.alert(
        produtividadeRegistrada
          ? "Alterações salvas e produtividade contabilizada."
          : "Alterações salvas, mas não foi possível contabilizar a produtividade."
      );
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      const mensagem = error instanceof Error ? error.message : "Erro desconhecido.";
      window.alert(`Não foi possível salvar as alterações.\n\n${mensagem}`);
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluirRegistro(item: RegistroDevolucao) {
    const confirmar = window.confirm(`Excluir a devolução do pedido ${item.pedido ?? ""}?`);
    if (!confirmar) return;

    try {
      await removerDevolucao(item.id);
      await carregarDados();
      if (registroSelecionado?.id === item.id) fecharPainel();
    } catch (error) {
      console.error("Erro ao excluir devolução:", error);
      window.alert("Não foi possível excluir o registro.");
    }
  }

  return (
    <div className="p-6" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        className="w-full bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl px-6 py-5 mb-6 shadow-sm"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Devoluções Logísticas</h1>
          <p className="text-purple-200 text-sm mt-1">
            Controle de retornos, reenvios e tratativas operacionais
          </p>
        </div>

        <ExportarExcel
          dados={registrosExibidos}
          nomeArquivo="devolucao_logistica"
          nomeAba="Devoluções"
          titulo="Exportar Excel"
          colunas={colunasExportacao}
        />
      </header>

      <section style={{ marginBottom: "22px" }}>
        <FiltroRegistros
          registros={devolucoesLogistica ?? []}
          operadores={operadores ?? []}
          atividades={[]}
          transportadoras={transportadoras ?? []}
          motivos={motivos ?? []}
          onFiltrar={(dados) => setListaFiltrada(dados as unknown as RegistroDevolucao[])}
        />
      </section>

      <section
        aria-label="Indicadores de devoluções"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "22px"
        }}
      >
        <Indicador titulo="Total" valor={indicadores.total} icone="📦" cor="#2563eb" />
        <Indicador titulo="Pendentes" valor={indicadores.pendentes} icone="🟡" cor="#f59e0b" />
        <Indicador titulo="Não entregues" valor={indicadores.naoEntregues} icone="🚫" cor="#dc2626" />
        <Indicador titulo="Em contato" valor={indicadores.emContato} icone="📞" cor="#8b5cf6" />
        <Indicador titulo="Reenvios" valor={indicadores.reenvios} icone="🚚" cor="#0ea5e9" />
        <Indicador titulo="Estoque" valor={indicadores.estoque} icone="🏬" cor="#10b981" />
        <Indicador titulo="Finalizados" valor={indicadores.finalizados} icone="✅" cor="#22c55e" />
      </section>

      <nav style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
        <BotaoAba ativo={abaAtiva === "formulario"} onClick={() => setAbaAtiva("formulario")}>
          ➕ Registrar e listar
        </BotaoAba>
        <BotaoAba ativo={abaAtiva === "dashboard"} onClick={() => setAbaAtiva("dashboard")}>
          📊 Dashboard analítico
        </BotaoAba>
      </nav>

      {abaAtiva === "formulario" ? (
        <section style={{ display: "grid", gap: "24px" }}>
          <FormularioDevolucao
            data={data}
            setData={setData}
            pedido={pedido}
            setPedido={setPedido}
            cliente={cliente}
            setCliente={setCliente}
            transportadora={transportadora}
            setTransportadora={setTransportadora}
            motivo={motivo}
            setMotivo={setMotivo}
            status={status}
            setStatus={setStatus}
            responsavel={responsavel}
            setResponsavel={setResponsavel}
            observacao={observacao}
            setObservacao={setObservacao}
            precisaReenvio={precisaReenvio}
            setPrecisaReenvio={setPrecisaReenvio}
            novoPedido={novoPedido}
            setNovoPedido={setNovoPedido}
            dataReenvio={dataReenvio}
            setDataReenvio={setDataReenvio}
            codigoRastreio={codigoRastreioCadastro}
            setCodigoRastreio={setCodigoRastreioCadastro}
            dataInformadaEntrega={dataInformadaEntrega}
            setDataInformadaEntrega={setDataInformadaEntrega}
            operadores={operadores ?? []}
            transportadoras={transportadoras ?? []}
            motivos={motivos ?? []}
            salvando={salvandoCadastro}
            onSalvar={salvarDevolucao}
          />

          <ListagemDevolucoes
            registros={registrosExibidos}
            onAbrir={abrirPainel}
            onExcluir={excluirRegistro}
          />
        </section>
      ) : (
        <DashboardDevolucoes registros={registrosExibidos} onAbrirCaso={abrirPainel} />
      )}

      {editando && registroSelecionado && (
        <PainelEdicao
          registro={registroSelecionado}
          historicos={(historicosDevolucao ?? []) as unknown as HistoricoDevolucao[]}
          somenteLeitura={somenteLeitura}
          status={editStatus}
          observacao={editObservacao}
          contatos={editContatos}
          decisaoFinal={editDecisaoFinal}
          codigoRastreio={editCodigoRastreio}
          dataInformadaEntrega={editDataInformadaEntrega}
          valorFrete={editValorFrete}
          valorEstorno={editValorEstorno}
          operadorEtapa={editOperadorEtapa}
          operadores={operadores ?? []}
          salvando={salvandoEdicao}
          onStatusChange={alterarStatus}
          onObservacaoChange={setEditObservacao}
          onCodigoRastreioChange={setEditCodigoRastreio}
          onDataInformadaEntregaChange={setEditDataInformadaEntrega}
          onValorFreteChange={setEditValorFrete}
          onValorEstornoChange={setEditValorEstorno}
          onOperadorEtapaChange={setEditOperadorEtapa}
          onRegistrarContato={registrarContato}
          onSalvar={salvarEdicao}
          onFechar={fecharPainel}
        />
      )}
    </div>
  );
}

function Indicador({ titulo, valor, icone, cor, detalhe }: IndicadorProps) {
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "18px",
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
        borderTop: `5px solid ${cor}`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>{titulo}</div>
          <div style={{ fontSize: "32px", fontWeight: 800, color: cor, marginTop: "4px" }}>{valor}</div>
        </div>
        <span aria-hidden="true" style={{ fontSize: "32px" }}>{icone}</span>
      </div>
      {detalhe && <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>{detalhe}</div>}
    </article>
  );
}

function BotaoAba({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "11px 20px",
        borderRadius: "10px",
        border: ativo ? "1px solid #7c3aed" : "1px solid #d1d5db",
        cursor: "pointer",
        fontWeight: 700,
        background: ativo ? "#7c3aed" : "#fff",
        color: ativo ? "#fff" : "#374151"
      }}
    >
      {children}
    </button>
  );
}

interface FormularioProps {
  data: string;
  setData: (valor: string) => void;
  pedido: string;
  setPedido: (valor: string) => void;
  cliente: string;
  setCliente: (valor: string) => void;
  transportadora: string;
  setTransportadora: (valor: string) => void;
  motivo: string;
  setMotivo: (valor: string) => void;
  status: string;
  setStatus: (valor: string) => void;
  responsavel: string;
  setResponsavel: (valor: string) => void;
  observacao: string;
  setObservacao: (valor: string) => void;
  precisaReenvio: string;
  setPrecisaReenvio: (valor: string) => void;
  novoPedido: string;
  setNovoPedido: (valor: string) => void;
  dataReenvio: string;
  setDataReenvio: (valor: string) => void;
  codigoRastreio: string;
  setCodigoRastreio: (valor: string) => void;
  dataInformadaEntrega: string;
  setDataInformadaEntrega: (valor: string) => void;
  operadores: Array<{ id?: string | number; nome?: string }>;
  transportadoras: Array<{ id?: string | number; nome?: string }>;
  motivos: Array<{ id?: string | number; nome?: string }>;
  salvando: boolean;
  onSalvar: () => void;
}

function FormularioDevolucao(props: FormularioProps) {
  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: "21px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" }}>
        Registrar devolução
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        <Campo label="Data">
          <input type="date" style={inputStyle} value={props.data} onChange={(e) => props.setData(e.target.value)} />
        </Campo>
        <Campo label="Pedido" obrigatorio>
          <input style={inputStyle} value={props.pedido} onChange={(e) => props.setPedido(e.target.value)} placeholder="Número do pedido" />
        </Campo>
        <Campo label="Cliente" obrigatorio>
          <input style={inputStyle} value={props.cliente} onChange={(e) => props.setCliente(e.target.value)} placeholder="Nome do cliente" />
        </Campo>
        <Campo label="Transportadora">
          <select style={inputStyle} value={props.transportadora} onChange={(e) => props.setTransportadora(e.target.value)}>
            <option value="">Selecione</option>
            {props.transportadoras.map((item) => <option key={String(item.id ?? item.nome)} value={item.nome}>{item.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Motivo">
          <select style={inputStyle} value={props.motivo} onChange={(e) => props.setMotivo(e.target.value)}>
            <option value="">Selecione</option>
            {props.motivos.map((item) => <option key={String(item.id ?? item.nome)} value={item.nome}>{item.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Status">
          <select style={inputStyle} value={props.status} onChange={(e) => props.setStatus(e.target.value)}>
            <option>Recebido</option>
            <option>Não entregue</option>
            <option>Em contato</option>
            <option>Reenviar</option>
            <option>Enviado</option>
            <option>Cancelado</option>
            <option>Para estoque</option>
            <option>Estoque</option>
          </select>
        </Campo>
        <Campo label="Responsável">
          <select style={inputStyle} value={props.responsavel} onChange={(e) => props.setResponsavel(e.target.value)}>
            <option value="">Selecione</option>
            {props.operadores.map((item) => <option key={String(item.id ?? item.nome)} value={item.nome}>{item.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Destino / reenvio">
          <select style={inputStyle} value={props.precisaReenvio} onChange={(e) => props.setPrecisaReenvio(e.target.value)}>
            <option>Não</option>
            <option>Sim</option>
          </select>
        </Campo>
      </div>

      {props.status === "Não entregue" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginTop: "16px", padding: "16px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
          <div style={{ gridColumn: "1 / -1", color: "#991b1b", fontWeight: 800 }}>🚫 Dados do pacote informado como entregue</div>
          <Campo label="Código de rastreio" obrigatorio>
            <input style={inputStyle} value={props.codigoRastreio} onChange={(e) => props.setCodigoRastreio(e.target.value.toUpperCase())} placeholder="Código de rastreio do pacote" />
          </Campo>
          <Campo label="Data informada como entregue" obrigatorio>
            <input type="date" style={inputStyle} value={props.dataInformadaEntrega} onChange={(e) => props.setDataInformadaEntrega(e.target.value)} />
          </Campo>
        </div>
      )}

      {props.precisaReenvio === "Sim" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px", marginTop: "16px", padding: "16px", borderRadius: "12px", background: "#f5f3ff" }}>
          <Campo label="Novo pedido / reenvio">
            <input style={inputStyle} value={props.novoPedido} onChange={(e) => props.setNovoPedido(e.target.value)} placeholder="Número do novo pedido" />
          </Campo>
          <Campo label="Data do reenvio">
            <input type="date" style={inputStyle} value={props.dataReenvio} onChange={(e) => props.setDataReenvio(e.target.value)} />
          </Campo>
        </div>
      )}

      <div style={{ marginTop: "16px" }}>
        <Campo label="Observação">
          <textarea style={{ ...inputStyle, minHeight: "95px", resize: "vertical" }} value={props.observacao} onChange={(e) => props.setObservacao(e.target.value)} placeholder="Informações adicionais" />
        </Campo>
      </div>

      <button type="button" style={{ ...buttonStyle, marginTop: "18px", opacity: props.salvando ? 0.65 : 1 }} onClick={props.onSalvar} disabled={props.salvando}>
        {props.salvando ? "Salvando..." : "➕ Registrar devolução"}
      </button>
    </div>
  );
}

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
      <span>{label}{obrigatorio && <span style={{ color: "#dc2626" }}> *</span>}</span>
      {children}
    </label>
  );
}

function ListagemDevolucoes({ registros, onAbrir, onExcluir }: { registros: RegistroDevolucao[]; onAbrir: (item: RegistroDevolucao) => void; onExcluir: (item: RegistroDevolucao) => void }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "21px", fontWeight: 800, color: "#1f2937" }}>Devoluções registradas</h2>
        <span style={{ color: "#64748b", fontSize: "14px" }}>{registros.length} registro(s)</span>
      </div>

      {registros.length === 0 ? (
        <div style={{ padding: "36px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px" }}>
          Nenhuma devolução encontrada para os filtros selecionados.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1260px" }}>
            <thead>
              <tr style={{ background: "#f5f3ff", color: "#4c1d95", textAlign: "left" }}>
                {["Data", "Pedido", "Cliente", "Transportadora", "Motivo", "Status", "Rastreio", "Data entregue", "Responsável", "Contatos", "Ações"].map((titulo) => (
                  <th key={titulo} style={{ padding: "13px", fontSize: "13px" }}>{titulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((item) => (
                <tr key={String(item.id)} onClick={() => onAbrir(item)} style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}>
                  <td style={{ padding: "13px" }}>{formatarData(obterData(item))}</td>
                  <td style={{ padding: "13px", fontWeight: 700 }}>{String(item.pedido ?? "-")}</td>
                  <td style={{ padding: "13px" }}>{String(item.cliente ?? "-")}</td>
                  <td style={{ padding: "13px" }}>{String(item.transportadora ?? "-")}</td>
                  <td style={{ padding: "13px" }}>{String(item.motivo ?? "-")}</td>
                  <td style={{ padding: "13px" }}><StatusBadge status={String(item.status ?? "-")} /></td>
                  <td style={{ padding: "13px" }}>{String(item.codigo_rastreio ?? "-")}</td>
                  <td style={{ padding: "13px" }}>{item.data_informada_entrega ? formatarData(item.data_informada_entrega) : "-"}</td>
                  <td style={{ padding: "13px" }}>{String(item.responsavel ?? "-")}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{obterContatos(item)}</td>
                  <td style={{ padding: "13px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" style={{ ...buttonStyle, padding: "8px 11px", background: "#2563eb" }} onClick={(e) => { e.stopPropagation(); void onAbrir(item); }}>Abrir</button>
                      <button type="button" style={{ ...buttonStyle, padding: "8px 11px", background: "#dc2626" }} onClick={(e) => { e.stopPropagation(); void onExcluir(item); }}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cores: Record<string, { fundo: string; texto: string }> = {
    Recebido: { fundo: "#dbeafe", texto: "#1d4ed8" },
    "Em contato": { fundo: "#ede9fe", texto: "#6d28d9" },
    Reenviar: { fundo: "#fef3c7", texto: "#b45309" },
    Enviado: { fundo: "#dcfce7", texto: "#15803d" },
    Cancelado: { fundo: "#fee2e2", texto: "#b91c1c" },
    "Para estoque": { fundo: "#ffedd5", texto: "#c2410c" },
    Estoque: { fundo: "#d1fae5", texto: "#047857" }
  };
  const cor = cores[status] ?? { fundo: "#f1f5f9", texto: "#475569" };
  return <span style={{ display: "inline-block", padding: "5px 9px", borderRadius: "999px", background: cor.fundo, color: cor.texto, fontSize: "12px", fontWeight: 800 }}>{status}</span>;
}

function DashboardDevolucoes({
  registros,
  onAbrirCaso
}: {
  registros: RegistroDevolucao[];
  onAbrirCaso: (item: RegistroDevolucao) => void;
}) {
  const motivos = agrupar(registros, "motivo");
  const transportadoras = agrupar(registros, "transportadora");
  const valores = calcularComparacaoValores(registros);
  const resultados = calcularResultados(registros);
  const temposPorEtapa = calcularTempoMedioPorEtapa(registros);
  const casos = [...registros]
    .filter((item) => STATUS_PENDENTES.includes(String(item.status ?? "")))
    .sort((a, b) => obterContatos(b) - obterContatos(a))
    .slice(0, 8);

  return (
    <section style={{ display: "grid", gap: "22px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px" }}>
        <GraficoBarrasVerticais titulo="Motivos das devoluções" dados={motivos} cor="#7c3aed" />
        <GraficoLinhas titulo="Transportadoras" dados={transportadoras} cor="#2563eb" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px" }}>
        <ComparacaoValores dados={valores} />
        <CardsResultadoFinal dados={resultados} totalRegistros={registros.length} />
      </div>

      <TempoMedioEtapas dados={temposPorEtapa} />
      <CasosCriticos registros={casos} onAbrir={onAbrirCaso} />
    </section>
  );
}

function agrupar(registros: RegistroDevolucao[], campo: keyof RegistroDevolucao) {
  const totais = registros.reduce<Record<string, number>>((acc, item) => {
    const nome = String(item[campo] ?? "Não informado");
    acc[nome] = (acc[nome] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(totais).sort((a, b) => b[1] - a[1]).slice(0, 8);
}

interface DadoResultado {
  nome: string;
  valor: number;
  cor: string;
  icone: string;
}

function calcularComparacaoValores(registros: RegistroDevolucao[]) {
  return {
    reenvios: registros.reduce((total, item) => total + Number(item.valor_frete ?? 0), 0),
    estornos: registros.reduce((total, item) => total + Number(item.valor_estorno ?? 0), 0)
  };
}

function calcularResultados(registros: RegistroDevolucao[]): DadoResultado[] {
  return [
    {
      nome: "Reenviado",
      valor: registros.filter(
        (item) => item.status === "Enviado" || item.decisao_final === "Reenviado"
      ).length,
      cor: "#2563eb",
      icone: "🚚"
    },
    {
      nome: "Estornado",
      valor: registros.filter(
        (item) => item.status === "Estoque" || item.decisao_final === "Estornado"
      ).length,
      cor: "#f59e0b",
      icone: "💰"
    },
    {
      nome: "Cancelado",
      valor: registros.filter((item) => item.status === "Cancelado").length,
      cor: "#dc2626",
      icone: "❌"
    }
  ];
}

function calcularTempoMedioPorEtapa(registros: RegistroDevolucao[]) {
  const agora = Date.now();
  const grupos: Record<string, number[]> = {
    Recebido: [],
    "Em contato": [],
    Reenvio: [],
    Finalizado: []
  };

  registros.forEach((item) => {
    const valorData = String(item.created_at ?? obterData(item));
    if (!valorData) return;

    const dataBase = new Date(valorData).getTime();
    if (Number.isNaN(dataBase)) return;

    const dias = Math.max((agora - dataBase) / 86_400_000, 0);
    const statusAtual = String(item.status ?? "");

    if (statusAtual === "Recebido") grupos.Recebido.push(dias);
    if (statusAtual === "Em contato") grupos["Em contato"].push(dias);
    if (statusAtual === "Reenviar" || statusAtual === "Para estoque") grupos.Reenvio.push(dias);
    if (STATUS_FINALIZADOS.includes(statusAtual) || statusAtual === "Finalizado") {
      grupos.Finalizado.push(dias);
    }
  });

  return Object.entries(grupos).map(([nome, valores]) => ({
    nome,
    dias: valores.length
      ? valores.reduce((total, valor) => total + valor, 0) / valores.length
      : 0
  }));
}

function GraficoBarrasVerticais({
  titulo,
  dados,
  cor
}: {
  titulo: string;
  dados: Array<[string, number]>;
  cor: string;
}) {
  const maior = Math.max(...dados.map(([, valor]) => valor), 1);

  return (
    <article style={cardStyle}>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#1f2937",
          marginBottom: "18px"
        }}
      >
        {titulo}
      </h3>

      {dados.length === 0 ? (
        <p style={{ color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "16px",
              minWidth: `${Math.max(dados.length * 92, 560)}px`,
              height: "310px",
              padding: "20px 10px 0",
              borderBottom: "1px solid #d1d5db",
              backgroundImage:
                "repeating-linear-gradient(to top, transparent 0, transparent 59px, #eef2f7 60px)"
            }}
          >
            {dados.map(([nome, valor]) => (
              <div
                key={nome}
                title={`${nome}: ${valor}`}
                style={{
                  flex: 1,
                  minWidth: "72px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center"
                }}
              >
                <strong
                  style={{
                    marginBottom: "7px",
                    color: "#4c1d95",
                    fontSize: "14px"
                  }}
                >
                  {valor}
                </strong>

                <div
                  style={{
                    width: "52px",
                    height: `${Math.max((valor / maior) * 205, 14)}px`,
                    borderRadius: "9px 9px 3px 3px",
                    background: `linear-gradient(180deg, #a78bfa 0%, ${cor} 100%)`,
                    boxShadow: "0 5px 12px rgba(124, 58, 237, 0.22)",
                    transition: "height 0.25s ease"
                  }}
                />

                <span
                  style={{
                    width: "84px",
                    minHeight: "48px",
                    marginTop: "8px",
                    color: "#475569",
                    fontSize: "11px",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    textAlign: "center",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical"
                  }}
                >
                  {nome}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function GraficoLinhas({
  titulo,
  dados,
  cor
}: {
  titulo: string;
  dados: Array<[string, number]>;
  cor: string;
}) {
  const dadosExibidos = dados.slice(0, 6);
  const maior = Math.max(...dadosExibidos.map(([, valor]) => valor), 1);
  const largura = 640;
  const altura = 285;
  const margemX = 55;
  const topo = 25;
  const base = 220;
  const intervalo =
    dadosExibidos.length > 1
      ? (largura - margemX * 2) / (dadosExibidos.length - 1)
      : 0;
  const pontos = dadosExibidos.map(([nome, valor], index) => ({
    nome,
    valor,
    x: dadosExibidos.length === 1 ? largura / 2 : margemX + index * intervalo,
    y: base - (valor / maior) * (base - topo)
  }));
  const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");

  return (
    <article style={cardStyle}>
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937", marginBottom: "18px" }}>
        {titulo}
      </h3>

      {dadosExibidos.length === 0 ? (
        <p style={{ color: "#64748b" }}>Sem dados no período.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <svg
            viewBox={`0 0 ${largura} ${altura}`}
            role="img"
            aria-label={`${titulo}: gráfico de linhas`}
            style={{ width: "100%", minWidth: "560px", height: "310px" }}
          >
            {[0, 1, 2, 3, 4].map((linhaGrade) => {
              const y = topo + ((base - topo) / 4) * linhaGrade;
              return (
                <line
                  key={linhaGrade}
                  x1={margemX}
                  x2={largura - margemX}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}

            {pontos.length > 1 && (
              <polyline
                points={linha}
                fill="none"
                stroke={cor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {pontos.map((ponto) => (
              <g key={ponto.nome}>
                <circle cx={ponto.x} cy={ponto.y} r="8" fill="#fff" stroke={cor} strokeWidth="5" />
                <text x={ponto.x} y={ponto.y - 16} textAnchor="middle" fill="#1e3a8a" fontSize="14" fontWeight="700">
                  {ponto.valor}
                </text>
                <text x={ponto.x} y="249" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                  {ponto.nome.length > 13 ? `${ponto.nome.slice(0, 12)}…` : ponto.nome}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </article>
  );
}

function ComparacaoValores({ dados }: { dados: { reenvios: number; estornos: number } }) {
  const maior = Math.max(dados.reenvios, dados.estornos, 1);
  const diferenca = dados.reenvios - dados.estornos;
  return (
    <article style={cardStyle}>
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>
        Valores de reenvio x estorno
      </h3>
      <p style={{ marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
        Comparação dos valores registrados no período filtrado.
      </p>

      <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
        <BarraValor
          titulo="Fretes de reenvio"
          icone="🚚"
          valor={dados.reenvios}
          percentual={(dados.reenvios / maior) * 100}
          cor="#2563eb"
        />
        <BarraValor
          titulo="Valores estornados"
          icone="💰"
          valor={dados.estornos}
          percentual={(dados.estornos / maior) * 100}
          cor="#f59e0b"
        />
      </div>

      <div style={{ marginTop: "23px", padding: "13px", borderRadius: "10px", background: "#f8fafc", color: "#475569", fontSize: "13px" }}>
        Diferença: <strong style={{ color: diferenca > 0 ? "#2563eb" : diferenca < 0 ? "#d97706" : "#475569" }}>
          {formatarMoeda(Math.abs(diferenca))}
        </strong>{" "}
        {diferenca > 0 ? "a mais em fretes" : diferenca < 0 ? "a mais em estornos" : "— valores equilibrados"}
      </div>
    </article>
  );
}

function BarraValor({ titulo, icone, valor, percentual, cor }: { titulo: string; icone: string; valor: number; percentual: number; cor: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", marginBottom: "8px" }}>
        <span style={{ color: "#475569", fontSize: "13px", fontWeight: 700 }}>{icone} {titulo}</span>
        <strong style={{ color: cor, fontSize: "19px" }}>{formatarMoeda(valor)}</strong>
      </div>
      <div style={{ height: "17px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ width: `${valor ? Math.max(percentual, 3) : 0}%`, height: "100%", borderRadius: "999px", background: cor }} />
      </div>
    </div>
  );
}

function CardsResultadoFinal({ dados, totalRegistros }: { dados: DadoResultado[]; totalRegistros: number }) {
  return (
    <article style={cardStyle}>
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>Resultado final</h3>
      <p style={{ marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
        Quantidade e participação sobre todos os registros filtrados.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", marginTop: "22px" }}>
        {dados.map((item) => {
          const percentual = totalRegistros ? (item.valor / totalRegistros) * 100 : 0;
          return (
            <div
              key={item.nome}
              style={{
                padding: "18px 12px",
                borderRadius: "14px",
                borderTop: `5px solid ${item.cor}`,
                background: "#f8fafc",
                textAlign: "center",
                boxShadow: "0 3px 10px rgba(15, 23, 42, 0.06)"
              }}
            >
              <span style={{ fontSize: "25px" }}>{item.icone}</span>
              <div style={{ marginTop: "6px", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>{item.nome}</div>
              <strong style={{ display: "block", marginTop: "4px", color: item.cor, fontSize: "34px", lineHeight: 1.1 }}>{item.valor}</strong>
              <span style={{ display: "block", marginTop: "5px", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>
                {percentual.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "18px", color: "#64748b", fontSize: "12px", textAlign: "right" }}>
        Base: {totalRegistros} registro(s)
      </div>
    </article>
  );
}

function TempoMedioEtapas({ dados }: { dados: Array<{ nome: string; dias: number }> }) {
  const maior = Math.max(...dados.map((item) => item.dias), 1);
  const cores: Record<string, string> = {
    Recebido: "#2563eb",
    "Em contato": "#7c3aed",
    Reenvio: "#f59e0b",
    Finalizado: "#16a34a"
  };

  return (
    <article style={cardStyle}>
      <div style={{ marginBottom: "19px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>Tempo médio por etapa</h3>
        <p style={{ marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
          Permanência média calculada com as datas disponíveis nos registros.
        </p>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {dados.map((item) => (
          <div key={item.nome} style={{ display: "grid", gridTemplateColumns: "110px 1fr 82px", alignItems: "center", gap: "13px" }}>
            <strong style={{ color: "#475569", fontSize: "13px" }}>{item.nome}</strong>
            <div style={{ height: "16px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden" }}>
              <div
                style={{
                  width: `${item.dias ? Math.max((item.dias / maior) * 100, 3) : 0}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: cores[item.nome] ?? "#7c3aed"
                }}
              />
            </div>
            <span style={{ color: "#1f2937", fontSize: "13px", fontWeight: 800, textAlign: "right" }}>
              {item.dias.toFixed(1)} dias
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function CasosCriticos({
  registros,
  onAbrir
}: {
  registros: RegistroDevolucao[];
  onAbrir: (item: RegistroDevolucao) => void;
}) {
  return (
    <article style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>Casos críticos</h3>
          <p style={{ marginTop: "4px", color: "#64748b", fontSize: "12px" }}>
            Clique em um caso para abrir o painel de resolução.
          </p>
        </div>
        <span style={{ padding: "6px 10px", borderRadius: "999px", background: "#fef2f2", color: "#b91c1c", fontSize: "12px", fontWeight: 800 }}>
          {registros.length} pendente(s)
        </span>
      </div>

      {registros.length === 0 ? <p style={{ color: "#64748b" }}>Nenhum caso pendente nos filtros atuais.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "780px" }}>
            <thead>
              <tr style={{ background: "#fef2f2", color: "#991b1b", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Pedido</th>
                <th style={{ padding: "12px" }}>Cliente</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Prioridade</th>
                <th style={{ padding: "12px" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((item) => {
                const contatos = obterContatos(item);
                const prioridade = contatos >= 3
                  ? { texto: "🔴 Crítico", cor: "#dc2626" }
                  : contatos >= 1 || item.status === "Em contato"
                    ? { texto: "🟡 Atenção", cor: "#d97706" }
                    : { texto: "🟢 Normal", cor: "#15803d" };

                return (
                  <tr
                    key={String(item.id)}
                    onClick={() => onAbrir(item)}
                    style={{ borderBottom: "1px solid #e5e7eb", cursor: "pointer" }}
                    title="Abrir caso para resolução"
                  >
                    <td style={{ padding: "12px", fontWeight: 700 }}>{String(item.pedido ?? "-")}</td>
                    <td style={{ padding: "12px" }}>{String(item.cliente ?? "-")}</td>
                    <td style={{ padding: "12px" }}><StatusBadge status={String(item.status ?? "-")} /></td>
                    <td style={{ padding: "12px", color: prioridade.cor, fontWeight: 800 }}>{prioridade.texto}</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        type="button"
                        onClick={(evento) => {
                          evento.stopPropagation();
                          onAbrir(item);
                        }}
                        style={{ ...buttonStyle, padding: "8px 12px", background: "#7c3aed" }}
                      >
                        Resolver caso
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

interface PainelProps {
  registro: RegistroDevolucao;
  historicos: HistoricoDevolucao[];
  somenteLeitura: boolean;
  status: string;
  observacao: string;
  contatos: number;
  decisaoFinal: string;
  codigoRastreio: string;
  dataInformadaEntrega: string;
  valorFrete: string;
  valorEstorno: string;
  operadorEtapa: string;
  operadores: Array<{ id: string; nome: string }>;
  salvando: boolean;
  onStatusChange: (valor: string) => void;
  onObservacaoChange: (valor: string) => void;
  onCodigoRastreioChange: (valor: string) => void;
  onDataInformadaEntregaChange: (valor: string) => void;
  onValorFreteChange: (valor: string) => void;
  onValorEstornoChange: (valor: string) => void;
  onOperadorEtapaChange: (valor: string) => void;
  onRegistrarContato: () => void;
  onSalvar: () => void;
  onFechar: () => void;
}

function PainelEdicao(props: PainelProps) {
  const corContato = props.contatos >= 3 ? "#dc2626" : props.contatos === 2 ? "#eab308" : props.contatos === 1 ? "#22c55e" : "#64748b";
  const casoReenvio = ["Reenviar", "Enviado"].includes(props.status) || props.decisaoFinal === "Reenviado";
  const casoEstorno = ["Para estoque", "Estoque"].includes(props.status) || props.decisaoFinal === "Estornado";
  const casoNaoEntregue = props.status === "Não entregue" || Boolean(props.dataInformadaEntrega);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15, 23, 42, 0.45)" }} onClick={props.onFechar}>
      <aside onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, width: "min(520px, 100vw)", height: "100vh", background: "#fff", boxShadow: "-8px 0 24px rgba(0,0,0,.2)", padding: "24px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div><h2 style={{ fontSize: "22px", fontWeight: 800 }}>Editar caso</h2><p style={{ color: "#64748b", fontSize: "13px" }}>Pedido {String(props.registro.pedido ?? "-")}</p></div>
          <button type="button" onClick={props.onFechar} style={{ border: "none", background: "#f1f5f9", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>

        {props.somenteLeitura && <div style={{ padding: "12px", borderRadius: "9px", background: "#fef3c7", color: "#92400e", marginBottom: "16px", fontSize: "13px", fontWeight: 700 }}>Caso finalizado. Status e tratativa estão bloqueados, mas os dados financeiros e de rastreio ainda podem ser atualizados.</div>}

        <div style={{ display: "grid", gap: "14px" }}>
          <Campo label="Operador responsável por esta etapa">
            <select style={inputStyle} value={props.operadorEtapa} onChange={(e) => props.onOperadorEtapaChange(e.target.value)}>
              <option value="">Selecione o operador</option>
              {props.operadores.map((item) => <option key={item.id} value={item.nome}>{item.nome}</option>)}
            </select>
          </Campo>
          <Campo label="Cliente"><input style={{ ...inputStyle, background: "#f8fafc" }} value={String(props.registro.cliente ?? "")} readOnly /></Campo>
          <Campo label="Transportadora"><input style={{ ...inputStyle, background: "#f8fafc" }} value={String(props.registro.transportadora ?? "")} readOnly /></Campo>
          <Campo label="Motivo"><input style={{ ...inputStyle, background: "#f8fafc" }} value={String(props.registro.motivo ?? "")} readOnly /></Campo>
          <Campo label="Status"><select style={inputStyle} value={props.status} disabled={props.somenteLeitura} onChange={(e) => props.onStatusChange(e.target.value)}><option>Recebido</option><option>Não entregue</option><option>Em contato</option><option>Reenviar</option><option>Enviado</option><option>Cancelado</option><option>Para estoque</option><option>Estoque</option></select></Campo>
          <Campo label="Decisão final"><input style={{ ...inputStyle, background: "#f8fafc" }} value={props.decisaoFinal} readOnly /></Campo>

          {casoNaoEntregue && (
            <div style={{ display: "grid", gap: "14px", padding: "16px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
              <div style={{ color: "#991b1b", fontSize: "14px", fontWeight: 800 }}>🚫 Dados do não entregue</div>
              <Campo label="Código de rastreio">
                <input style={inputStyle} value={props.codigoRastreio} onChange={(e) => props.onCodigoRastreioChange(e.target.value.toUpperCase())} />
              </Campo>
              <Campo label="Data informada como entregue">
                <input type="date" style={inputStyle} value={props.dataInformadaEntrega} onChange={(e) => props.onDataInformadaEntregaChange(e.target.value)} />
              </Campo>
            </div>
          )}

          {casoReenvio && (
            <div style={{ display: "grid", gap: "14px", padding: "16px", borderRadius: "12px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div style={{ color: "#1e40af", fontSize: "14px", fontWeight: 800 }}>🚚 Dados do reenvio</div>
              {!casoNaoEntregue && <Campo label="Código de rastreio">
                <input
                  style={inputStyle}
                  value={props.codigoRastreio}
                  onChange={(e) => props.onCodigoRastreioChange(e.target.value)}
                  placeholder="Informe o código de rastreio"
                />
              </Campo>}
              <Campo label="Valor do frete">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={props.valorFrete}
                  onChange={(e) => props.onValorFreteChange(e.target.value)}
                  placeholder="0,00"
                />
              </Campo>
            </div>
          )}

          {casoEstorno && (
            <div style={{ display: "grid", gap: "14px", padding: "16px", borderRadius: "12px", background: "#fffbeb", border: "1px solid #fde68a" }}>
              <div style={{ color: "#92400e", fontSize: "14px", fontWeight: 800 }}>💰 Dados do estorno</div>
              <Campo label="Valor do estorno">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={props.valorEstorno}
                  onChange={(e) => props.onValorEstornoChange(e.target.value)}
                  placeholder="0,00"
                />
              </Campo>
            </div>
          )}

          <Campo label="Observação"><textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={props.observacao} disabled={props.somenteLeitura} onChange={(e) => props.onObservacaoChange(e.target.value)} /></Campo>
        </div>

        <div style={{ marginTop: "18px", padding: "16px", borderRadius: "12px", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}><div><div style={{ fontSize: "13px", color: "#64748b" }}>Contatos realizados</div><strong style={{ fontSize: "28px", color: corContato }}>{props.contatos}</strong></div><button type="button" style={{ ...buttonStyle, background: "#0f766e", opacity: props.somenteLeitura ? 0.5 : 1 }} disabled={props.somenteLeitura} onClick={props.onRegistrarContato}>📞 Registrar contato</button></div>
        </div>

        <div style={{ marginTop: "22px" }}><h3 style={{ fontSize: "17px", fontWeight: 800, marginBottom: "12px" }}>Histórico</h3><div style={{ display: "grid", gap: "10px", maxHeight: "280px", overflowY: "auto" }}>{props.historicos.length === 0 ? <p style={{ color: "#64748b", fontSize: "13px" }}>Nenhum histórico registrado.</p> : props.historicos.map((item, index) => <div key={String(item.id ?? index)} style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fff" }}><div style={{ display: "flex", justifyContent: "space-between", gap: "10px", color: "#64748b", fontSize: "11px" }}><span>{item.usuario ?? "Sistema"}</span><span>{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : ""}</span></div><strong style={{ display: "block", marginTop: "5px", fontSize: "13px" }}>{item.acao ?? "Atualização"}</strong><p style={{ marginTop: "3px", color: "#475569", fontSize: "13px" }}>{item.descricao ?? ""}</p></div>)}</div></div>

        <div style={{ display: "flex", gap: "10px", marginTop: "22px", flexWrap: "wrap" }}><button type="button" style={{ ...buttonStyle, background: "#16a34a", opacity: props.salvando ? 0.5 : 1 }} onClick={props.onSalvar} disabled={props.salvando}>{props.salvando ? "Salvando..." : "Salvar alterações"}</button><button type="button" style={{ ...buttonStyle, background: "#64748b" }} onClick={props.onFechar}>Fechar</button></div>
      </aside>
    </div>
  );
}
