interface ButtonProps {

children:React.ReactNode;

onClick?:()=>void;

type?:"button"|"submit"|"reset";

variant?:"primary"|"secondary"|"danger"|"success";

disabled?:boolean;

className?:string;

}



export default function Button({

children,

onClick,

type="button",

variant="primary",

disabled=false,

className=""

}:ButtonProps){



const colors={

primary:"bg-purple-700 hover:bg-purple-800 text-white",

secondary:"bg-gray-200 hover:bg-gray-300 text-gray-800",

success:"bg-green-600 hover:bg-green-700 text-white",

danger:"bg-red-600 hover:bg-red-700 text-white"

};



return(

<button

type={type}

onClick={onClick}

disabled={disabled}

className={`

px-5

py-2.5

rounded-lg

font-medium

transition-all

duration-200

shadow-sm

disabled:opacity-50

disabled:cursor-not-allowed

${colors[variant]}

${className}

`}

>

{children}

</button>

);

}