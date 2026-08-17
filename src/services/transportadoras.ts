import { supabase } from "./supabase";

import type {
  Transportadora
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarTransportadora(
  item:any
):Transportadora {

  return {

    ...item,

    id:String(item.id)

  };

}






// ======================================
// LISTAR TRANSPORTADORAS
// ======================================

export async function listarTransportadoras():Promise<Transportadora[]> {


  const {

    data,

    error

  } = await supabase

    .from("transportadoras")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar transportadoras:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarTransportadora);


}









// ======================================
// BUSCAR TRANSPORTADORA
// ======================================

export async function buscarTransportadora(

  id:string

):Promise<Transportadora | null>{


  const {

    data,

    error

  } = await supabase

    .from("transportadoras")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar transportadora:",

      error

    );

    return null;

  }



  return normalizarTransportadora(data);


}









// ======================================
// CRIAR TRANSPORTADORA
// ======================================

export async function criarTransportadora(

  transportadora:Partial<Transportadora>

):Promise<Transportadora | null>{


  const {

    data,

    error

  } = await supabase

    .from("transportadoras")

    .insert(transportadora)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar transportadora:",

      error

    );

    return null;

  }



  return normalizarTransportadora(data);


}









// ======================================
// ATUALIZAR TRANSPORTADORA
// ======================================

export async function atualizarTransportadora(

  id:string,

  transportadora:Partial<Transportadora>

):Promise<Transportadora | null>{


  const {

    data,

    error

  } = await supabase

    .from("transportadoras")

    .update(transportadora)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar transportadora:",

      error

    );

    return null;

  }



  return normalizarTransportadora(data);


}









// ======================================
// EXCLUIR TRANSPORTADORA
// ======================================

export async function excluirTransportadora(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("transportadoras")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir transportadora:",

      error

    );

    return false;

  }



  return true;


}
