interface Props {

  value: number;

}

export default function ProgressBar({

  value

}: Props) {

  const percentual =

    Math.max(

      0,

      Math.min(100, value)

    );

  return (

    <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">

      <div

        className="h-full bg-purple-600 transition-all duration-500"

        style={{

          width: `${percentual}%`

        }}

      />

    </div>

  );

}