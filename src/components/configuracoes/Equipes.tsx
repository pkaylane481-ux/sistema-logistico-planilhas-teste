import { useState } from "react";

interface Equipe {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

function Equipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([
    {
      id: 1,
      nome: "Operações",
      descricao: "Equipe responsável pelas devoluções logísticas",
      ativo: true,
    },
  ]);

  const [novaEquipe, setNovaEquipe] = useState({
    nome: "",
    descricao: "",
  });

  function adicionarEquipe() {
    if (!novaEquipe.nome) return;

    setEquipes([
      ...equipes,
      {
        id: Date.now(),
        nome: novaEquipe.nome,
        descricao: novaEquipe.descricao,
        ativo: true,
      },
    ]);

    setNovaEquipe({
      nome: "",
      descricao: "",
    });
  }

  function alterarStatus(id: number) {
    setEquipes(
      equipes.map((e) =>
        e.id === id
          ? { ...e, ativo: !e.ativo }
          : e
      )
    );
  }

  function excluir(id: number) {
    setEquipes(
      equipes.filter((e) => e.id !== id)
    );
  }

  return (
    <div className="space-y-6">

      <div>

        <h2 className="text-2xl font-bold text-purple-900">
          Equipes
        </h2>

        <p className="text-gray-500">
          Cadastro das equipes da empresa.
        </p>

      </div>

      <div className="bg-gray-50 rounded-xl p-6">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            className="border rounded-lg p-3"
            placeholder="Nome da equipe"
            value={novaEquipe.nome}
            onChange={(e) =>
              setNovaEquipe({
                ...novaEquipe,
                nome: e.target.value,
              })
            }
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Descrição"
            value={novaEquipe.descricao}
            onChange={(e) =>
              setNovaEquipe({
                ...novaEquipe,
                descricao: e.target.value,
              })
            }
          />

          <button
            onClick={adicionarEquipe}
            className="bg-purple-700 text-white rounded-lg"
          >
            Adicionar
          </button>

        </div>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-purple-900 text-white">

            <tr>

              <th className="text-left p-4">
                Nome
              </th>

              <th className="text-left p-4">
                Descrição
              </th>

              <th className="text-center p-4">
                Status
              </th>

              <th className="text-center p-4">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {equipes.map((equipe) => (

              <tr
                key={equipe.id}
                className="border-b"
              >

                <td className="p-4">
                  {equipe.nome}
                </td>

                <td className="p-4">
                  {equipe.descricao}
                </td>

                <td className="text-center">

                  {equipe.ativo ? (
                    <span className="text-green-600 font-semibold">
                      Ativa
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inativa
                    </span>
                  )}

                </td>

                <td>

                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => alterarStatus(equipe.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Status
                    </button>

                    <button
                      onClick={() => excluir(equipe.id)}
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

export default Equipes;