import { supabase } from "./supabase";


// ======================================
// ADICIONAR HISTÓRICO
// ======================================

export async function adicionarHistoricoDevolucaoLogistica(

  historico:any

) {


  const { data, error } = await supabase

    .from("historico_devolucoes_logistica")

    .insert({

      devolucao_id: historico.devolucao_id,

      acao: historico.acao,

      descricao: historico.descricao,

      usuario: historico.usuario ?? null

    })

    .select()

    .single();


  if(error){

    console.error(
      "Erro ao adicionar histórico:",
      error
    );

    throw error;

  }


  return data;

}




// ======================================
// BUSCAR HISTÓRICO
// ======================================

export async function buscarHistoricoDevolucaoLogistica(

  devolucao_id: string

) {

  const { data, error } = await supabase

    .from("historico_devolucoes_logistica")

    .select("*")

    .eq("devolucao_id", devolucao_id)

    .order(
      "created_at",
      {
        ascending:false
      }
    );



  if(error){

    console.error(
      "Erro ao buscar histórico:",
      error
    );

    return [];

  }

  return data || [];

}
