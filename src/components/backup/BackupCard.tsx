import { useRef } from "react";
import { exportarBackup } from "./ExportBackup";
import { importarBackup } from "./ImportBackup";

export default function BackupCard() {

  const inputFile = useRef<HTMLInputElement>(null);

  function restaurarBackup() {

    const arquivo = inputFile.current?.files?.[0];

    if (!arquivo) {

      alert("Selecione um arquivo de backup.");

      return;

    }

    const confirmar = window.confirm(
      "Restaurar este backup substituirá todos os dados atuais do sistema.\n\nDeseja continuar?"
    );

    if (!confirmar) return;

    importarBackup(
      arquivo,

      () => {

        alert("Backup restaurado com sucesso!\n\nA página será recarregada.");

        window.location.reload();

      },

      (erro) => {

        alert(erro);

      }

    );

  }

  return (

    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-gray-800">

            Backup do Sistema

          </h2>

          <p className="text-sm text-gray-500 mt-1">

            Exporte ou restaure todos os dados da plataforma.

          </p>

        </div>

        <span className="text-4xl">💾</span>

      </div>

      <div className="space-y-4">

        <button
          onClick={exportarBackup}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white rounded-lg py-3 font-medium transition"
        >
          📥 Exportar Backup
        </button>

        <div>

          <input
            ref={inputFile}
            type="file"
            accept=".json"
            className="w-full border rounded-lg p-2"
          />

        </div>

        <button
          onClick={restaurarBackup}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition"
        >
          📤 Restaurar Backup
        </button>

      </div>

      <div className="mt-6 border-t pt-4 text-sm text-gray-500">

        <p>
          ✔ O backup inclui todos os dados cadastrados.
        </p>

        <p>
          ✔ Formato: JSON.
        </p>

        <p>
          ✔ Compatível entre computadores.
        </p>

      </div>

    </div>

  );

}