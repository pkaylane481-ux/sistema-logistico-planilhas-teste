import { useMemo, useState } from "react";
import { useSistema } from "../../context/SistemaContext";
import * as api from "../../services";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d8d2e7",
  borderRadius: 8,
  outline: "none"
};

export default function Produtos() {
  const { produtos = [], carregarDados } = useSistema();
  const [sku, setSku] = useState("");
  const [produto, setProduto] = useState("");
  const [cor, setCor] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((item) =>
      [item.sku, item.produto, item.cor, item.tamanho]
        .some((valor) => String(valor ?? "").toLowerCase().includes(termo))
    );
  }, [busca, produtos]);

  async function salvar() {
    if (!sku.trim() || !produto.trim()) {
      window.alert("Informe pelo menos o SKU e o produto.");
      return;
    }

    const skuNormalizado = sku.trim().toUpperCase();
    if (produtos.some((item) => item.sku?.trim().toUpperCase() === skuNormalizado)) {
      window.alert("Já existe um produto cadastrado com este SKU.");
      return;
    }

    setSalvando(true);
    const resultado = await api.criarProduto({ sku: skuNormalizado, produto, cor, tamanho });
    setSalvando(false);

    if (!resultado) {
      window.alert("Não foi possível cadastrar o produto.");
      return;
    }

    setSku("");
    setProduto("");
    setCor("");
    setTamanho("");
    await carregarDados();
    window.alert("Produto cadastrado com sucesso.");
  }

  async function excluir(id: string) {
    if (!window.confirm("Deseja excluir este produto?")) return;
    const sucesso = await api.excluirProduto(id);
    if (!sucesso) {
      window.alert("Não foi possível excluir o produto.");
      return;
    }
    await carregarDados();
  }

  return (
    <div style={{ padding: 25 }}>
      <h2>Produtos</h2>

      <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 3px 10px rgba(0,0,0,.08)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <label>SKU<input style={inputStyle} value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} placeholder="Ex.: CAM001-P-M" /></label>
          <label>Produto<input style={inputStyle} value={produto} onChange={(e) => setProduto(e.target.value)} placeholder="Nome do produto" /></label>
          <label>Cor<input style={inputStyle} value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Cor" /></label>
          <label>Tamanho<input style={inputStyle} value={tamanho} onChange={(e) => setTamanho(e.target.value)} placeholder="Tamanho" /></label>
        </div>
        <button type="button" onClick={salvar} disabled={salvando} style={{ marginTop: 16, background: "#7c3aed", color: "#fff", border: 0, borderRadius: 8, padding: "11px 18px", cursor: "pointer", fontWeight: 700, opacity: salvando ? .6 : 1 }}>
          {salvando ? "Salvando..." : "Cadastrar produto"}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h3>Produtos cadastrados ({produtos.length})</h3>
          <input style={{ ...inputStyle, maxWidth: 320 }} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por SKU, produto, cor ou tamanho" />
        </div>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead><tr><th style={{ padding: 10 }}>SKU</th><th style={{ padding: 10 }}>Produto</th><th style={{ padding: 10 }}>Cor</th><th style={{ padding: 10 }}>Tamanho</th><th style={{ padding: 10 }}>Ações</th></tr></thead>
            <tbody>
              {produtosFiltrados.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee", fontWeight: 700 }}>{item.sku}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.produto}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.cor || "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.tamanho || "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #eee" }}><button type="button" onClick={() => excluir(item.id)} style={{ background: "#dc2626", color: "#fff", border: 0, borderRadius: 6, padding: "7px 11px", cursor: "pointer" }}>Excluir</button></td>
                </tr>
              ))}
              {produtosFiltrados.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Nenhum produto encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
