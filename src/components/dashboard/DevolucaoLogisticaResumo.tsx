import { useMemo } from "react";


interface Props {

  devolucoes: any[];

}



export default function DevolucaoLogisticaResumo({

  devolucoes

}: Props) {


const indicadores = useMemo(()=>{


const lista = devolucoes || [];



const total = lista.length;



const reenviados = lista.filter(item =>

  item.status === "Enviado" ||

  item.decisao_final === "Reenviado"

).length;



const estornados = lista.filter(item =>

  item.status === "Estoque" ||

  item.decisao_final === "Estornado"

).length;



const emTratamento = lista.filter(item =>

[

"Recebido",

"Em contato",

"Reenviar",

"Para estoque",

"Pendente",

"Em andamento"

]

.includes(item.status)

).length;



const finalizados = lista.filter(item =>

[

"Enviado",

"Concluido",

"Concluído",

"Finalizado",

"Estoque",

"Para estoque"

]

.includes(item.status)

).length;



const taxaReenvio = total === 0

? 0

: Math.round(

(reenviados / total) * 100

);



const taxaEstorno = total === 0

? 0

: Math.round(

(estornados / total) * 100

);



return {

total,

reenviados,

estornados,

emTratamento,

finalizados,

taxaReenvio,

taxaEstorno

};



},[devolucoes]);





return (

<div

style={{

background:"#fff",

padding:"25px",

borderRadius:"14px",

boxShadow:"0 3px 10px rgba(0,0,0,.08)",

marginBottom:"25px"

}}

>


<h2

style={{

fontSize:"22px",

fontWeight:"bold",

marginBottom:"20px"

}}

>

📦 Resumo Executivo - Devolução Logística

</h2>



<div

style={{

display:"grid",

gridTemplateColumns:"repeat(6,1fr)",

gap:"15px"

}}

>



<Card

titulo="Total"

valor={indicadores.total}

cor="#2563eb"

/>



<Card

titulo="Em Tratamento"

valor={indicadores.emTratamento}

cor="#f59e0b"

/>



<Card

titulo="Finalizados"

valor={indicadores.finalizados}

cor="#16a34a"

/>



<Card

titulo="🔁 Reenviados"

valor={`${indicadores.reenviados} (${indicadores.taxaReenvio}%)`}

cor="#7c3aed"

/>



<Card

titulo="💰 Estornados"

valor={`${indicadores.estornados} (${indicadores.taxaEstorno}%)`}

cor="#dc2626"

/>



<Card

titulo="Recuperação"

valor={`${indicadores.taxaReenvio}%`}

cor="#0891b2"

/>



</div>



</div>

);


}





function Card({

titulo,

valor,

cor

}:{

titulo:string;

valor:number | string;

cor:string;

}){


return(

<div

style={{

background:"#fff",

borderLeft:`6px solid ${cor}`,

padding:"18px",

borderRadius:"12px",

boxShadow:"0 3px 10px rgba(0,0,0,.08)"

}}

>


<div

style={{

fontSize:"14px",

color:"#666"

}}

>

{titulo}

</div>


<div

style={{

fontSize:"34px",

fontWeight:"bold",

color:cor

}}

>

{valor}

</div>


</div>

);


}
