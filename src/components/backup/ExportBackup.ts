export function exportarBackup() {

  const backup = {

    dataBackup: new Date().toISOString(),

    dados: {} as Record<string, string | null>

  };



  for (let i = 0; i < localStorage.length; i++) {

    const chave = localStorage.key(i);

    if (!chave) continue;

    if (chave.startsWith("sistema_")) {

      backup.dados[chave] = localStorage.getItem(chave);

    }

  }



  const blob = new Blob(

    [JSON.stringify(backup, null, 2)],

    {

      type: "application/json"

    }

  );



  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");



  const agora = new Date();

  const nome = `Backup_${agora.getFullYear()}-${String(
    agora.getMonth() + 1
  ).padStart(2, "0")}-${String(
    agora.getDate()
  ).padStart(2, "0")}_${String(
    agora.getHours()
  ).padStart(2, "0")}-${String(
    agora.getMinutes()
  ).padStart(2, "0")}.json`;



  link.href = url;

  link.download = nome;

  link.click();



  URL.revokeObjectURL(url);

}
