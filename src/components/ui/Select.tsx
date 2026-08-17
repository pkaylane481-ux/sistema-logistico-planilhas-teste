interface Option{

value:string;

label:string;

}

interface SelectProps{

label?:string;

value:string;

onChange:(e:React.ChangeEvent<HTMLSelectElement>)=>void;

options:Option[];

className?:string;

}



export default function Select({

label,

value,

onChange,

options,

className=""

}:SelectProps){

return(

<div className="flex flex-col gap-2">

{label &&

<label className="text-sm font-medium text-gray-700">

{label}

</label>

}

<select

value={value}

onChange={onChange}

className={`

w-full

rounded-lg

border

border-gray-300

px-4

py-2.5

focus:outline-none

focus:ring-2

focus:ring-purple-600

focus:border-purple-600

${className}

`}

>

<option value="">

Selecione...

</option>

{options.map(op=>(

<option

key={op.value}

value={op.value}

>

{op.label}

</option>

))}

</select>

</div>

);

}