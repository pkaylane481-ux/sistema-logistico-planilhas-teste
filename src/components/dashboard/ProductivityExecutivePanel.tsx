import { useMemo } from "react";

interface Props {

  produtividade: any[];

  trocas: any[];

  devolucoesLogistica: any[];

  prioridades: any[];

  falhas: any[];

}

export default function ProductivityExecutivePanel({

  produtividade,

  trocas,

  devolucoesLogistica,

  prioridades,

  falhas

}: Props) {


  const indicadores = useMemo(() => {


    const totalAtividades = produtividade.reduce(
      (total, item) =>
        total + Number(item.quantidade ?? 0),
      0
    );


    const mapaOperadores = produtividade.reduce<Record<string, number>>(
      (acc, item) => {


        const operador =
          item.operador ??
          item.responsavel ??
          item.responsavel_nome ??
          "Não informado";


        acc[operador] =
          (acc[operador] ?? 0) +
          Number(item.quantidade ?? 0);


        return acc;


      },
      {}
    );



    const ranking = Object.entries(mapaOperadores)
      .sort((a,b)=> b[1]-a[1]);



    const operadoresAtivos =
      Object.keys(mapaOperadores).length;



    const mediaOperador =
      operadoresAtivos === 0
        ? 0
        : Math.round(
            totalAtividades / operadoresAtivos
          );



    return {


      totalAtividades,


      operadoresAtivos,


      mediaOperador,


      melhorOperador:
        ranking[0]?.[0] ?? "-",


      melhorQuantidade:
        ranking[0]?.[1] ?? 0


    };


  }, [produtividade]);





  /*
    Acompanhamento operacional

    Aqui usamos a própria produção registrada.
    Depois podemos ligar com SLA/pedidos pendentes.
  */

const acompanhamento = useMemo(()=>{


  const statusPendentes = [
    "Em andamento",
    "Pendente",
    "Recebido",
    "Em contato",
    "Reenviar"
  ];


  const statusFinalizados = [
    "Enviado",
    "Concluido",
    "Concluído",
    "Finalizado",
    "finalizado",
    "Estoque",
    "Para estoque"
  ];


  const contarStatus = (
    lista:any[],
    status:any[]
  ) => {

    return lista.filter(item =>
      status.includes(item.status)
    ).length;

  };



  const totalAProcessar =

    contarStatus(
      trocas,
      statusPendentes
    )

    +

    contarStatus(
      devolucoesLogistica,
      statusPendentes
    )

    +

    contarStatus(
      prioridades,
      statusPendentes
    )

    +

    contarStatus(
      falhas,
      statusPendentes
    );



  const finalizados =

    contarStatus(
      trocas,
      statusFinalizados
    )

    +

    contarStatus(
      devolucoesLogistica,
      statusFinalizados
    )

    +

    contarStatus(
      prioridades,
      statusFinalizados
    )

    +

    contarStatus(
      falhas,
      statusFinalizados
    );



  const totalOperacao =
    totalAProcessar + finalizados;



  const percentual =

    totalOperacao === 0

      ? 0

      :

      Math.round(
        (finalizados / totalOperacao) * 100
      );



  return {

    totalAProcessar,

    finalizados,

    pendentes:
      totalAProcessar,

    percentual

  };


},[
  trocas,
  devolucoesLogistica,
  prioridades,
  falhas
]);





  const corBarra =
    acompanhamento.percentual >= 80
      ? "bg-green-500"
      :
      acompanhamento.percentual >= 50
      ? "bg-yellow-500"
      :
      "bg-red-500";



return (

<div className="bg-white rounded-xl shadow-md p-6">


<div className="flex justify-between items-center mb-6">


<div>

<h2 className="text-2xl font-bold text-gray-800">
Produtividade Geral
</h2>


<p className="text-sm text-gray-500">
Indicadores consolidados do período filtrado
</p>


</div>


</div>





<div className="grid grid-cols-2 xl:grid-cols-5 gap-5">


<Card
titulo="Atividades"
valor={indicadores.totalAtividades}
/>


<Card
titulo="Operadores"
valor={indicadores.operadoresAtivos}
/>


<Card
titulo="Média"
valor={indicadores.mediaOperador}
/>


<Card
titulo="Melhor Operador"
valor={indicadores.melhorOperador}
/>


<Card
titulo="Produção Destaque"
valor={indicadores.melhorQuantidade}
/>


</div>





<div className="mt-8 bg-purple-50 rounded-xl p-6">


<h3 className="text-lg font-bold text-gray-800 mb-4">
Acompanhamento da Operação
</h3>


<div className="flex justify-between text-sm mb-2">


<span>
Concluído
</span>


<span className="font-bold">
{acompanhamento.percentual}%
</span>


</div>




<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">


<div

className={`${corBarra} h-4 rounded-full transition-all`}

style={{

width:`${acompanhamento.percentual}%`

}}

/>


</div>





<div className="grid grid-cols-3 gap-4 mt-6">


<Card
titulo="Total a Tratar"
valor={acompanhamento.totalAProcessar}
/>


<Card
titulo="Finalizados"
valor={acompanhamento.finalizados}
/>


<Card
titulo="Pendentes"
valor={acompanhamento.pendentes}
/>


</div>


</div>






</div>


);


}





interface CardProps {

titulo:string;

valor:string|number;

}


function Card({

titulo,

valor

}:CardProps){


return (

<div className="bg-gray-50 border border-gray-200 rounded-xl p-5">


<p className="text-sm text-gray-500">

{titulo}

</p>


<h3 className="text-3xl font-bold text-gray-800 mt-2">

{valor}

</h3>


</div>


);


}