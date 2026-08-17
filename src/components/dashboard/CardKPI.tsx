interface CardKPIProps {

titulo:string;

valor:number | string;

icone:string;

cor:string;

subtitulo:string;

}



function CardKPI({

titulo,

valor,

icone,

cor,

subtitulo

}:CardKPIProps){


return (

<div

className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${cor} hover:shadow-lg transition`}

>


<div className="flex items-center justify-between">


<div>


<p className="text-sm text-gray-500">

{titulo}

</p>



<h3 className="text-3xl font-bold text-gray-800 mt-2">

{valor ?? 0}

</h3>



<p className="text-sm text-gray-400 mt-1">

{subtitulo}

</p>


</div>



<div className="text-4xl">

{icone}

</div>



</div>


</div>

);

}


export default CardKPI;