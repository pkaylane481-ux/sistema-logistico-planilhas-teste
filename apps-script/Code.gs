const DOMINIO_PERMITIDO = "pangeia96.com.br";
const ABAS = {
  atividades: "ATIVIDADES", devolucao_marketplace: "DEV_MARKETPLACE",
  devolucoes_logistica: "DEV_LOGISTICA", falhas: "FALHAS",
  historico_devolucao: "HIST_DEV_LOGISTICA",
  historico_devolucao_logistica: "HIST_DEV_LOGISTICA",
  historico_devolucoes_logistica: "HIST_DEVS_LOGISTICA",
  marketplaces: "MARKETPLACES", motivos: "MOTIVOS", operadores: "OPERADORES",
  pedidos_prioridade: "PRIORIDADES", produtividade: "PRODUTIVIDADE",
  produtos: "PRODUTOS", slas: "SLAS", transportadoras: "TRANSPORTADORAS",
  trocas_devolucoes: "TROCAS_DEVOLUCOES", usuarios: "USUARIOS"
};

function doGet() {
  validarUsuario_();
  const p = PropertiesService.getScriptProperties();
  const t = HtmlService.createTemplateFromFile("Index");
  t.frontendUrl = p.getProperty("FRONTEND_JS_URL") || "";
  t.cssUrl = p.getProperty("FRONTEND_CSS_URL") || "";
  if (!t.frontendUrl) {
    return HtmlService.createHtmlOutput("<h2>Sistema ainda não configurado</h2><p>Cadastre FRONTEND_JS_URL.</p>");
  }
  return t.evaluate().setTitle("Sistema Logístico Pangeia 96");
}

function apiRequest(req) {
  validarUsuario_();
  if (!req || !ABAS[req.tabela]) return respostaErro_("Tabela não autorizada.");
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABAS[req.tabela]);
    if (!aba) throw new Error("Aba não encontrada: " + ABAS[req.tabela]);
    let data;
    if (req.acao === "select") data = selecionar_(aba, req);
    else if (req.acao === "insert") data = inserir_(aba, req.dados, req.unico);
    else if (req.acao === "update") data = atualizar_(aba, req.dados, req.filtros, req.unico);
    else if (req.acao === "delete") data = excluir_(aba, req.filtros);
    else throw new Error("Operação não autorizada.");
    return { data: data, error: null };
  } catch (erro) {
    console.error(erro);
    return respostaErro_(erro.message || String(erro));
  } finally {
    lock.releaseLock();
  }
}

function validarUsuario_() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  if (!email || !email.endsWith("@" + DOMINIO_PERMITIDO)) {
    throw new Error("Acesso permitido somente para contas corporativas Pangeia 96.");
  }
}

function ler_(aba) {
  const valores = aba.getDataRange().getValues();
  if (!valores.length) return { cabecalhos: [], registros: [] };
  const cabecalhos = valores[0].map(function(v) { return String(v).replace(/,/g, "").trim(); });
  const registros = valores.slice(1).map(function(linha, i) {
    const r = { __linha: i + 2 };
    cabecalhos.forEach(function(c, j) { r[c] = serializar_(linha[j]); });
    return r;
  }).filter(function(r) { return cabecalhos.some(function(c) { return r[c] !== ""; }); });
  return { cabecalhos: cabecalhos, registros: registros };
}

function selecionar_(aba, req) {
  let itens = ler_(aba).registros.filter(function(r) { return filtra_(r, req.filtros || []); });
  if (req.ordenacao) {
    const campo = req.ordenacao.campo;
    const dir = req.ordenacao.ascending === false ? -1 : 1;
    itens.sort(function(a, b) {
      return String(a[campo] || "").localeCompare(String(b[campo] || ""), "pt-BR", { numeric: true }) * dir;
    });
  }
  itens = itens.map(limpar_);
  return req.unico ? (itens[0] || null) : itens;
}

function inserir_(aba, recebidos, unico) {
  const itens = Array.isArray(recebidos) ? recebidos : [recebidos || {}];
  const cabecalhos = ler_(aba).cabecalhos.slice();
  itens.forEach(function(item) {
    Object.keys(item).forEach(function(c) { if (!cabecalhos.includes(c)) cabecalhos.push(c); });
  });
  ["id", "created_at", "updated_at"].forEach(function(c) {
    if (!cabecalhos.includes(c)) cabecalhos.push(c);
  });
  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  const agora = new Date().toISOString();
  const novos = itens.map(function(item) {
    const r = Object.assign({}, item);
    if (!r.id) r.id = Utilities.getUuid();
    if (!r.created_at) r.created_at = agora;
    r.updated_at = agora;
    return r;
  });
  const linhas = novos.map(function(r) {
    return cabecalhos.map(function(c) { return celula_(r[c]); });
  });
  aba.getRange(aba.getLastRow() + 1, 1, linhas.length, cabecalhos.length).setValues(linhas);
  return unico ? novos[0] : novos;
}

function atualizar_(aba, dados, filtros, unico) {
  const estrutura = ler_(aba);
  const cabecalhos = estrutura.cabecalhos.slice();
  Object.keys(dados || {}).forEach(function(c) { if (!cabecalhos.includes(c)) cabecalhos.push(c); });
  if (!cabecalhos.includes("updated_at")) cabecalhos.push("updated_at");
  aba.getRange(1, 1, 1, cabecalhos.length).setValues([cabecalhos]);
  const alterados = [];
  estrutura.registros.forEach(function(registro) {
    if (!filtra_(registro, filtros || [])) return;
    const novo = Object.assign({}, limpar_(registro), dados, { updated_at: new Date().toISOString() });
    aba.getRange(registro.__linha, 1, 1, cabecalhos.length).setValues([
      cabecalhos.map(function(c) { return celula_(novo[c]); })
    ]);
    alterados.push(novo);
  });
  return unico ? (alterados[0] || null) : alterados;
}

function excluir_(aba, filtros) {
  const itens = ler_(aba).registros.filter(function(r) { return filtra_(r, filtros || []); })
    .sort(function(a, b) { return b.__linha - a.__linha; });
  itens.forEach(function(r) { aba.deleteRow(r.__linha); });
  return null;
}

function filtra_(r, filtros) {
  return filtros.every(function(f) { return String(r[f.campo] == null ? "" : r[f.campo]) === String(f.valor == null ? "" : f.valor); });
}
function limpar_(r) { const c = Object.assign({}, r); delete c.__linha; return c; }
function serializar_(v) { return Object.prototype.toString.call(v) === "[object Date]" ? v.toISOString() : v; }
function celula_(v) { return v == null ? "" : (typeof v === "object" ? JSON.stringify(v) : v); }
function respostaErro_(mensagem) { return { data: null, error: { message: mensagem } }; }
