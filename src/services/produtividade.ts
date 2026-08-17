import { supabase } from "./supabase";

import type {
  Produtividade
} from "../types";




// ======================================
// LISTAR PRODUTIVIDADE
// ======================================

export async function listarProdutividade(): Promise<Produtividade[]> {


  const {

    data,

    error

  } = await supabase

    .from("produtividade")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){


    console.error(

      "Erro ao listar produtividade:",

      error

    );


    return [];


  }



  return (data ?? []) as Produtividade[];


}









// ======================================
// BUSCAR PRODUTIVIDADE POR ID
// ======================================

export async function buscarProdutividade(

  id:string

):Promise<Produtividade | null>{



  const {

    data,

    error

  } = await supabase

    .from("produtividade")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();





  if(error){


    console.error(

      "Erro ao buscar produtividade:",

      error

    );


    return null;


  }





  return data as Produtividade;


}









// ======================================
// CRIAR PRODUTIVIDADE
// ======================================

export async function criarProdutividade(

  produtividade:Partial<Produtividade> & { dataEntrada?: string }

):Promise<Produtividade | null>{



  const { dataEntrada, ...dados } = produtividade;
  const registro = {
    ...dados,
    data: dados.data ?? dataEntrada,
    data_cadastro: dados.data_cadastro ?? new Date().toISOString()
  };


const { data, error } = await supabase
  .from("produtividade")
  .insert(registro)
  .select()
  .single();





  if(error){


    console.error(

      "Erro ao criar produtividade:",

      error

    );


    return null;


  }





  return data as Produtividade;


}









// ======================================
// ATUALIZAR PRODUTIVIDADE
// ======================================

export async function atualizarProdutividade(

  id:string,

  produtividade:Partial<Produtividade>

):Promise<Produtividade | null>{



  const {

    data,

    error

  } = await supabase

    .from("produtividade")

    .update({

      ...produtividade

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar produtividade:",

      error

    );


    return null;


  }





  return data as Produtividade;


}









// ======================================
// ATUALIZAR STATUS
// ======================================

export async function atualizarStatusProdutividade(

  id:string,

  status:string

):Promise<Produtividade | null>{



  const {

    data,

    error

  } = await supabase

    .from("produtividade")

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

      "Erro ao atualizar status produtividade:",

      error

    );


    return null;


  }





  return data as Produtividade;


}









// ======================================
// EXCLUIR PRODUTIVIDADE
// ======================================

export async function excluirProdutividade(

  id:string

):Promise<boolean>{



  const {

    error

  } = await supabase

    .from("produtividade")

    .delete()

    .eq(

      "id",

      id

    );





  if(error){


    console.error(

      "Erro ao excluir produtividade:",

      error

    );


    return false;


  }





  return true;


}
