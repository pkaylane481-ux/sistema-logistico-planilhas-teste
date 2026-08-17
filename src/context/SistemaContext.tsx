import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import type {
  ReactNode
} from "react";

import type {

  Usuario,
  Operador,
  Atividade,
  Transportadora,
  Marketplace,
  Motivo,
  Produto,

  Troca,
  DevolucaoLogistica,
  DevolucaoMarketplace,
  Falha,
  Prioridade,
  Produtividade,
  SLA,

  NovoTroca,
  NovaDevolucaoLogistica,
  NovaFalha,
  NovaPrioridade,
  NovaProdutividade

} from "../types";

import * as api from "../services";

import {
  buscarHistoricoDevolucaoLogistica,
  adicionarHistoricoDevolucaoLogistica
} from "../services/historicoDevolucoesLogistica";

import type {
  HistoricoDevolucao,
  NovoHistoricoDevolucao
} from "../types";



// ======================================
// TIPAGEM DO CONTEXTO
// ======================================

interface SistemaContextType {

  // CONFIGURAÇÕES

  usuarios: Usuario[];

  operadores: Operador[];

  atividades: Atividade[];

  transportadoras: Transportadora[];

  marketplaces: Marketplace[];

  motivos: Motivo[];

  produtos: Produto[];

  historicosDevolucao:HistoricoDevolucao[];

carregarHistoricoDevolucao:
(devolucaoId:string)=>Promise<void>;

registrarHistoricoDevolucao:
(historico:NovoHistoricoDevolucao)=>Promise<void>;



  // PROCESSOS

  trocas: Troca[];

  devolucoesLogistica: DevolucaoLogistica[];

  devolucoes: DevolucaoLogistica[];

  devolucaoMarketplace: DevolucaoMarketplace[];

  falhas: Falha[];

  prioridades: Prioridade[];

  pedidosPrioridade: Prioridade[];

  produtividade: Produtividade[];

  produtividades: Produtividade[];

  slas: SLA[];



  // SETTERS

  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;

  setOperadores: React.Dispatch<React.SetStateAction<Operador[]>>;

  setAtividades: React.Dispatch<React.SetStateAction<Atividade[]>>;

  setTransportadoras: React.Dispatch<React.SetStateAction<Transportadora[]>>;

  setMarketplaces: React.Dispatch<React.SetStateAction<Marketplace[]>>;

  setMotivos: React.Dispatch<React.SetStateAction<Motivo[]>>;

  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;

  setTrocas: React.Dispatch<React.SetStateAction<Troca[]>>;

  setDevolucoesLogistica: React.Dispatch<React.SetStateAction<DevolucaoLogistica[]>>;

  setDevolucaoMarketplace: React.Dispatch<React.SetStateAction<DevolucaoMarketplace[]>>;

  setFalhas: React.Dispatch<React.SetStateAction<Falha[]>>;

  setPrioridades: React.Dispatch<React.SetStateAction<Prioridade[]>>;

  setProdutividade: React.Dispatch<React.SetStateAction<Produtividade[]>>;

  setSlas: React.Dispatch<React.SetStateAction<SLA[]>>;



  // CARREGAMENTO

  carregarDados: () => Promise<void>;

  carregarDashboard: () => Promise<void>;

  atualizarSistema: () => Promise<void>;



  // TROCAS

  adicionarTroca: (
    troca: NovoTroca
  ) => Promise<Troca | null>;

  atualizarTroca: (
    id: string,
    troca: Partial<Troca>
  ) => Promise<Troca | null>;

  removerTroca: (
    id: string
  ) => Promise<boolean>;



  // DEVOLUÇÃO LOGÍSTICA

  adicionarDevolucao: (
    devolucao: NovaDevolucaoLogistica
  ) => Promise<DevolucaoLogistica | null>;

  atualizarDevolucao: (
    id: string,
    devolucao: Partial<DevolucaoLogistica>
  ) => Promise<DevolucaoLogistica | null>;

