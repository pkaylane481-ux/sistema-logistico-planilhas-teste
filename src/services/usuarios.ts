import { supabase } from "./supabase";

import type {
  Usuario
} from "../types";



// ======================================
// LISTAR USUÁRIOS
// ======================================

export async function listarUsuarios(): Promise<Usuario[]> {


  const {
    data,
    error

  } = await supabase

    .from("usuarios")

    .select("*")

    .order("created_at", {
      ascending: false
    });



  if(error){

    console.error(
      "Erro ao listar usuários:",
      error
    );

    return [];

  }



  return data ?? [];

}




// ======================================
// CRIAR USUÁRIO
// ======================================

export async function criarUsuario(
  usuario: Partial<Usuario>
){


  const {
    data,
    error

  } = await supabase

    .from("usuarios")

    .insert(usuario)

    .select()

    .single();



  if(error){

    console.error(
      "Erro ao criar usuário:",
      error
    );

    return null;

  }



  return data;


}





// ======================================
// ATUALIZAR USUÁRIO
// ======================================

export async function atualizarUsuario(
  id:string,
  usuario:Partial<Usuario>
){


  const {
    data,
    error

  } = await supabase

    .from("usuarios")

    .update(usuario)

    .eq("id", id)

    .select()

    .single();



  if(error){

    console.error(
      "Erro ao atualizar usuário:",
      error
    );

    return null;

  }



  return data;


}





// ======================================
// EXCLUIR USUÁRIO
// ======================================

export async function excluirUsuario(
  id:string
){


  const {
    error

  } = await supabase

    .from("usuarios")

    .delete()

    .eq("id", id);



  if(error){

    console.error(
      "Erro ao excluir usuário:",
      error
    );

    return false;

  }



  return true;


}