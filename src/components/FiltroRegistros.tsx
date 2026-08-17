import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Opcao = {
  id?: string | number;
  nome?: string;
};

type Registro = any;

type FiltroRegistrosProps = {
  registros?: any[];
  operadores?: Opcao[];
  atividades?: Opcao[];
  transportadoras?: Opcao[];
  motivos?: Opcao[];
  onFiltrar: (registros: any[]) => void;
};

const TODOS = "Todos";

const texto = (valor: unknown) => String(valor ?? "").trim();

const dataDoRegistro = (item: Registro) =>
  texto(
    item.data ??
      item.dataEntrada ??
      item.data_entrada ??
      item.dataCadastro ??
      item.data_cadastro ??
      item.created_at
  ).slice(0, 10);

const valorDoRegistro = (item: Registro, campos: string[]) => {
  for (const campo of campos) {
    const valor = texto(item[campo]);
    if (valor) return valor;
  }
  return "";
};

const nomesUnicos = (opcoes: Opcao[] = []) =>
  [...new Set(opcoes.map((item) => texto(item.nome)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

export default function FiltroRegistros({
  registros = [],
  operadores = [],
  atividades = [],
  transportadoras = [],
  motivos = [],
  onFiltrar
}: FiltroRegistrosProps) {
  const [busca, setBusca] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [operador, setOperador] = useState(TODOS);
  const [atividade, setAtividade] = useState(TODOS);
  const [status, setStatus] = useState(TODOS);
  const [transportadora, setTransportadora] = useState(TODOS);
  const [motivo, setMotivo] = useState(TODOS);
  const onFiltrarRef = useRef(onFiltrar);

  useEffect(() => {
    onFiltrarRef.current = onFiltrar;
  }, [onFiltrar]);

  const operadoresDisponiveis = useMemo(() => nomesUnicos(operadores), [operadores]);
  const atividadesDisponiveis = useMemo(() => nomesUnicos(atividades), [atividades]);
  const transportadorasDisponiveis = useMemo(
    () => nomesUnicos(transportadoras),
    [transportadoras]
  );
  const motivosDisponiveis = useMemo(() => nomesUnicos(motivos), [motivos]);
  const statusDisponiveis = useMemo(
    () =>
      [...new Set(registros.map((item) => texto(item.status)).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [registros]
  );

  const registrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return registros.filter((item) => {
      const data = dataDoRegistro(item);
      const responsavel = valorDoRegistro(item, ["operador", "responsavel", "usuario"]);
      const atividadeRegistro = valorDoRegistro(item, ["atividade", "tipo"]);
      const statusRegistro = texto(item.status);
      const transportadoraRegistro = texto(item.transportadora);
      const motivoRegistro = texto(item.motivo);

      if (termo) {
        const conteudo = Object.values(item)
          .map(texto)
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        if (!conteudo.includes(termo)) return false;
      }
      if (dataInicial && (!data || data < dataInicial)) return false;
      if (dataFinal && (!data || data > dataFinal)) return false;
      if (operador !== TODOS && responsavel !== operador) return false;
      if (atividade !== TODOS && atividadeRegistro !== atividade) return false;
      if (status !== TODOS && statusRegistro !== status) return false;
      if (transportadora !== TODOS && transportadoraRegistro !== transportadora) return false;
      if (motivo !== TODOS && motivoRegistro !== motivo) return false;
      return true;
    });
  }, [
    registros,
    busca,
    dataInicial,
    dataFinal,
    operador,
    atividade,
    status,
    transportadora,
    motivo
  ]);

  useEffect(() => {
    onFiltrarRef.current(registrosFiltrados);
  }, [registrosFiltrados]);

  const limparFiltros = () => {
    setBusca("");
    setDataInicial("");
    setDataFinal("");
    setOperador(TODOS);
    setAtividade(TODOS);
    setStatus(TODOS);
    setTransportadora(TODOS);
    setMotivo(TODOS);
  };

  return (
    <section style={cardStyle} aria-label="Filtros de registros">
      <div style={cabecalhoStyle}>
        <div>
          <h2 style={tituloStyle}>Filtros</h2>
          <p style={subtituloStyle}>Refine os registros exibidos na página</p>
        </div>
        <button type="button" onClick={limparFiltros} style={botaoLimparStyle}>
          Limpar filtros
        </button>
      </div>

      <div style={gridStyle}>
        <Campo titulo="Buscar">
          <input
            style={inputStyle}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pedido, cliente ou informação"
          />
        </Campo>

        <Campo titulo="Data inicial">
          <input
            type="date"
            style={inputStyle}
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          />
        </Campo>

        <Campo titulo="Data final">
          <input
            type="date"
            style={inputStyle}
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
        </Campo>

        {operadoresDisponiveis.length > 0 && (
          <Campo titulo="Responsável">
            <SelectFiltro valor={operador} alterar={setOperador} opcoes={operadoresDisponiveis} />
          </Campo>
        )}

        {atividadesDisponiveis.length > 0 && (
          <Campo titulo="Atividade">
            <SelectFiltro valor={atividade} alterar={setAtividade} opcoes={atividadesDisponiveis} />
          </Campo>
        )}

        {statusDisponiveis.length > 0 && (
          <Campo titulo="Status">
            <SelectFiltro valor={status} alterar={setStatus} opcoes={statusDisponiveis} />
          </Campo>
        )}

        {transportadorasDisponiveis.length > 0 && (
          <Campo titulo="Transportadora">
            <SelectFiltro
              valor={transportadora}
              alterar={setTransportadora}
              opcoes={transportadorasDisponiveis}
            />
          </Campo>
        )}

        {motivosDisponiveis.length > 0 && (
          <Campo titulo="Motivo">
            <SelectFiltro valor={motivo} alterar={setMotivo} opcoes={motivosDisponiveis} />
          </Campo>
        )}
      </div>
    </section>
  );
}

function Campo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <label style={campoStyle}>
      <span style={labelStyle}>{titulo}</span>
      {children}
    </label>
  );
}

function SelectFiltro({
  valor,
  alterar,
  opcoes
}: {
  valor: string;
  alterar: (valor: string) => void;
  opcoes: string[];
}) {
  return (
    <select style={inputStyle} value={valor} onChange={(e) => alterar(e.target.value)}>
      <option value={TODOS}>{TODOS}</option>
      {opcoes.map((opcao) => (
        <option key={opcao} value={opcao}>
          {opcao}
        </option>
      ))}
    </select>
  );
}

const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 3px 12px rgba(76,29,149,.08)",
  border: "1px solid #ede9fe"
} as const;

const cabecalhoStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12
} as const;

const tituloStyle = { margin: 0, color: "#4c1d95", fontSize: 18, fontWeight: 700 } as const;
const subtituloStyle = { margin: "4px 0 0", color: "#6b7280", fontSize: 13 } as const;
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginTop: 16
} as const;
const campoStyle = { display: "flex", flexDirection: "column", gap: 6 } as const;
const labelStyle = { color: "#4c1d95", fontSize: 13, fontWeight: 700 } as const;
const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "9px 11px",
  border: "1px solid #d8d2e8",
  borderRadius: 9,
  background: "#fff",
  color: "#1f2937",
  outlineColor: "#7c3aed"
} as const;
const botaoLimparStyle = {
  padding: "9px 13px",
  borderRadius: 9,
  border: "1px solid #ddd6fe",
  background: "#fff",
  color: "#6d28d9",
  cursor: "pointer",
  fontWeight: 700
} as const;
