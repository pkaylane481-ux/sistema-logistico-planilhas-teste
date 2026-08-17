type Filtro = { campo: string; valor: unknown };
type Ordenacao = { campo: string; ascending: boolean };
type Resposta = { data: any; error: { message: string } | null };
type Requisicao = {
  tabela: string;
  acao: "select" | "insert" | "update" | "delete";
  dados?: Record<string, unknown> | Record<string, unknown>[];
  filtros: Filtro[];
  ordenacao?: Ordenacao;
  unico: boolean;
};

declare const google: {
  script: {
    run: {
      withSuccessHandler(callback: (resposta: Resposta) => void): {
        withFailureHandler(callback: (erro: Error) => void): {
          apiRequest(requisicao: Requisicao): void;
        };
      };
    };
  };
};

function executar(requisicao: Requisicao): Promise<Resposta> {
  return new Promise((resolve) => {
    if (typeof google === "undefined" || !google.script?.run) {
      resolve({ data: null, error: { message: "Abra o sistema pelo Web App corporativo." } });
      return;
    }
    google.script.run
      .withSuccessHandler((resposta) => resolve(resposta))
      .withFailureHandler((erro) => resolve({
        data: null,
        error: { message: erro?.message || "Falha ao acessar a planilha." }
      }))
      .apiRequest(requisicao);
  });
}

class ConsultaPlanilha implements PromiseLike<Resposta> {
  private requisicao: Requisicao;

  constructor(tabela: string) {
    this.requisicao = { tabela, acao: "select", filtros: [], unico: false };
  }

  select(_campos = "*") { return this; }
  insert(dados: Record<string, unknown> | Record<string, unknown>[]) {
    this.requisicao.acao = "insert";
    this.requisicao.dados = dados;
    return this;
  }
  update(dados: Record<string, unknown>) {
    this.requisicao.acao = "update";
    this.requisicao.dados = dados;
    return this;
  }
  delete() {
    this.requisicao.acao = "delete";
    return this;
  }
  eq(campo: string, valor: unknown) {
    this.requisicao.filtros.push({ campo, valor });
    return this;
  }
  order(campo: string, opcoes?: { ascending?: boolean }) {
    this.requisicao.ordenacao = { campo, ascending: opcoes?.ascending !== false };
    return this;
  }
  single() {
    this.requisicao.unico = true;
    return this;
  }
  then<TResult1 = Resposta, TResult2 = never>(
    onfulfilled?: ((value: Resposta) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return executar(this.requisicao).then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from(tabela: string) {
    return new ConsultaPlanilha(tabela);
  }
};
