import { supabase } from "./supabase";

import type {
  Marketplace
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarMarketplace(
  item:any
):Marketplace {

  return {

    ...item,

    id:String(item.id)

  };

}






// ======================================
// LISTAR MARKETPLACES
// ======================================

export async function listarMarketplaces():Promise<Marketplace[]> {


  const {

    data,

    error

  } = await supabase

    .from("marketplaces")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar marketplaces:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarMarketplace);


}









// ======================================
// BUSCAR MARKETPLACE
// ======================================

export async function buscarMarketplace(

  id:string

):Promise<Marketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("marketplaces")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar marketplace:",

      error

    );

    return null;

  }



  return normalizarMarketplace(data);


}









// ======================================
// CRIAR MARKETPLACE
// ======================================

export async function criarMarketplace(

  marketplace:Partial<Marketplace>

):Promise<Marketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("marketplaces")

    .insert(marketplace)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar marketplace:",

      error

    );

    return null;

  }



  return normalizarMarketplace(data);


}









// ======================================
// ATUALIZAR MARKETPLACE
// ======================================

export async function atualizarMarketplace(

  id:string,

  marketplace:Partial<Marketplace>

):Promise<Marketplace | null>{


  const {

    data,

    error

  } = await supabase

    .from("marketplaces")

    .update(marketplace)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar marketplace:",

      error

    );

    return null;

  }



  return normalizarMarketplace(data);


}









// ======================================
// EXCLUIR MARKETPLACE
// ======================================

export async function excluirMarketplace(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("marketplaces")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir marketplace:",

      error

    );

    return false;

  }



  return true;


}
