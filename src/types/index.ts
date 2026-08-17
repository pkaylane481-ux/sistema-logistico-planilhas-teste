// ==============================
// CONFIGURAÇÕES
// ==============================


// USUÁRIOS
export interface Usuario {

  id: string;

  nome: string;

  email: string | null;

  perfil: string | null;

  ativo: boolean;

  created_at?: string;

}





// OPERADORES
// tabela: operadores
// id: bigint

export interface Operador {

  id: string;

  nome: string;

  created_at?: string;

}





// ATIVIDADES
// tabela: atividades
// id: bigint

export interface Atividade {

  id: string;

  nome: string;

  created_at?: string;

}





// TRANSPORTADORAS

export interface Transportadora {

  id: string;

  nome: string;

  created_at?: string;

}





// MARKETPLACES

export interface Marketplace {

  id: string;

  nome: string;

  created_at?: string;

}





// MOTIVOS

export interface Motivo {

  id: string;

  nome: string;

  created_at?: string;

}





// ==============================
// TROCAS E DEVOLUÇÕES
// tabela: trocas_devolucoes
// id: uuid
// ==============================


export interface Troca {


  id: string;


  pedido: string | null;


  cliente: string | null;


  tipo: string | null;


  status: string | null;


  responsavel: string | null;


  data: string | null;


  data_entrada: string | null;


  quantidade: number | null;


  operador: string | null;


  atividade: string | null;


  produto: string | null;

  sku: string | null;

cor: string | null;

tamanho: string | null;


  marketplace: string | null;


  motivo: string | null;


  observacao: string | null;


  usuario_id?: string;


  created_at?: string;


}
// ==============================
// DEVOLUÇÃO LOGÍSTICA
// tabela: devolucoes_logistica
// id: uuid
// ==============================


export interface DevolucaoLogistica {

  id: string;

  pedido: string;

  cliente: string;

  motivo: string;

  transportadora?: string;

  responsavel: string;

  status: string;

  contatos: number;

  decisao_final?: string;

  destino?: string;

  codigo_rastreio?: string;

  data_informada_entrega?: string;

  valor_frete?: number;

  valor_estorno?: number;

  data_finalizacao?: string;

  observacao?: string;

  data_entrada?: string;

  data_cadastro?: string;

  created_at?: string;

  data?: string;

}

export interface HistoricoDevolucao{

  id:string;

  devolucao_id:string;

  data?:string;

  usuario:string;

  acao:string;

  observacao?:string | null;

  descricao?:string;

  created_at?:string;

}



// ==============================
// DEVOLUÇÃO MARKETPLACE
// tabela: devolucao_marketplace
// id: bigint
// ==============================


export interface DevolucaoMarketplace {


  id: string;


  data: string;


  quantidade: number | null;


  divergencia: string | null;


  video: string | null;


  data_cadastro?: string;


  usuario_id?: string;


  created_at?: string;


}







// ==============================
// FALHAS
// tabela: falhas
// id: uuid
// ==============================


export interface Falha {


  id: string;


  tipo: string | null;


  responsabilidade: string | null;


  descricao: string | null;


  data: string | null;


  pedido: string | null;


  transportadora: string | null;


  responsavel: string | null;


  status: string | null;


  observacao: string | null;


  usuario_id?: string;


  created_at?: string;


  data_cadastro?: string;


}







// ==============================
// PEDIDOS PRIORIDADE
// tabela: pedidos_prioridade
// id: uuid
// ==============================


export interface Prioridade {


  id: string;


  pedido: string | null;


  cliente: string | null;


  motivo: string | null;


  responsavel: string | null;


  status: string | null;


  tipo: string | null;

  prioridade?: string | null;


  observacao: string | null;


  data: string | null;


  data_entrada: string | null;


  usuario_id?: string;


  created_at?: string;


  data_cadastro?: string;


}
// ==============================
// PRODUTIVIDADE
// tabela: produtividade
// id: uuid
// ==============================


export interface Produtividade {


  id: string;


  operador: string | null;


  atividade: string | null;


  quantidade: number | null;


  sla: string | null;


  status: string | null;


  observacao: string | null;


  data: string | null;


  usuario_id?: string;


  created_at?: string;


  data_cadastro?: string;


}







// ==============================
// SLA
// tabela: slas
// id: bigint
// ==============================

export interface SLA {

  id: string;

  // Banco
  processo: string;

  responsavel: string | null;

  data_inicio: string | null;

  prazo: number | null;

  data_limite: string | null;

  status: string | null;

  usuario_id?: string;

  created_at?: string;

  data_cadastro?: string;

  // Compatibilidade com o frontend
  nome?: string;

  atividade?: string;

  slaDefinido?: string;

  dataCadastro?: string;

}







// ==============================
// TIPOS AUXILIARES PARA INSERT
// ==============================
//
// Usados nos services e Context.
// O banco gera:
// - id
// - created_at
//
// Portanto não precisamos enviar esses campos.
//

export type NovoTroca = Omit<Partial<Troca>, "id" | "created_at">;


export type NovaDevolucaoLogistica =
  Omit<Partial<DevolucaoLogistica>, "id" | "created_at"> &
  Pick<DevolucaoLogistica, "pedido" | "cliente">;


export type NovaFalha = Omit<
  Falha,
  "id" | "created_at"
>;


export type NovaPrioridade = Omit<
  Prioridade,
  "id" | "created_at"
>;


export type NovaProdutividade = Omit<
  Produtividade,
  "id" | "created_at"
>;

export type NovoHistoricoDevolucao = Omit<
  HistoricoDevolucao,
  "id" | "created_at"
>;

export interface Produto {

  id:string;

  sku:string;

  produto:string;

  cor:string;

  tamanho:string;

  created_at:string;

}
