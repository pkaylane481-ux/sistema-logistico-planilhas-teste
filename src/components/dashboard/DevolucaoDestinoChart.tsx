import { useMemo } from "react";


interface Props {

  devolucoes:any[];

}



export default function DevolucaoDestinoChart({

  devolucoes

}:Props){


const dados = useMemo(()=>{


const lista = devolucoes || [];



const reenviado = lista.filter(item =>

item.status === "Enviado" ||

item.decisao_final === "Reenviado"

).length;



const estornado = lista.filter(item =>

item.status === "Estoque" ||

item.decisao_final === "Estornado"

).length;



const cancelado = lista.filter(item =>

item.status === "Cancelado"

).length;



return {

reenviado,

estornado,

cancelado

};



},[devolucoes]);



const total =

dados.reenviado +

dados.estornado +

dados.cancelado;



function percentual(valor:number){

if(total===0){

return 0;

}

return Math.round(

(valor / total) * 100

);

}



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

fontSize:"20px",

fontWeight:"bold",

marginBottom:"20px"

}}

>

Destino das Devoluções

</h2>



<div

style={{

display:"grid",

gridTemplateColumns:"repeat(3,1fr)",

gap:"20px"

}}

>


<Card

titulo="🔁 Reenviado"

valor={dados.reenviado}

percentual={percentual(dados.reenviado)}

cor="#16a34a"

/>



<Card

titulo="💰 Estornado"

valor={dados.estornado}

percentual={percentual(dados.estornado)}

cor="#dc2626"

/>



<Card

titulo="❌ Cancelado"

valor={dados.cancelado}

percentual={percentual(dados.cancelado)}

cor="#6b7280"

/>



</div>


</div>

);


}



function Card({

titulo,

valor,

percentual,

cor

}:{

titulo:string;

valor:number;

percentual:number;

cor:string;

}){


return (

<div

style={{

background:"#f9fafb",

padding:"18px",

borderRadius:"12px",

borderLeft:`6px solid ${cor}`

}}

>


<div>

{titulo}

</div>


<strong

style={{

fontSize:"28px",

color:cor

}}

>

{valor}

</strong>


<div

style={{

marginTop:"8px",

fontSize:"14px",

color:"#666"

}}

>

{percentual}% do total

</div>


</div>

);


}