import { supabase } from "./supabase";


// ======================================
// LISTAR SLAs
// ======================================

export async function listarSLAs(){

  const { data, error } = await supabase
    .from("slas")
    .select("*")
    .order("id");

  if(error){
    console.error("Erro ao listar SLAs:", error);
    throw error;
  }

  return data || [];

}


// ======================================
// CRIAR SLA
// ======================================

export async function criarSLA(sla:any){

  const {data,error}=await supabase
    .from("slas")
    .insert(sla)
    .select()
    .single();


  if(error){
    console.error("Erro ao criar SLA:",error);
    throw error;
  }


  return data;

}


// ======================================
// ATUALIZAR SLA
// ======================================

export async function atualizarSLA(
 id:string,
 dados:any
){

  const {data,error}=await supabase
    .from("slas")
    .update(dados)
    .eq("id",id)
    .select()
    .single();


  if(error){
    console.error("Erro ao atualizar SLA:",error);
    throw error;
  }


  return data;

}


// ======================================
// EXCLUIR SLA
// ======================================

export async function excluirSLA(id:string){

  const {error}=await supabase
    .from("slas")
    .delete()
    .eq("id",id);


  if(error){
    console.error("Erro ao excluir SLA:",error);
    throw error;
  }

  return true;


}
