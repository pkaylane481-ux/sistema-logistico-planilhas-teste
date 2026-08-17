import { useState } from "react";

function Operadores() {
  const [operadores, setOperadores] = useState([
    {
      id: 1,
      nome: "Kaylane",
      cargo: "Analista",
      ativo: true,
    },
  ]);

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");

  function adicionarOperador() {
    if (!nome || !cargo) return;

    setOperadores([
      ...operadores,
      {
        id: Date.now(),
        nome,
        cargo,
        ativo: true,
      },
    ]);

    setNome("");
    setCargo("");
  }

  function alterarStatus(id: number) {
    setOperadores(
      operadores.map((op) =>
        op.id === id
          ? { ...op, ativo: !op.ativo }
          : op
      )
    );
  }

  function excluir(id: number) {
    setOperadores(
      operadores.filter((op) => op.id !== id)
    );
  }

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-3xl font-bold text-purple-900">
          Operadores
        </h1>

        <p className="text-gray-600">
          Cadastro de operadores do sistema.
        </p>

      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            className="border rounded-lg p-3"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
          />

          <button
            onClick={adicionarOperador}
            className="bg-purple-700 text-white rounded-lg"
          >
            Adicionar
          </button>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Nome
              </th>

              <th className="text-left p-4">
                Cargo
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-center p-4">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {operadores.map((op) => (

              <tr
                key={op.id}
                className="border-t"
              >

                <td className="p-4">
                  {op.nome}
                </td>

                <td className="p-4">
                  {op.cargo}
                </td>

                <td className="p-4">

                  {op.ativo ? (
                    <span className="text-green-600 font-semibold">
                      Ativo
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inativo
                    </span>
                  )}

                </td>

                <td className="p-4">

                  <div className="flex gap-2 justify-center">

                    <button
                      onClick={() => alterarStatus(op.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Alterar
                    </button>

                    <button
                      onClick={() => excluir(op.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Excluir
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Operadores;