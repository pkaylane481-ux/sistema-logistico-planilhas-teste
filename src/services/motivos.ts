import { supabase } from "./supabase";

import type {
  Motivo
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarMotivo(
  item:any
):Motivo {

  return {

    ...item,

    id:String(item.id)

  };

}





// ======================================
// LISTAR MOTIVOS
// ======================================

export async function listarMotivos(): Promise<Motivo[]> {


  const {

    data,

    error

  } = await supabase

    .from("motivos")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar motivos:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarMotivo);


}








// ======================================
// BUSCAR MOTIVO
// ======================================

export async function buscarMotivo(

  id:string

):Promise<Motivo | null>{


  const {

    data,

    error

  } = await supabase

    .from("motivos")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar motivo:",

      error

    );

    return null;

  }



  return normalizarMotivo(data);


}








// ======================================
// CRIAR MOTIVO
// ======================================

export async function criarMotivo(

  motivo:Partial<Motivo>

):Promise<Motivo | null>{


  const {

    data,

    error

  } = await supabase

    .from("motivos")

    .insert(motivo)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar motivo:",

      error

    );

    return null;

  }



  return normalizarMotivo(data);


}








// ======================================
// ATUALIZAR MOTIVO
// ======================================

export async function atualizarMotivo(

  id:string,

  motivo:Partial<Motivo>

):Promise<Motivo | null>{


  const {

    data,

    error

  } = await supabase

    .from("motivos")

    .update(motivo)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar motivo:",

      error

    );

    return null;

  }



  return normalizarMotivo(data);


}








// ======================================
// EXCLUIR MOTIVO
// ======================================

export async function excluirMotivo(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("motivos")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir motivo:",

      error

    );

    return false;

  }



  return true;


}
