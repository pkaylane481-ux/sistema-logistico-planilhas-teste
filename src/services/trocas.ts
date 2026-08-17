import { supabase } from "./supabase";

import type {
  Troca
} from "../types";




// ======================================
// LISTAR TROCAS
// ======================================

export async function listarTrocas(): Promise<Troca[]> {


  const {

    data,

    error

  } = await supabase

    .from("trocas_devolucoes")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){


    console.error(

      "Erro ao listar trocas:",

      error

    );


    return [];


  }



  return (data ?? []) as Troca[];


}









// ======================================
// BUSCAR TROCA POR ID
// ======================================

export async function buscarTroca(

  id:string

):Promise<Troca | null>{



  const {

    data,

    error

  } = await supabase

    .from("trocas_devolucoes")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();




  if(error){


    console.error(

      "Erro ao buscar troca:",

      error

    );


    return null;


  }



  return data as Troca;


}









// ======================================
// CRIAR TROCA
// ======================================

export async function criarTroca(

  troca: Partial<Troca> & { dataEntrada?: string; dataCadastro?: string }

): Promise<Troca | null> {


  const {

    dataEntrada,

    dataCadastro,

    ...dados

  } = troca;



  const {

    data,

    error

  } = await supabase

    .from("trocas_devolucoes")

    .insert({

      ...dados,

      data_entrada: dataEntrada ?? dados.data_entrada,

      data_cadastro: dataCadastro ?? new Date().toISOString()

    })

    .select()

    .single();



  if(error){


    console.error(

      "Erro ao criar troca:",

      JSON.stringify(error,null,2)

    );


    console.error(

      "Dados enviados:",

      troca

    );


    return null;


  }



  return data as Troca;


}
// ======================================
// ATUALIZAR TROCA
// ======================================

export async function atualizarTroca(

  id:string,

  troca:Partial<Troca>

):Promise<Troca | null>{



  const {

    data,

    error

  } = await supabase

    .from("trocas_devolucoes")

    .update({

      ...troca

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar troca:",

      error

    );


    return null;


  }




  return data as Troca;


}









// ======================================
// ATUALIZAR STATUS
// ======================================

export async function atualizarStatusTroca(

  id:string,

  status:string

):Promise<Troca | null>{



  const {

    data,

    error

  } = await supabase

    .from("trocas_devolucoes")

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

      "Erro ao atualizar status da troca:",

      error

    );


    return null;


  }



  return data as Troca;


}









// ======================================
// EXCLUIR TROCA
// ======================================

export async function excluirTroca(

  id:string

):Promise<boolean>{



  const {

    error

  } = await supabase

    .from("trocas_devolucoes")

    .delete()

    .eq(

      "id",

      id

    );





  if(error){


    console.error(

      "Erro ao excluir troca:",

      error

    );


    return false;


  }




  return true;


}
