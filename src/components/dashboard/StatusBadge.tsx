interface Props {

  texto: string;

  tipo?: "success" | "warning" | "danger" | "info";

}

export default function StatusBadge({

  texto,

  tipo = "info"

}: Props) {

  const cores = {

    success:
      "bg-green-100 text-green-700",

    warning:
      "bg-yellow-100 text-yellow-700",

    danger:
      "bg-red-100 text-red-700",

    info:
      "bg-purple-100 text-purple-700"

  };

  return (

    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${cores[tipo]}
      `}
    >

      {texto}

    </span>

  );

}