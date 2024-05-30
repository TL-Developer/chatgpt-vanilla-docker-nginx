// MAPEAMENTO DOS ELEMENTOS PRINCIPAIS
const elementsFactory = {
  $sectionMessages: document.querySelector("#messages"),
  $inputMessage: document.querySelector("#message"),
  $buttonMessage: document.querySelector("#send-message"),
  $selectModel: document.querySelector("#models"),
  $formMessage: document.querySelector("form")
}

// TEMPLATE DE MENSAGEM DO USUÁRIO
const userMessageTemplate = (userInputMessage) => (`
  <div class="bg-gray-900 p-5 flex flex-col gap-2">
    <div class="flex content-start items-center gap-4 w-full">
      <i class="fa fa-user-circle fa-1x"></i>
      <h4>Você</h4>
    </div>
    <p class="message-p"> ${userInputMessage} </p>
  </div>
`);

// TEMPLATE DE MENSAGEM DO CHATGPT
const chatGPTTemplate = (responseGPT) => (`
  <div class="bg-gray-100 p-5 flex flex-col gap-2 text-gray-900 text-gpt-response">
    <div class="flex content-start items-center gap-4 w-10 h-10">
      <img class="w-10 h-10" src="./chat.webp">
      <h4>ChatGPT</h4>
    </div>
    <p class="message-p"> ${responseGPT} </p>
  </div>
`);

// CONSTANTES QUE PODEM SER GRAVADOS EM VARIAVEL DE AMBIENTE COM A URL DO OPENAPI E APIKEY
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = "<api key>";

console.log('process.env.OPENAI_API_KEY', process.env.OPENAI_API_KEY);

// SET DO MODELO SELECIONADO PARA UTILIZAR NO OPENAPI
let model = elementsFactory.$selectModel.value;

// EVENTO DE ALTERAÇÃO DO MODELO NO SELECT BOX
elementsFactory.$selectModel.addEventListener("change", () => {
  model = elementsFactory.$selectModel.value;
});

// EVENTO DE SUBMIT DO FORMULARIO COM PREVENT DEFAULT 
elementsFactory.$formMessage.addEventListener("submit", (e) => e.preventDefault());

// EVENTO DE CLICK NO BOTÃO PARA ENVIAR MENSAGEM E ADICIONAR O TEMPLATE NO HTML
elementsFactory.$buttonMessage.addEventListener("click", insertMessageInHTML);

// EVENTO DE TECLADO AO PRESSIONAR O ENTER E VALIDAÇÃO SE O INPUT ESTA COM TEXTO PARA MOSTRAR O BOTÃO
elementsFactory.$inputMessage.addEventListener("keyup", (event) => {
  const hasValue = elementsFactory.$inputMessage.value !== "";

  elementsFactory.$buttonMessage.disabled = !hasValue;

  if (hasValue && event.key === "Enter") {
    event.preventDefault();
    insertMessageInHTML();
  }
});

// INSERSÃO DA MENSAGEM NO HTML E MANTENDO O SCROLL SEMPRE NO BOTTOM
async function insertMessageInHTML() {
  const userInputMessage = elementsFactory.$inputMessage.value;

  elementsFactory.$sectionMessages.innerHTML += userMessageTemplate(userInputMessage);

  elementsFactory.$formMessage.reset();
  buttonState(false);

  const responseGPT = await postMessageToGPT(userInputMessage);
  elementsFactory.$sectionMessages.innerHTML += chatGPTTemplate(responseGPT);

  scrollToBottom(document.querySelector('.text-gpt-response').clientHeight);
}

// FUNÇÃO PARA HABILITAR OU DESABILITAR O BOTÃO DE ENVIO DE MENSAGEM
function buttonState(disabled) {
  elementsFactory.$buttonMessage.disabled = disabled;
}

// FUNÇÃO PARA SCROLLAR A SEÇÃO DE MENSAGEM
function scrollToBottom(concat) {
  elementsFactory.$sectionMessages.scrollTo(0, elementsFactory.$sectionMessages.scrollHeight + concat);
}

// FUNÇÃO PARA REALIZAR A INTEGRAÇÃO COM API DO OPENAPI VIA REST POST
async function postMessageToGPT(message) {
  const payload = {
    messages: [
      {
        content: message,
        role: "system",
      },
    ],
    model,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  };

  showLoading();

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const returnResponseJson = await response.json();

    return returnResponseJson.choices[0].message.content;
  } catch (error) {
    console.error("Erro na requisição:", error.message);
    return error.message;
  } finally {
    hideLoading();
    buttonState(false);
  }
}

// FUNÇÃO PARA MOSTRAR O LOADING
function showLoading() {
  const loadingElement = document.createElement("img");
  loadingElement.className = 'loading w-20 m-auto mt-3 mb-3';
  loadingElement.src = './loading.gif';
  elementsFactory.$sectionMessages.appendChild(loadingElement);

  scrollToBottom(loadingElement.clientHeight);
}

// FUNÇÃO PARA REMOVER O LOADING
function hideLoading() {
  const loadingElement = elementsFactory.$sectionMessages.querySelector(".loading");
  
  if (loadingElement) loadingElement.remove();
}