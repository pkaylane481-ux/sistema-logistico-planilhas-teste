import { useMemo } from "react";

interface Props {

  trocas: any[];

  devolucoesLogistica: any[];

  devolucaoMarketplace: any[];

  prioridades: any[];

  falhas: any[];

  produtividade: any[];

  slas: any[];

}


export default function ExecutiveCards({

  trocas,

  devolucoesLogistica,

  devolucaoMarketplace,

  prioridades,

  falhas,

  produtividade,

  slas

}: Props) {


  const indicadores = useMemo(() => {


    const totalProdutividade =
      produtividade.reduce(
        (acc, item) =>
          acc + Number(item.quantidade ?? 0),
        0
      );


    const dentroSLA =
      slas.filter(
        item =>
          item.status === "Dentro do SLA"
      ).length;


    const percentualSLA =
      slas.length === 0
        ? 0
        : Math.round(
            (dentroSLA / slas.length) * 100
          );


    return {

      trocas:
        trocas.length,

      devolucoesLogistica:
        devolucoesLogistica.length,

      devolucaoMarketplace:
        devolucaoMarketplace.length,

      prioridades:
        prioridades.length,

      falhas:
        falhas.length,

      produtividade:
        totalProdutividade,

      sla:
        percentualSLA

    };


  }, [

    trocas,

    devolucoesLogistica,

    devolucaoMarketplace,

    prioridades,

    falhas,

    produtividade,

    slas

  ]);



  return (

    <div
      className="
        grid
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-7
        gap-5
      "
    >


      <Card

        titulo="Trocas e Devoluções
        (Troquecommerce)"

        valor={indicadores.trocas}

        cor="purple"

      />



      <Card

        titulo="Devoluções Logísticas"

        valor={indicadores.devolucoesLogistica}

        cor="blue"

      />



      <Card

        titulo="Devoluções Marketplace"

        valor={indicadores.devolucaoMarketplace}

        cor="cyan"

      />



      <Card

        titulo="Pedidos Prioridade"

        valor={indicadores.prioridades}

        cor="amber"

      />



      <Card

        titulo="Falhas Operacionais"

        valor={indicadores.falhas}

        cor="red"

      />



      <Card

        titulo="Produtividade"

        valor={indicadores.produtividade}

        cor="green"

      />



      <Card

        titulo="SLA"

        valor={`${indicadores.sla}%`}

        cor="indigo"

      />


    </div>

  );

}




interface CardProps {

  titulo:string;

  valor:number|string;

  cor:
  | "purple"
  | "blue"
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "indigo";

}




function Card({

  titulo,

  valor,

  cor

}:CardProps){



const cores = {


purple:{
bg:"bg-purple-50",
border:"border-purple-200",
text:"text-purple-700"
},


blue:{
bg:"bg-blue-50",
border:"border-blue-200",
text:"text-blue-700"
},


cyan:{
bg:"bg-cyan-50",
border:"border-cyan-200",
text:"text-cyan-700"
},


green:{
bg:"bg-green-50",
border:"border-green-200",
text:"text-green-700"
},


amber:{
bg:"bg-amber-50",
border:"border-amber-200",
text:"text-amber-700"
},


red:{
bg:"bg-red-50",
border:"border-red-200",
text:"text-red-700"
},


indigo:{
bg:"bg-indigo-50",
border:"border-indigo-200",
text:"text-indigo-700"
}


};


const estilo = cores[cor];



return (

<div

className={`
${estilo.bg}
${estilo.border}
border
rounded-xl
p-4
shadow-sm
hover:shadow-md
transition
min-h-[120px]
flex
flex-col
justify-between
`}

>


<p
className="
text-sm
font-medium
text-gray-600
leading-tight
"
>

{titulo}

</p>



<h3

className={`
text-3xl
font-bold
mt-3
${estilo.text}
`}

>

{valor}

</h3>



</div>

);


}