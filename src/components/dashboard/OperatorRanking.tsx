import { useMemo } from "react";

interface Props {
  produtividade: any[];
}

export default function OperatorRanking({
  produtividade,
}: Props) {

  const ranking = useMemo(() => {

    const mapa = new Map<string, number>();

    produtividade.forEach((item) => {

      const operador =
        item.operador ??
        item.responsavel ??
        item.responsavel_nome ??
        "Não informado";

      const quantidade =
        Number(item.quantidade ?? 0);

      mapa.set(
        operador,
        (mapa.get(operador) || 0) + quantidade
      );

    });

    const lista = [...mapa.entries()]
      .map(([operador, quantidade]) => ({
        operador,
        quantidade,
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    const maior = lista[0]?.quantidade ?? 1;

    const total = lista.reduce(
      (acc, item) => acc + item.quantidade,
      0
    );

    return lista.map((item) => ({
      ...item,
      percentual: total === 0
        ? 0
        : Math.round((item.quantidade / total) * 100),
      largura: (item.quantidade / maior) * 100
    }));

  }, [produtividade]);

  function medalha(posicao: number) {

    switch (posicao) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${posicao + 1}º`;
    }

  }

  return (

    <div className="bg-white rounded-xl shadow-md p-6 h-full">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Ranking de Operadores
          </h2>

          <p className="text-sm text-gray-500">
            Produção acumulada no período
          </p>

        </div>

        <span className="text-sm text-gray-500">
          {ranking.length} operadores
        </span>

      </div>

      {ranking.length === 0 ? (

        <p className="text-gray-500">
          Nenhum registro encontrado.
        </p>

      ) : (

        <div className="space-y-5">

          {ranking.map((item, index) => (

            <div
              key={item.operador}
              className="border rounded-xl p-4 hover:shadow-md transition"
            >

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">

                  <span className="text-2xl">
                    {medalha(index)}
                  </span>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      {item.operador}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {item.percentual}% da produção
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-purple-700">
                    {item.quantidade}
                  </p>

                  <p className="text-xs text-gray-500">
                    atividades
                  </p>

                </div>

              </div>

              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">

                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.largura}%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}