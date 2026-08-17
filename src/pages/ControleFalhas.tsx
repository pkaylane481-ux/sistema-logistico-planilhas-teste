import { useState } from "react";
import { useSistema } from "../context/SistemaContext";


export default function ControleFalhas(){


const {

falhas,

adicionarFalha,

removerFalha,

transportadoras

}=useSistema() as any;





const [pedido,setPedido]=useState("");

const [tipo,setTipo]=useState("");

const [responsabilidade,setResponsabilidade]=useState<
"Interno" | "Transportadora" | "Cliente"
>("Interno");

const [transportadora,setTransportadora]=useState("");

const [responsavel,setResponsavel]=useState("");

const [status,setStatus]=useState("Aberto");

const [observacao,setObservacao]=useState("");






function salvar(){


if(!pedido || !tipo){

alert(
"Preencha pedido e tipo de falha"
);

return;

}




const novo={


id:Date.now(),

pedido,

tipo,

responsabilidade,

transportadora,

responsavel,

status,

observacao,

dataCadastro:

new Date().toLocaleDateString()


};





adicionarFalha(novo);





setPedido("");

setTipo("");

setResponsabilidade("Interno");

setTransportadora("");

setResponsavel("");

setStatus("Aberto");

setObservacao("");



}









return(

<div className="p-6">


<div

className="
w-full
bg-gradient-to-r
from-purple-900
to-purple-800
rounded-2xl
px-6
py-5
mb-6
shadow-sm
"

>

<div>

<h1

className="
text-2xl
font-bold
text-white
"

>

Controle de Falhas

</h1>


<p

className="
text-purple-200
text-sm
mt-1
"

>

Monitoramento de falhas operacionais e responsabilidades

</p>


</div>


</div>





<div

style={{

background:"#fff",

padding:"20px",

maxWidth:"700px",

display:"flex",

flexDirection:"column",

gap:"12px",

borderRadius:"12px"

}}

>



<label>

Pedido

</label>


<input

value={pedido}

onChange={(e)=>

setPedido(e.target.value)

}

placeholder="Número do pedido"

style={{

padding:"10px"

}}

/>







<label>

Tipo de Falha

</label>


<input

value={tipo}

onChange={(e)=>

setTipo(e.target.value)

}

placeholder="Ex: atraso, erro separação, extravio"

style={{

padding:"10px"

}}

/>







<label>

Responsabilidade

</label>


<select

value={responsabilidade}

onChange={(e)=>

setResponsabilidade(

e.target.value as

"Interno" |

"Transportadora" |

"Cliente"

)

}

style={{

padding:"10px"

}}

>


<option>

Interno

</option>


<option>

Transportadora

</option>


<option>

Cliente

</option>


</select>







<label>

Transportadora

</label>


<select

value={transportadora}

onChange={(e)=>

setTransportadora(e.target.value)

}

style={{

padding:"10px"

}}

>


<option value="">

Selecione

</option>



{

transportadoras.map((item: any)=>(


<option

key={item.id}

value={item.nome}

>

{item.nome}

</option>


))


}



</select>







<label>

Responsável pelo registro

</label>


<input

value={responsavel}

onChange={(e)=>

setResponsavel(e.target.value)

}

style={{

padding:"10px"

}}

/>







<label>

Status

</label>


<select

value={status}

onChange={(e)=>

setStatus(e.target.value)

}

style={{

padding:"10px"

}}

>


<option>

Aberto

</option>


<option>

Em análise

</option>


<option>

Resolvido

</option>


</select>







<label>

Observação

</label>


<textarea

value={observacao}

onChange={(e)=>

setObservacao(e.target.value)

}

style={{

padding:"10px"

}}

/>







<button

onClick={salvar}

style={{

padding:"12px",

background:"#8000ff",

color:"#fff",

border:"none",

borderRadius:"8px",

fontWeight:"bold"

}}

>

Registrar Falha

</button>







</div>









<div

style={{

marginTop:"30px"

}}

>


<h3>

Falhas registradas

</h3>






<table

style={{

width:"100%",

background:"#fff",

borderCollapse:"collapse"

}}

>


<thead>

<tr>


<th>

Pedido

</th>


<th>

Tipo

</th>


<th>

Responsabilidade

</th>


<th>

Status

</th>


<th>

Ação

</th>


</tr>

</thead>





<tbody>


{

falhas.map((item: any)=>(


<tr key={item.id}>


<td>

{item.pedido}

</td>


<td>

{item.tipo}

</td>


<td>

{item.responsabilidade}

</td>


<td>

{item.status}

</td>


<td>


<button

onClick={()=>removerFalha(item.id)}

style={{

background:"#e74c3c",

color:"#fff",

border:"none",

padding:"8px",

borderRadius:"6px"

}}

>

Excluir

</button>


</td>


</tr>


))


}





{

falhas.length===0 &&

<tr>

<td

colSpan={5}

style={{

padding:"15px",

textAlign:"center"

}}

>

Nenhuma falha registrada

</td>

</tr>

}



</tbody>


</table>






</div>






</div>


)


}
