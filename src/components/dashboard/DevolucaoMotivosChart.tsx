import { useMemo } from "react";


interface Props {

  devolucoes:any[];

}



export default function DevolucaoMotivosChart({

  devolucoes

}:Props){



const ranking = useMemo(()=>{


const mapa:Record<string,number> = {};



(devolucoes || []).forEach(item=>{


const motivo =

item.motivo || "Não informado";



mapa[motivo] =

(mapa[motivo] || 0) + 1;



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

📌 Principais Motivos das Devoluções

</h2>



{

ranking.length === 0 ?


<p>

Nenhum dado disponível.

</p>


:

ranking.map(([motivo,quantidade],index)=>(


<div

key={motivo}

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

{index+1}º {motivo}

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