// Cria uma conexão WebSocket com o servidor GBTP local
const socket = new WebSocket("ws://localhost:8080");

// Captura os elementos do DOM e faz o cast para os tipos corretos
const contaOrigemInput = document.getElementById("numero-conta") as HTMLInputElement;
const contaDestinoInput = document.getElementById("conta-destino") as HTMLInputElement;
const valorInput = document.getElementById("valor") as HTMLInputElement;
const operacaoSelect = document.getElementById("opcao") as HTMLSelectElement;
const resultadoDiv = document.getElementById("resultado") as HTMLDivElement;
const botao = document.getElementById("botao") as HTMLButtonElement;

// Evento disparado quando o WebSocket se conecta com sucesso ao servidor
socket.addEventListener("open", () => {
  console.log("Conectado ao servidor GBTP");
});

// Evento disparado ao receber uma mensagem do servidor
socket.addEventListener("message", (event) => {
  const response = formatarResposta(event.data); // Formata a resposta recebida
  resultadoDiv.innerText = response; // Exibe a resposta no elemento de resultado
});

// Evento disparado em caso de erro na conexão
socket.addEventListener("error", (err) => {
  resultadoDiv.innerText = "Erro de conexão com o servidor.";
  console.error("WebSocket error:", err);
});

// Evento de clique no botão de envio
botao.addEventListener("click", () => {
  const operacao = operacaoSelect.value; // Obtém a operação selecionada
  const accountId = contaOrigemInput.value.trim(); // Conta de origem
  const toAccountId = contaDestinoInput.value.trim(); // Conta de destino (se houver)
  const valor = parseFloat(valorInput.value || "0").toFixed(2); // Valor formatado com duas casas decimais

  // Verifica se o número da conta de origem foi informado
  if (!accountId) {
    resultadoDiv.innerText = "Informe o número da conta de origem.";
    return;
  }

  // Mapeamento das opções do usuário para comandos do protocolo GBTP
  const opMap: Record<string, string> = {
    consultarSaldo: "BALANCE",
    depositar: "DEPOSIT",
    sacar: "WITHDRAW",
    transferir: "TRANSFER"
  };

  const operacaoGBTP = opMap[operacao]; // Traduz a operação para o protocolo

  // Monta a mensagem no formato esperado pelo protocolo GBTP
  const mensagem = [
    `OPERATION:${operacaoGBTP}`,
    `ACCOUNT_ID:${accountId}`,
    `TO_ACCOUNT_ID:${operacaoGBTP === "TRANSFER" ? toAccountId : ""}`, // Só preenche se for transferência
    `VALUE:${valor}` // Valor é incluído sempre, mesmo que não necessário
  ].join("\n");

  // Envia a mensagem ao servidor via WebSocket
  socket.send(mensagem);
});

// Função auxiliar para formatar a resposta recebida do servidor
function formatarResposta(data: string): string {
  return data
    .split("\n") // Quebra a resposta em linhas
    .map(linha => {
      const [chave, valor] = linha.split(":"); // Divide cada linha em chave e valor
      return `${chave.trim()}: ${valor?.trim()}`; // Formata com espaçamento adequado
    })
    .join("\n"); // Junta tudo de volta em uma única string
}
