const socket = new WebSocket("ws://localhost:8080");

// Elementos do DOM
const contaOrigemInput = document.getElementById("numero-conta") as HTMLInputElement;
const contaDestinoInput = document.getElementById("conta-destino") as HTMLInputElement;
const valorInput = document.getElementById("valor") as HTMLInputElement;
const operacaoSelect = document.getElementById("opcao") as HTMLSelectElement;
const resultadoDiv = document.getElementById("resultado") as HTMLDivElement;
const botao = document.getElementById("botao") as HTMLButtonElement;

socket.addEventListener("open", () => {
  console.log("Conectado ao servidor GBTP");
});

socket.addEventListener("message", (event) => {
  const response = formatarResposta(event.data);
  resultadoDiv.innerText = response;
});

socket.addEventListener("error", (err) => {
  resultadoDiv.innerText = "Erro de conexão com o servidor.";
  console.error("WebSocket error:", err);
});

botao.addEventListener("click", () => {
  const operacao = operacaoSelect.value;
  const accountId = contaOrigemInput.value.trim();
  const toAccountId = contaDestinoInput.value.trim();
  const valor = parseFloat(valorInput.value || "0").toFixed(2);

  if (!accountId) {
    resultadoDiv.innerText = "Informe o número da conta de origem.";
    return;
  }

  // Mapeia operação para GBTP
  const opMap: Record<string, string> = {
    consultarSaldo: "BALANCE",
    depositar: "DEPOSIT",
    sacar: "WITHDRAW",
    transferir: "TRANSFER"
  };

  const operacaoGBTP = opMap[operacao];

  // Campos obrigatórios
  const mensagem = [
    `OPERATION:${operacaoGBTP}`,
    `ACCOUNT_ID:${accountId}`,
    `TO_ACCOUNT_ID:${operacaoGBTP === "TRANSFER" ? toAccountId : ""}`,
    `VALUE:${valor}`
  ].join("\n");

  socket.send(mensagem);
});

function formatarResposta(data: string): string {
  return data
    .split("\n")
    .map(linha => {
      const [chave, valor] = linha.split(":");
      return `${chave.trim()}: ${valor?.trim()}`;
    })
    .join("\n");
}
