import { supabase } from "./supabase";

import type {
  Falha
} from "../types";




// ======================================
// LISTAR FALHAS
// ======================================

export async function listarFalhas(): Promise<Falha[]> {


  const {

    data,

    error

  } = await supabase

    .from("falhas")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){


    console.error(

      "Erro ao listar falhas:",

      error

    );


    return [];


  }



  return (data ?? []) as Falha[];


}









// ======================================
// BUSCAR FALHA POR ID
// ======================================

export async function buscarFalha(

  id:string

):Promise<Falha | null>{



  const {

    data,

    error

  } = await supabase

    .from("falhas")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();





  if(error){


    console.error(

      "Erro ao buscar falha:",

      error

    );


    return null;


  }





  return data as Falha;


}









// ======================================
// CRIAR FALHA
// ======================================

export async function criarFalha(

  falha:Partial<Falha>

):Promise<Falha | null>{



  const {

    data,

    error

  } = await supabase

    .from("falhas")

    .insert({

      ...falha

    })

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao criar falha:",

      error

    );


    return null;


  }





  return data as Falha;


}









// ======================================
// ATUALIZAR FALHA
// ======================================

export async function atualizarFalha(

  id:string,

  falha:Partial<Falha>

):Promise<Falha | null>{



  const {

    data,

    error

  } = await supabase

    .from("falhas")

    .update({

      ...falha

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar falha:",

      error

    );


    return null;


  }





  return data as Falha;


}









// ======================================
// ATUALIZAR STATUS DA FALHA
// ======================================

export async function atualizarStatusFalha(

  id:string,

  status:string

):Promise<Falha | null>{



  const {

    data,

    error

  } = await supabase

    .from("falhas")

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

      "Erro ao atualizar status da falha:",

      error

    );


    return null;


  }





  return data as Falha;


}









// ======================================
// EXCLUIR FALHA
// ======================================

export async function excluirFalha(

  id:string

):Promise<boolean>{



  const {

    error

  } = await supabase

    .from("falhas")

    .delete()

    .eq(

      "id",

      id

    );





  if(error){


    console.error(

      "Erro ao excluir falha:",

      error

    );


    return false;


  }





  return true;


}