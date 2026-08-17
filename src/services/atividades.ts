import { supabase } from "./supabase";

import type {
  Atividade
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarAtividade(
  item:any
):Atividade {

  return {

    ...item,

    id:String(item.id)

  };

}






// ======================================
// LISTAR ATIVIDADES
// ======================================

export async function listarAtividades():Promise<Atividade[]> {


  const {

    data,

    error

  } = await supabase

    .from("atividades")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar atividades:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarAtividade);


}









// ======================================
// BUSCAR ATIVIDADE
// ======================================

export async function buscarAtividade(

  id:string

):Promise<Atividade | null>{


  const {

    data,

    error

  } = await supabase

    .from("atividades")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar atividade:",

      error

    );

    return null;

  }



  return normalizarAtividade(data);


}









// ======================================
// CRIAR ATIVIDADE
// ======================================

export async function criarAtividade(

  atividade:Partial<Atividade>

):Promise<Atividade | null>{


  const {

    data,

    error

  } = await supabase

    .from("atividades")

    .insert(atividade)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar atividade:",

      error

    );

    return null;

  }



  return normalizarAtividade(data);


}









// ======================================
// ATUALIZAR ATIVIDADE
// ======================================

export async function atualizarAtividade(

  id:string,

  atividade:Partial<Atividade>

):Promise<Atividade | null>{


  const {

    data,

    error

  } = await supabase

    .from("atividades")

    .update(atividade)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar atividade:",

      error

    );

    return null;

  }



  return normalizarAtividade(data);


}









// ======================================
// EXCLUIR ATIVIDADE
// ======================================

export async function excluirAtividade(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("atividades")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir atividade:",

      error

    );

    return false;

  }



  return true;


}
