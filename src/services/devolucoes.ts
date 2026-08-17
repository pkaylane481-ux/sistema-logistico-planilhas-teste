import { supabase } from "./supabase";

import type {
  DevolucaoLogistica as Devolucao
} from "../types";




// ======================================
// LISTAR DEVOLUÇÕES LOGÍSTICAS
// ======================================

export async function listarDevolucoesLogistica(): Promise<Devolucao[]> {


  const {

    data,

    error

  } = await supabase

    .from("devolucoes_logistica")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){


    console.error(

      "Erro ao listar devoluções logísticas:",

      error

    );


    return [];


  }



  return (data ?? []) as Devolucao[];


}









// ======================================
// BUSCAR DEVOLUÇÃO POR ID
// ======================================

export async function buscarDevolucaoLogistica(

  id:string

):Promise<Devolucao | null>{



  const {

    data,

    error

  } = await supabase

    .from("devolucoes_logistica")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();





  if(error){


    console.error(

      "Erro ao buscar devolução logística:",

      error

    );


    return null;


  }





  return data as Devolucao;


}









// ======================================
// CRIAR DEVOLUÇÃO LOGÍSTICA
// ======================================

export async function criarDevolucaoLogistica(

  devolucao:Partial<Devolucao>

):Promise<Devolucao | null>{



  const {

    data,

    error

  } = await supabase

    .from("devolucoes_logistica")

    .insert({

      ...devolucao

    })

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao criar devolução logística:",

      error

    );


    return null;


  }





  return data as Devolucao;


}









// ======================================
// ATUALIZAR DEVOLUÇÃO LOGÍSTICA
// ======================================

export async function atualizarDevolucaoLogistica(

  id:string,

  devolucao:Partial<Devolucao>

):Promise<Devolucao | null>{



  const {

    data,

    error

  } = await supabase

    .from("devolucoes_logistica")

    .update({

      ...devolucao

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar devolução logística:",

      error

    );


    return null;


  }





  return data as Devolucao;


}









// ======================================
// ATUALIZAR STATUS
// ======================================

export async function atualizarStatusDevolucaoLogistica(

  id:string,

  status:string

):Promise<Devolucao | null>{



  const {

    data,

    error

  } = await supabase

    .from("devolucoes_logistica")

    .update({

      status

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar status da devolução:",

      error

    );


    return null;


  }





  return data as Devolucao;


}









// ======================================
// EXCLUIR DEVOLUÇÃO LOGÍSTICA
// ======================================

export async function excluirDevolucaoLogistica(

  id:string

):Promise<boolean>{



  const {

    error

  } = await supabase

    .from("devolucoes_logistica")

    .delete()

    .eq(

      "id",

      id

    );





  if(error){


    console.error(

      "Erro ao excluir devolução logística:",

      error

    );


    return false;


  }





  return true;


}
