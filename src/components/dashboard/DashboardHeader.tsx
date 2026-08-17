import { useMemo } from "react";


interface Props {

  trocas: any[];

  devolucoesLogistica: any[];

  falhas: any[];

  prioridades: any[];

  produtividade: any[];

  slas: any[];

  operadores: any[];

}



export default function DashboardHeader({

  trocas,

  devolucoesLogistica,

  falhas,

  prioridades,

  produtividade,

  slas,

  operadores

}: Props) {

  const agora = useMemo(() => new Date(), []);


  const saudacao = useMemo(() => {
    const hora = new Date().getHours();

    if (hora < 12)
      return "Bom dia";

    if (hora < 18)
      return "Boa tarde";

    return "Boa noite";


  }, []);




  const resumo = useMemo(() => {


    const totalProcessos =

      trocas.length +

      devolucoesLogistica.length +

      prioridades.length +

      falhas.length;



    const operadoresAtivos = new Set(

      produtividade

        .map(item => item.operador)

        .filter(Boolean)

    ).size;




    const foraSLA = slas.filter(

      item => item.status === "Fora do SLA"

    ).length;




    let status = "Operação Normal";

    let cor = "text-green-600 bg-green-100";



    if (foraSLA >= 10) {

      status = "Operação Crítica";

      cor = "text-red-600 bg-red-100";


    } else if (foraSLA >= 5) {

      status = "Operação em Atenção";

      cor = "text-yellow-700 bg-yellow-100";

    }



    return {

      totalProcessos,

      operadoresAtivos,

      status,

      cor

    };


  }, [

    trocas,

    devolucoesLogistica,

    prioridades,

    falhas,

    produtividade,

    slas

  ]);




return (

<div className="
bg-white
rounded-xl
shadow-sm
border
border-gray-200
p-6
">


<div className="
flex
flex-col
lg:flex-row
justify-between
gap-6
">


<div>


<p className="text-sm text-gray-500">

{saudacao}

</p>



<h1 className="
text-3xl
font-bold
text-gray-800
mt-1
">

Dashboard Executivo Logístico

</h1>



<p className="text-gray-500 mt-2">

Visão consolidada da operação logística

</p>


</div>




<div className="
flex
flex-wrap
gap-4
">


<InfoCard

titulo="Processos"

valor={resumo.totalProcessos}

/>



<InfoCard

titulo="Operadores Ativos"

valor={resumo.operadoresAtivos}

/>



<InfoCard

titulo="Operadores Cadastrados"

valor={operadores.length}

/>



<div className={`rounded-xl px-5 py-4 ${resumo.cor}`}>

<p className="text-xs">

Status da Operação

</p>


<h3 className="font-bold text-lg mt-1">

{resumo.status}

</h3>


</div>


</div>


</div>




<div className="
border-t
mt-6
pt-4
flex
flex-col
md:flex-row
justify-between
text-sm
text-gray-500
">


<span>

Última atualização:

{" "}

{agora.toLocaleDateString("pt-BR")}

às

{" "}

{agora.toLocaleTimeString("pt-BR", {

hour:"2-digit",

minute:"2-digit"

})}


</span>



<span>

Sistema de Gestão Logística • Dashboard Executivo

</span>



</div>


</div>

);


}




interface InfoCardProps {

titulo:string;

valor:string | number;

}



function InfoCard({

titulo,

valor

}:InfoCardProps){


return (

<div className="
bg-gray-50
border
border-gray-200
rounded-xl
px-5
py-4
min-w-[170px]
">


<p className="text-xs text-gray-500">

{titulo}

</p>


<h3 className="
text-2xl
font-bold
text-gray-800
mt-1
">

{valor}

</h3>


</div>

);


}
