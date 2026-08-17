import { useState } from "react";
import { useSistema } from "../../context/SistemaContext";
import * as api from "../../services";

export default function Usuarios() {
  const {
    usuarios,
    carregarDados,
  } = useSistema();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("Analista");
  const [ativo, setAtivo] = useState(true);

  async function salvar() {
    if (!nome.trim() || !email.trim()) {
      alert("Preencha nome e e-mail.");
      return;
    }

    const usuario = {
      nome,
      email,
      perfil,
      ativo,
    };

    const resultado = await api.criarUsuario(usuario);

    if (!resultado) {
      alert("Erro ao cadastrar usuário.");
      return;
    }

    setNome("");
    setEmail("");
    setPerfil("Analista");
    setAtivo(true);

    await carregarDados();

    alert("Usuário cadastrado com sucesso!");
  }

  async function excluir(id: string) {
    if (!confirm("Deseja realmente excluir este usuário?")) {
      return;
    }

    const sucesso = await api.excluirUsuario(id);

    if (!sucesso) {
      alert("Erro ao excluir usuário.");
      return;
    }

    await carregarDados();
  }

  return (
    <div style={{ padding: 25 }}>

      <h2>Usuários</h2>

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
          placeholder="Nome"
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <label>E-mail</label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <label>Perfil</label>

        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option>Administrador</option>
          <option>Gestor</option>
          <option>Analista</option>
          <option>Operador</option>
        </select>

        <label>Status</label>

        <select
          value={ativo ? "Ativo" : "Inativo"}
          onChange={(e) => setAtivo(e.target.value === "Ativo")}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        >
          <option>Ativo</option>
          <option>Inativo</option>
        </select>

        <button
          onClick={salvar}
          style={{
            background: "#7B2FF7",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: 12,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cadastrar Usuário
        </button>

      </div>

      <div style={{ marginTop: 30 }}>

        <h3>Usuários cadastrados</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >

          <thead>

            <tr>

              <th style={{ padding: 10 }}>Nome</th>

              <th style={{ padding: 10 }}>Email</th>

              <th style={{ padding: 10 }}>Perfil</th>

              <th style={{ padding: 10 }}>Status</th>

              <th style={{ padding: 10 }}>Ações</th>

            </tr>

          </thead>

          <tbody>
            
                      {usuarios.map((usuario) => (

              <tr key={usuario.id}>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {usuario.nome}
                </td>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {usuario.email}
                </td>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {usuario.perfil}
                </td>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </td>

                <td
                  style={{
                    padding: 10,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <button
                    onClick={() => excluir(usuario.id)}
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