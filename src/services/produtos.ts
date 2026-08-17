import { supabase } from "./supabase";
import type { Produto } from "../types";

export async function listarProdutos(): Promise<Produto[]> {

  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .order("produto", { ascending: true });

  if (error) {
    console.error("Erro ao listar produtos:", error);
    return [];
  }

  return (data ?? []) as Produto[];
}

export async function criarProduto(
  produto: Pick<Produto, "sku" | "produto" | "cor" | "tamanho">
): Promise<Produto | null> {
  const { data, error } = await supabase
    .from("produtos")
    .insert({
      sku: produto.sku.trim().toUpperCase(),
      produto: produto.produto.trim(),
      cor: produto.cor.trim(),
      tamanho: produto.tamanho.trim()
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar produto:", error);
    return null;
  }

  return data as Produto;
}

export async function excluirProduto(id: string): Promise<boolean> {
  const { error } = await supabase.from("produtos").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir produto:", error);
    return false;
  }

  return true;
}
