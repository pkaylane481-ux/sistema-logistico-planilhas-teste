import { useState } from "react";
import { useSistema } from "../../context/SistemaContext";
import * as api from "../../services";

export default function Atividades() {

  const {
    atividades,
    carregarDados,
  } = useSistema();

  const [nome, setNome] = useState("");

  async function salvar() {

    if (!nome.trim()) {

      alert("Informe o nome da atividade.");

      return;

    }

    const resultado = await api.criarAtividade({

      nome,

    });

    if (!resultado) {

      alert("Erro ao cadastrar atividade.");

      return;

    }

    setNome("");

    await carregarDados();

    alert("Atividade cadastrada com sucesso!");

  }

  async function excluir(id: string) {

    if (!confirm("Deseja excluir esta atividade?")) {

      return;

    }

    const sucesso = await api.excluirAtividade(id);

    if (!sucesso) {

      alert("Erro ao excluir atividade.");

      return;

    }

    await carregarDados();

  }

  return (

    <div
      style={{
        padding: 25,
      }}
    >

      <h2>Atividades</h2>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 3px 10px rgba(0,0,0,.08)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 450,
        }}
      >

        <label>Nome</label>

        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da atividade"
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={salvar}
          style={{
            marginTop: 10,
            background: "#7B2FF7",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: 12,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cadastrar Atividade
        </button>

      </div>

      <div
        style={{
          marginTop: 30,
        }}
      >

        <h3>Atividades cadastradas</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >

          <thead>

            <tr>

              <th style={{ padding: 10 }}>
                Nome
              </th>

              <th style={{ padding: 10 }}>
                Ações
              </th>

            </tr>

          </thead>

          <tbody>
            
                      {atividades.map((atividade) => (

              <tr key={atividade.id}>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {atividade.nome}
                </td>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <button
                    onClick={() => excluir(atividade.id)}
                    style={{
                      background: "#E53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}
