import React from "react";

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;

  children?: React.ReactNode;

  onAtualizar?: () => void;
  onExportar?: () => void;
}

export default function PageHeader({
  titulo,
  subtitulo,
  children,
  onAtualizar,
  onExportar,
}: PageHeaderProps) {
  return (
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
        flex
        items-center
        justify-between
        shadow-sm
      "
    >

      {/* TÍTULO */}
      <div>
        <h1
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          {titulo}
        </h1>

        {subtitulo && (
          <p
            className="
              text-purple-200
              text-sm
              mt-1
            "
          >
            {subtitulo}
          </p>
        )}
      </div>


      {/* FILTROS + AÇÕES */}
      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {children}


        {onExportar && (
          <button
            onClick={onExportar}
            className="
              px-4
              py-2
              rounded-lg
              bg-white
              text-purple-800
              font-semibold
              hover:bg-purple-100
              transition
            "
          >
            Exportar
          </button>
        )}


        {onAtualizar && (
          <button
            onClick={onAtualizar}
            className="
              px-4
              py-2
              rounded-lg
              bg-yellow-400
              text-purple-900
              font-semibold
              hover:bg-yellow-300
              transition
            "
          >
            Atualizar
          </button>
        )}

      </div>

    </div>
  );
}