  removerDevolucao: (
    id: string
  ) => Promise<boolean>;

  // FALHAS

  adicionarFalha: (
    falha: NovaFalha
  ) => Promise<Falha | null>;

  atualizarFalha: (
    id: string,
    falha: Partial<Falha>
  ) => Promise<Falha | null>;

  removerFalha: (
    id: string
  ) => Promise<boolean>;

  // PEDIDOS DE PRIORIDADE

  adicionarPrioridade: (
    prioridade: NovaPrioridade
  ) => Promise<Prioridade | null>;

  atualizarPrioridade: (
    id: string,
    prioridade: Partial<Prioridade>
  ) => Promise<Prioridade | null>;

  removerPrioridade: (
    id: string
  ) => Promise<boolean>;

  // PRODUTIVIDADE

  adicionarProdutividade: (
    produtividadeItem: NovaProdutividade
  ) => Promise<Produtividade | null>;

  atualizarProdutividade: (
    id: string,
    produtividadeItem: Partial<Produtividade>
  ) => Promise<Produtividade | null>;

  removerProdutividade: (
    id: string
  ) => Promise<boolean>;

  // SLA

  adicionarSLA: (
    sla: Partial<SLA>
  ) => Promise<SLA | null>;

  atualizarSLA: (
    id: string,
    sla: Partial<SLA>
  ) => Promise<SLA | null>;

  removerSLA: (
    id: string
  ) => Promise<boolean>;

}



// ======================================
// CRIAÇÃO DO CONTEXTO
// ======================================

const SistemaContext = createContext<SistemaContextType | undefined>(
  undefined
);



// ======================================
// PROVIDER
// ======================================

