import { supabase } from "./supabase";
import type {
  Operador
} from "../types";




// ======================================
// NORMALIZAR ID
// ======================================

function normalizarOperador(
  item:any
):Operador {

  return {

    ...item,

    id:String(item.id)

  };

}





// ======================================
// LISTAR OPERADORES
// ======================================

export async function listarOperadores():Promise<Operador[]> {


  const {

    data,

    error

  } = await supabase

    .from("operadores")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){

    console.error(

      "Erro ao listar operadores:",

      error

    );

    return [];

  }



  return (data ?? []).map(normalizarOperador);


}









// ======================================
// BUSCAR OPERADOR
// ======================================

export async function buscarOperador(

  id:string

):Promise<Operador | null>{


  const {

    data,

    error

  } = await supabase

    .from("operadores")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();



  if(error){

    console.error(

      "Erro ao buscar operador:",

      error

    );

    return null;

  }



  return normalizarOperador(data);


}









// ======================================
// CRIAR OPERADOR
// ======================================

export async function criarOperador(

  operador:Partial<Operador>

):Promise<Operador | null>{


  const {

    data,

    error

  } = await supabase

    .from("operadores")

    .insert(operador)

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao criar operador:",

      error

    );

    return null;

  }



  return normalizarOperador(data);


}









// ======================================
// ATUALIZAR OPERADOR
// ======================================

export async function atualizarOperador(

  id:string,

  operador:Partial<Operador>

):Promise<Operador | null>{


  const {

    data,

    error

  } = await supabase

    .from("operadores")

    .update(operador)

    .eq(

      "id",

      id

    )

    .select()

    .single();



  if(error){

    console.error(

      "Erro ao atualizar operador:",

      error

    );

    return null;

  }



  return normalizarOperador(data);


}









// ======================================
// EXCLUIR OPERADOR
// ======================================

export async function excluirOperador(

  id:string

):Promise<boolean>{


  const {

    error

  } = await supabase

    .from("operadores")

    .delete()

    .eq(

      "id",

      id

    );



  if(error){

    console.error(

      "Erro ao excluir operador:",

      error

    );

    return false;

  }



  return true;


}
