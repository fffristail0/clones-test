const token = '6326686411:AAFk9-WOLIwrjY-hlXAHOoD4dwtrX-Au9Vc';
const table = SpreadsheetApp.openById('1xSu9aJeLs0yMNVKaDG_Bss1sqcr_Nupm8Ob5xlODYoc');

function getMe () {
  let response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/getMe");
  console.log (response.getContentText());
}

function setWebhook () {
  let webAppUrl = 'https://script.google.com/macros/s/AKfycbwABxAGBniydm27UfNuMrNMPokTSxj3B4EBOlSifFUjbZckzgHM5U403DUI__3xbJL4hg/exec';
  let response = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/setWebhook?url=" + webAppUrl);
  console.log (response.getContentText());
};

function sendText(chat_id, text) {
  let data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chat_id),
      text: text,
      parse_mode: "HTML"
    }
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function sendWelcomeMessage(chat_id, username) {
  let message = "Привет, " + username + "! Я - Лариса, бот-бухгалтер. Я помогу вести учет финансов. Приступим! Введите сумму прихода:";
  sendText(chat_id, message);
}

let incomeValue = 0;
let expendValue = 0;

function sendErrorMessage(chat_id, message) {
  sendText(chat_id, "Ошибка: " + message + " Введите корректные данные:");
}

function processIncome(chat_id, text) {
  let amount = parseFloat(text);
  if (isNaN(amount)) {
    sendErrorMessage(chat_id, "вы ввели текст, а не число");
  } else if (amount < 0) {
    sendErrorMessage(chat_id, "сумма не может быть меньше 0");
  } else {
    incomeValue = amount;
    sendText(chat_id, "Спасибо, вы указали сумму прихода " + incomeValue + " рублей. Введите сумму расхода:");
  }
}

function processExpend(chat_id, text) {
  let amount = parseFloat(text);
  if (isNaN(amount)) {
    sendErrorMessage(chat_id, "вы ввели текст, а не число");
  } else if (amount < 0) {
    sendErrorMessage(chat_id, "сумма не может быть меньше 0");
  } else {
    expendValue = amount;
    sendText(chat_id, "Спасибо, вы указали сумму расхода " + expendValue + " рублей. Введите комментарий:");
  }
}

function doPost(e) {
  let contents = JSON.parse(e.postData.contents);
  let chat_id = contents.message.chat.id;
  let text = contents.message.text;

  if (text === "/start") {
    let username = contents.message.from.username;
    sendWelcomeMessage(chat_id, username);
  } else if (incomeValue === 0) {
    processIncome(chat_id, text);
  } else if (expendValue === 0) {
    processExpend(chat_id, text);
  } else {
    sendText(chat_id, text);
    table.getSheetByName("Messages").appendRow([chat_id, text]);
  }
}
