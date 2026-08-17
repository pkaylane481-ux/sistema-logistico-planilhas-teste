import { supabase } from "./supabase";

import type {
  Prioridade
} from "../types";




// ======================================
// LISTAR PEDIDOS PRIORIDADE
// ======================================

export async function listarPrioridades(): Promise<Prioridade[]> {


  const {

    data,

    error

  } = await supabase

    .from("pedidos_prioridade")

    .select("*")

    .order(

      "created_at",

      {

        ascending:false

      }

    );



  if(error){


    console.error(

      "Erro ao listar pedidos prioridade:",

      error

    );


    return [];


  }



  return (data ?? []) as Prioridade[];


}









// ======================================
// BUSCAR PRIORIDADE POR ID
// ======================================

export async function buscarPrioridade(

  id:string

):Promise<Prioridade | null>{



  const {

    data,

    error

  } = await supabase

    .from("pedidos_prioridade")

    .select("*")

    .eq(

      "id",

      id

    )

    .single();





  if(error){


    console.error(

      "Erro ao buscar prioridade:",

      error

    );


    return null;


  }





  return data as Prioridade;


}









// ======================================
// CRIAR PEDIDO PRIORIDADE
// ======================================

export async function criarPrioridade(

  prioridade:Partial<Prioridade>

):Promise<Prioridade | null>{



const registro = {
  pedido: prioridade.pedido,
  cliente: prioridade.cliente,
  prioridade: prioridade.prioridade,
  motivo: prioridade.motivo,
  responsavel: prioridade.responsavel,
  status: prioridade.status,
  data: prioridade.data,
  usuario_id: prioridade.usuario_id,
  tipo: prioridade.tipo,
  observacao: prioridade.observacao,
  data_entrada: prioridade.data_entrada,
  data_cadastro: new Date().toISOString()
};


const { data, error } = await supabase
  .from("pedidos_prioridade")
  .insert(registro)
  .select()
  .single();





  if(error){


    console.error(

      "Erro ao criar pedido prioridade:",

      error

    );


    return null;


  }





  return data as Prioridade;


}









// ======================================
// ATUALIZAR PEDIDO PRIORIDADE
// ======================================

export async function atualizarPrioridade(

  id:string,

  prioridade:Partial<Prioridade>

):Promise<Prioridade | null>{



  const {

    data,

    error

  } = await supabase

    .from("pedidos_prioridade")

    .update({

      ...prioridade

    })

    .eq(

      "id",

      id

    )

    .select()

    .single();





  if(error){


    console.error(

      "Erro ao atualizar prioridade:",

      error

    );


    return null;


  }





  return data as Prioridade;


}









// ======================================
// ATUALIZAR STATUS
// ======================================

export async function atualizarStatusPrioridade(

  id:string,

  status:string

):Promise<Prioridade | null>{



  const {

    data,

    error

  } = await supabase

    .from("pedidos_prioridade")

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

      "Erro ao atualizar status prioridade:",

      error

    );


    return null;


  }





  return data as Prioridade;


}









// ======================================
// EXCLUIR PRIORIDADE
// ======================================

export async function excluirPrioridade(

  id:string

):Promise<boolean>{



  const {

    error

  } = await supabase

    .from("pedidos_prioridade")

    .delete()

    .eq(

      "id",

      id

    );





  if(error){


    console.error(

      "Erro ao excluir prioridade:",

      error

    );


    return false;


  }





  return true;


}
