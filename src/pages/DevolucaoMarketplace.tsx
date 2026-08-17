import { useState } from "react"
import { useSistema } from "../context/SistemaContext"



function DevolucaoMarketplace(){



const { marketplace,setMarketplace } = useSistema() as any



const [quantidade,setQuantidade] = useState("")
const [divergencia,setDivergencia] = useState("")
const [video,setVideo] = useState("")





function salvar(){


const novo = {


id:Date.now(),


data:

new Date()
.toISOString()
.split("T")[0],



quantidade:Number(quantidade),


divergencia,


video



}



setMarketplace([

...marketplace,

novo

])



setQuantidade("")
setDivergencia("")
setVideo("")


}







return(


<div>


<h1 className="text-3xl font-bold text-purple-950 mb-2">

📦 Devolução Marketplace

</h1>


<p className="text-gray-500 mb-8">

Controle de pacotes recebidos do marketplace

</p>








<div className="bg-white rounded-xl shadow p-6 mb-8">


<h2 className="text-xl font-bold mb-5">

Novo recebimento

</h2>







<input

className="border p-3 rounded w-full mb-4"

placeholder="Quantidade recebida"

value={quantidade}

onChange={(e)=>setQuantidade(e.target.value)}

 />







<select

className="border p-3 rounded w-full mb-4"

value={divergencia}

onChange={(e)=>setDivergencia(e.target.value)}

>


<option value="">

Possui divergência?

</option>


<option>

Sim

</option>


<option>

Não

</option>


</select>







<input

className="border p-3 rounded w-full mb-4"

placeholder="Link do vídeo de comprovação"

value={video}

onChange={(e)=>setVideo(e.target.value)}

 />








<button

onClick={salvar}

className="bg-purple-950 text-white px-6 py-3 rounded"

>

Salvar recebimento

</button>



</div>









<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-5">

Histórico Marketplace

</h2>






<table className="w-full">


<thead>


<tr className="border-b">


<th className="p-3">

Data

</th>


<th className="p-3">

Quantidade

</th>


<th className="p-3">

Divergência

</th>


<th className="p-3">

Vídeo

</th>


</tr>


</thead>






<tbody>


{marketplace.map((item: any)=>(


<tr

key={item.id}

className="border-b"

>


<td className="p-3">

{item.data}

</td>


<td className="p-3">

{item.quantidade}

</td>


<td className="p-3">

{item.divergencia}

</td>


<td className="p-3">


{

item.video

?

<a

href={item.video}

target="_blank"

>

Visualizar

</a>

:

"-"

}


</td>


</tr>


))}



</tbody>



</table>



</div>




</div>


)

}



export default DevolucaoMarketplace
