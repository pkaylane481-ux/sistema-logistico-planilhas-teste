import { useMemo } from "react";


interface Props {

  devolucoes:any[];

}



export default function DevolucaoTransportadorasChart({

  devolucoes

}:Props){



const ranking = useMemo(()=>{


const mapa:Record<string,number> = {};



(devolucoes || []).forEach(item=>{


const transportadora =

item.transportadora || "Não informado";



mapa[transportadora] =

(mapa[transportadora] || 0) + 1;



});



return Object.entries(mapa)

.sort((a,b)=>b[1]-a[1])

.slice(0,5);



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

fontSize:"20px",

fontWeight:"bold",

marginBottom:"20px"

}}

>

🚚 Transportadoras com mais devoluções

</h2>



{

ranking.length === 0 ?


<p>

Nenhum dado disponível.

</p>


:

ranking.map(([transportadora,quantidade],index)=>(


<div

key={transportadora}

style={{

display:"flex",

justifyContent:"space-between",

padding:"12px",

marginBottom:"8px",

background:"#f9fafb",

borderRadius:"10px"

}}

>


<span>

{index+1}º {transportadora}

</span>


<strong>

{quantidade}

</strong>


</div>


))


}



</div>

);


}