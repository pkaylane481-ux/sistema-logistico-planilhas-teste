import { supabase } from "./supabase";

import type {
  HistoricoDevolucao,
  NovoHistoricoDevolucao
} from "../types";


// ======================================
// LISTAR HISTÓRICO
// ======================================

export async function listarHistoricoDevolucao(

  devolucaoId:string

):Promise<HistoricoDevolucao[]>{

  const { data, error } = await supabase
    .from("historico_devolucao")
    .select("*")
    .eq("devolucao_id", devolucaoId)
    .order("created_at",{ ascending:true });

  if(error){

    console.error(
      "Erro ao listar histórico:",
      error
    );

    return [];

  }

  return data as HistoricoDevolucao[];

}



// ======================================
// ADICIONAR HISTÓRICO
// ======================================

export async function adicionarHistoricoDevolucao(

  historico:NovoHistoricoDevolucao

):Promise<HistoricoDevolucao | null>{

  const { data, error } = await supabase
    .from("historico_devolucao")
    .insert(historico)
    .select()
    .single();

  if(error){

    console.error(
      "Erro ao adicionar histórico:",
      error
    );

    return null;

  }

  return data as HistoricoDevolucao;

}



// ======================================
// EXCLUIR HISTÓRICO DA DEVOLUÇÃO
// ======================================

export async function excluirHistoricoDevolucao(

  devolucaoId:string

){

  const { error } = await supabase
    .from("historico_devolucao")
    .delete()
    .eq("devolucao_id", devolucaoId);

  if(error){

    console.error(
      "Erro ao excluir histórico:",
      error
    );

  }

}