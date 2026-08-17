interface InputProps {

label?:string;

type?:string;

value:string | number;

onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;

placeholder?:string;

required?:boolean;

disabled?:boolean;

className?:string;

}



export default function Input({

label,

type="text",

value,

onChange,

placeholder,

required=false,

disabled=false,

className=""

}:InputProps){

return(

<div className="flex flex-col gap-2">

{label && (

<label className="text-sm font-medium text-gray-700">

{label}

</label>

)}

<input

type={type}

value={value}

onChange={onChange}

placeholder={placeholder}

required={required}

disabled={disabled}

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

transition

${className}

`}

/>

</div>

);

}