export function SistemaProvider({

  children

}:{

  children: ReactNode;

}) {

  // ======================================
  // CONFIGURAÇÕES
  // ======================================

  const [

    usuarios,

    setUsuarios

  ] = useState<Usuario[]>([]);

  const [

    operadores,

    setOperadores

  ] = useState<Operador[]>([]);

  const [

    atividades,

    setAtividades

  ] = useState<Atividade[]>([]);

  const [

    transportadoras,

    setTransportadoras

  ] = useState<Transportadora[]>([]);

  const [

    marketplaces,

    setMarketplaces

  ] = useState<Marketplace[]>([]);

  const [

    motivos,

    setMotivos

  ] = useState<Motivo[]>([]);

  const [

    produtos,

    setProdutos

  ] = useState<Produto[]>([]);
  



  // ======================================
  // PROCESSOS
  // ======================================

  const [

    trocas,

    setTrocas

  ] = useState<Troca[]>([]);

  const [

    devolucoesLogistica,

    setDevolucoesLogistica

  ] = useState<DevolucaoLogistica[]>([]);

  const [

    devolucaoMarketplace,

    setDevolucaoMarketplace

  ] = useState<DevolucaoMarketplace[]>([]);

  const [

    falhas,

    setFalhas

  ] = useState<Falha[]>([]);

  const [

    prioridades,

    setPrioridades

  ] = useState<Prioridade[]>([]);

  const [

    produtividade,

    setProdutividade

  ] = useState<Produtividade[]>([]);

  const [

    slas,

    setSlas

  ] = useState<SLA[]>([]);

const [

  historicosDevolucao, 

  setHistoricosDevolucao

] = useState<HistoricoDevolucao[]>([]);



  // ======================================
// CARREGAR DADOS DO SUPABASE
// ======================================

async function carregarDados() {

  try {

    const [

      usuariosData,
      operadoresData,
      atividadesData,
      transportadorasData,
      marketplacesData,
      motivosData,
      produtosData,

      trocasData,
      devolucoesData,
      devolucaoMarketplaceData,
      falhasData,
      prioridadesData,
      produtividadeData,
      slasData

    ] = await Promise.all([
      

    


      // ==========================
      // CONFIGURAÇÕES
      // ==========================

      api.listarUsuarios(),
      api.listarOperadores(),
      api.listarAtividades(),
      api.listarTransportadoras(),
      api.listarMarketplaces(),
      api.listarMotivos(),
      api.listarProdutos(),

      // ==========================
      // PROCESSOS
      // ==========================

      api.listarTrocas(),
      api.listarDevolucoesLogistica(),
      api.listarDevolucaoMarketplace(),
      api.listarFalhas(),
      api.listarPrioridades(),
      api.listarProdutividade(),
      api.listarSLAs()

    ]);



    // ==========================
    // CONFIGURAÇÕES
    // ==========================

    setUsuarios(
      usuariosData ?? []
    );

    setOperadores(
      operadoresData ?? []
    );

    setAtividades(
      atividadesData ?? []
    );

    setTransportadoras(
      transportadorasData ?? []
    );

    setMarketplaces(
      marketplacesData ?? []
    );

    setMotivos(
      motivosData ?? []
    );

    setProdutos(
      produtosData ?? []
    );



    // ==========================
    // PROCESSOS
    // ==========================

    setTrocas(
      trocasData ?? []
    );

    setDevolucoesLogistica(
      devolucoesData ?? []
    );

    setDevolucaoMarketplace(
      devolucaoMarketplaceData ?? []
    );

    setFalhas(
      falhasData ?? []
    );

    setPrioridades(
      prioridadesData ?? []
    );

    setProdutividade(
      produtividadeData ?? []
    );

    setSlas(
      slasData ?? []
    );

  }

  catch (error) {

    console.error(
      "Erro ao carregar dados do sistema:",
      error
    );

  }

}



// ======================================
// COMPATIBILIDADE DASHBOARD
// ======================================

async function carregarDashboard() {

  await carregarDados();

}



// ======================================
// ATUALIZAÇÃO COMPLETA
// ======================================

async function atualizarSistema() {

  await carregarDados();

}
// ======================================
// TROCAS
// ======================================

async function adicionarTroca(

  troca: NovoTroca

): Promise<Troca | null> {

  try {

    const novo = await api.criarTroca(troca);

    if (!novo) {

      return null;

    }

    setTrocas((atual) => [

      novo,

      ...atual

    ]);

    return novo;

  }

  catch (error) {

    console.error(

      "Erro ao adicionar troca:",

      error

    );

    return null;

  }

}





async function atualizarTroca(

  id: string,

  troca: Partial<Troca>

): Promise<Troca | null> {

  try {

    const atualizado = await api.atualizarTroca(

      id,

      troca

    );

    if (!atualizado) {

      return null;

    }

    setTrocas((atual) =>

      atual.map((item) =>

        item.id === id

          ? atualizado

          : item

      )

    );

    return atualizado;

  }

  catch (error) {

    console.error(

      "Erro ao atualizar troca:",

      error

    );

    return null;

  }

}





async function removerTroca(

  id: string

): Promise<boolean> {

  try {

    const sucesso = await api.excluirTroca(id);

    if (!sucesso) {

      return false;

    }

    setTrocas((atual) =>

      atual.filter(

        (item) => item.id !== id

      )

    );

    return true;

  }

  catch (error) {

    console.error(

      "Erro ao excluir troca:",

      error

    );

    return false;

  }

}
  // ======================================
  // DEVOLUÇÃO LOGÍSTICA
  // ======================================

  async function adicionarDevolucao(
    devolucao: NovaDevolucaoLogistica
  ) {

    const nova = await api.criarDevolucaoLogistica(
      devolucao
    );

    if (nova) {

      setDevolucoesLogistica(
        atual => [
          nova,
          ...atual
        ]
      );

    }

    return nova;

  }

  async function atualizarDevolucao(
    id: string,
    devolucao: Partial<DevolucaoLogistica>
  ) {

    const atualizado =
      await api.atualizarDevolucaoLogistica(
        id,
        devolucao
      );

    if (atualizado) {

      setDevolucoesLogistica(
        atual =>
          atual.map(item =>
            item.id === id
              ? atualizado
              : item
          )
      );

    }

    return atualizado;

  }

  async function removerDevolucao(
    id: string
  ) {

    const sucesso =
      await api.excluirDevolucaoLogistica(
        id
      );

    if (sucesso) {

      setDevolucoesLogistica(
        atual =>
          atual.filter(
            item => item.id !== id
          )
      );

    }

    return sucesso;

  }

  // ======================================
// HISTÓRICO DEVOLUÇÃO
// ======================================

async function carregarHistoricoDevolucao(
  devolucaoId:string
){

  const dados =
    await buscarHistoricoDevolucaoLogistica(devolucaoId);

  setHistoricosDevolucao(dados);

}



async function registrarHistoricoDevolucao(

  historico:NovoHistoricoDevolucao

){

  const novo =
    await adicionarHistoricoDevolucaoLogistica(historico);

  if(novo){

    setHistoricosDevolucao(prev=>[
      ...prev,
      novo
    ]);

  }

}
    // ======================================
  // FALHAS
  // ======================================

  async function adicionarFalha(
    falha: NovaFalha
  ) {

    const nova = await api.criarFalha(
      falha
    );

    if (nova) {

      setFalhas(
        atual => [
          nova,
          ...atual
        ]
      );

    }

    return nova;

  }

  async function atualizarFalha(
    id: string,
    falha: Partial<Falha>
  ) {

    const atualizado =
      await api.atualizarFalha(
        id,
        falha
      );

    if (atualizado) {

      setFalhas(
        atual =>
          atual.map(item =>
            item.id === id
              ? atualizado
              : item
          )
      );

    }

    return atualizado;

  }

  async function removerFalha(
    id: string
  ) {

    const sucesso =
      await api.excluirFalha(
        id
      );

    if (sucesso) {

      setFalhas(
        atual =>
          atual.filter(
            item => item.id !== id
          )
      );

    }

    return sucesso;

  }
    // ======================================
  // PEDIDOS DE PRIORIDADE
  // ======================================

  async function adicionarPrioridade(
    prioridade: NovaPrioridade
  ) {

    const nova = await api.criarPrioridade(
      prioridade
    );

    if (nova) {

      setPrioridades(
        atual => [
          nova,
          ...atual
        ]
      );

    }

    return nova;

  }

  async function atualizarPrioridade(
    id: string,
    prioridade: Partial<Prioridade>
  ) {

    const atualizado =
      await api.atualizarPrioridade(
        id,
        prioridade
      );

    if (atualizado) {

      setPrioridades(
        atual =>
          atual.map(item =>
            item.id === id
              ? atualizado
              : item
          )
      );

    }

    return atualizado;

  }

  async function removerPrioridade(
    id: string
  ) {

    const sucesso =
      await api.excluirPrioridade(
        id
      );

    if (sucesso) {

      setPrioridades(
        atual =>
          atual.filter(
            item => item.id !== id
          )
      );

    }

    return sucesso;

  }
    // ======================================
  // PRODUTIVIDADE
  // ======================================

  async function adicionarProdutividade(
    produtividadeItem: NovaProdutividade
  ) {

    const novo = await api.criarProdutividade(
      produtividadeItem
    );

    if (novo) {

      setProdutividade(
        atual => [
          novo,
          ...atual
        ]
      );

    }

    return novo;

  }

  async function atualizarProdutividade(
    id: string,
    produtividadeItem: Partial<Produtividade>
  ) {

    const atualizado =
      await api.atualizarProdutividade(
        id,
        produtividadeItem
      );

    if (atualizado) {

      setProdutividade(
        atual =>
          atual.map(item =>
            item.id === id
              ? atualizado
              : item
          )
      );

    }

    return atualizado;

  }

  async function removerProdutividade(
    id: string
  ) {

    const sucesso =
      await api.excluirProdutividade(
        id
      );

    if (sucesso) {

      setProdutividade(
        atual =>
          atual.filter(
            item => item.id !== id
          )
      );

    }

    return sucesso;

  }
    // ======================================
  // SLA
  // ======================================

  async function adicionarSLA(
    sla: Partial<SLA>
  ) {

    const novo = await api.criarSLA(
      sla
    );

    if (novo) {

      setSlas(
        atual => [
          novo,
          ...atual
        ]
      );

    }

    return novo;

  }

  async function atualizarSLA(
    id: string,
    sla: Partial<SLA>
  ) {

    const atualizado =
      await api.atualizarSLA(
        id,
        sla
      );

    if (atualizado) {

      setSlas(
        atual =>
          atual.map(item =>
            item.id === id
              ? atualizado
              : item
          )
      );

    }

    return atualizado;

  }

  async function removerSLA(
    id: string
  ) {

    const sucesso =
      await api.excluirSLA(
        id
      );

    if (sucesso) {

      setSlas(
        atual =>
          atual.filter(
            item => item.id !== id
          )
      );

    }

    return sucesso;

  }
    // ======================================
  // CARREGAR DADOS AO INICIAR
  // ======================================

  useEffect(() => {

    carregarDados();

  }, []);

  // ======================================
  // RETORNO DO CONTEXTO
  // ======================================

  return (

    <SistemaContext.Provider

      value={{

        // ==============================
        // CONFIGURAÇÕES
        // ==============================

        usuarios,

        operadores,

        atividades,

        transportadoras,

        marketplaces,

        motivos,

        produtos,

        historicosDevolucao,

carregarHistoricoDevolucao,

registrarHistoricoDevolucao,

        // ==============================
        // PROCESSOS
        // ==============================

        trocas,

        devolucoesLogistica,

        // Compatibilidade Dashboard
        devolucoes: devolucoesLogistica,

        devolucaoMarketplace,

        falhas,

        prioridades,

        // Compatibilidade Dashboard
        pedidosPrioridade: prioridades,

        produtividade,

        // Compatibilidade Dashboard
        produtividades: produtividade,

        slas,

        // ==============================
        // SETTERS
        // ==============================

        setUsuarios,

        setOperadores,

        setAtividades,

        setTransportadoras,

        setMarketplaces,

        setMotivos,

        setProdutos,

        setTrocas,

        setDevolucoesLogistica,

        setDevolucaoMarketplace,

        setFalhas,

        setPrioridades,

        setProdutividade,

        setSlas,

        // ==============================
        // CARREGAMENTO
        // ==============================

        carregarDados,

        carregarDashboard,

        atualizarSistema,
                // ==============================
        // TROCAS
        // ==============================

        adicionarTroca,

        atualizarTroca,

        removerTroca,

        // ==============================
        // DEVOLUÇÕES
        // ==============================

        adicionarDevolucao,

        atualizarDevolucao,

        removerDevolucao,

        // ==============================
        // FALHAS
        // ==============================

        adicionarFalha,

        atualizarFalha,

        removerFalha,

        // ==============================
        // PRIORIDADES
        // ==============================

        adicionarPrioridade,

        atualizarPrioridade,

        removerPrioridade,

        // ==============================
        // PRODUTIVIDADE
        // ==============================

        adicionarProdutividade,

        atualizarProdutividade,

        removerProdutividade,

        // ==============================
        // SLA
        // ==============================

        adicionarSLA,

        atualizarSLA,

        removerSLA

      }}

    >

      {children}

    </SistemaContext.Provider>

  );

}

// ======================================
// HOOK GLOBAL
// ======================================

export function useSistema() {

  const contexto = useContext(
    SistemaContext
  );

  if (!contexto) {

    throw new Error(
      "useSistema deve ser utilizado dentro do SistemaProvider"
    );

  }

  return contexto;

}
