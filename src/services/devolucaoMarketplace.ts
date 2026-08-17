import { supabase } from "./supabase";

import type {
  DevolucaoMarketplace
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarDevolucaoMarketplace(
  item:any
):DevolucaoMarketplace {

  return {

    ...item,

    id:String(item.id)

  };

}






// ======================================
// LISTAR DEVOLUÇÕES MARKETPLACE
// ======================================

export async function listarDevolucaoMarketplace():Promise<DevolucaoMarketplace[]> {


  const {

    data,

    error

  } = await supabase

    .from("devolucao_marketplace")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar devoluções marketplace:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarDevolucaoMarketplace);


}









// ======================================
// BUSCAR DEVOLUÇÃO MARKETPLACE
// ======================================

export async function buscarDevolucaoMarketplace(

  id:string

):Promise<DevolucaoMarketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("devolucao_marketplace")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar devolução marketplace:",

      error

    );

    return null;

  }



  return normalizarDevolucaoMarketplace(data);


}









// ======================================
// CRIAR DEVOLUÇÃO MARKETPLACE
// ======================================

export async function criarDevolucaoMarketplace(

  devolucao:Partial<DevolucaoMarketplace>

):Promise<DevolucaoMarketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("devolucao_marketplace")

    .insert(devolucao)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar devolução marketplace:",

      error

    );

    return null;

  }



  return normalizarDevolucaoMarketplace(data);


}









// ======================================
// ATUALIZAR DEVOLUÇÃO MARKETPLACE
// ======================================

export async function atualizarDevolucaoMarketplace(

  id:string,

  devolucao:Partial<DevolucaoMarketplace>

):Promise<DevolucaoMarketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("devolucao_marketplace")

    .update(devolucao)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar devolução marketplace:",

      error

    );

    return null;

  }



  return normalizarDevolucaoMarketplace(data);


}









// ======================================
// EXCLUIR DEVOLUÇÃO MARKETPLACE
// ======================================

export async function excluirDevolucaoMarketplace(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("devolucao_marketplace")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir devolução marketplace:",

      error

    );

    return false;

  }



  return true;


}

