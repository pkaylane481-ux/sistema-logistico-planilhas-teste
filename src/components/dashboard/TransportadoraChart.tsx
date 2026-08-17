import { useMemo } from "react";

interface Props {
  devolucoes: any[];
}

export default function TransportadoraChart({
  devolucoes
}: Props) {

  const ranking = useMemo(() => {

    const mapa = new Map<string, number>();

    devolucoes.forEach((item) => {

      const nome =
        item.transportadora ||
        "Não informada";

      mapa.set(
        nome,
        (mapa.get(nome) || 0) + 1
      );

    });

    const total = devolucoes.length;

    return [...mapa.entries()]
      .map(([transportadora, quantidade]) => ({

        transportadora,

        quantidade,

        percentual:
          total === 0
            ? 0
            : Number(
                (
                  quantidade /
                  total *
                  100
                ).toFixed(1)
              )

      }))
      .sort(
        (a, b) =>
          b.quantidade - a.quantidade
      );

  }, [devolucoes]);



  const getStatus = (percentual:number)=>{

    if(percentual >= 40){

      return {
        texto:"Crítico",
        cor:"bg-red-100 text-red-700"
      };

    }

    if(percentual >= 20){

      return{
        texto:"Atenção",
        cor:"bg-yellow-100 text-yellow-700"
      };

    }

    return{

      texto:"Controlado",
      cor:"bg-green-100 text-green-700"

    };

  };



  return (

    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Ranking de Transportadoras
          </h2>

          <p className="text-sm text-gray-500">
            Devoluções Logísticas por transportadora
          </p>

        </div>

        <span className="text-sm text-gray-500">
          {devolucoes.length} registros
        </span>

      </div>

      {

        ranking.length === 0 ?

        (

          <div className="py-16 text-center text-gray-400">

            Nenhuma devolução logística encontrada.

          </div>

        )

        :

        (

          <div className="space-y-4">

            {

              ranking.map((item,index)=>{

                const status =
                  getStatus(item.percentual);

                return(

                  <div
                    key={item.transportadora}
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between items-start">

                      <div>

                        <div className="flex items-center gap-3">

                          <span className="font-bold text-gray-500">

                            #{index+1}

                          </span>

                          <span className="font-semibold text-gray-800">

                            {item.transportadora}

                          </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-1">

                          {item.quantidade} devoluções

                        </p>

                      </div>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          ${status.cor}
                        `}
                      >

                        {status.texto}

                      </span>

                    </div>

                    <div className="mt-4">

                      <div className="flex justify-between text-sm mb-1">

                        <span>Participação</span>

                        <span>{item.percentual}%</span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">

                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width:`${item.percentual}%`
                          }}
                        />

                      </div>

                    </div>

                  </div>

                );

              })

            }

          </div>

        )

      }

    </div>

  );

}