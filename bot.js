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

function doPost(e) {
  let contents = JSON.parse(e.postData.contents);
  let chat_id = contents.message.chat.id;
  let text = contents.message.text;
  let username = contents.message.from.username;
  let timestamp = new Date().toLocaleString();  // Получение текущей даты и времени
  
  let sheet = table.getSheetByName("Messages");
  
  if (text === "/start") {
    let welcomeMessage = `Привет, ${username}! Я - Лариса, бот-бухгалтер. Я помогу вести учет финансов. Приступим, введите сумму прихода:`;
    sendText(chat_id, welcomeMessage);
  }
  else if (!isNaN(parseFloat(text)) && isFinite(text)) {  // Проверка, является ли введенное значение числом
    let incomeValue = parseFloat(text);
    
    if (incomeValue >= 0) {  // Проверка, что число больше или равно нулю
      // Запрос суммы расхода
      sendText(chat_id, `Сумма прихода в размере ${incomeValue} рублей записана. Введите сумму расхода:`);
      
      // Установка временной переменной для хранения значения суммы расхода
      table.getRange("Temp!A1").setValue("expendValue");
      
    } else {
      sendText(chat_id, "Введенное значение должно быть больше или равно нулю. Попробуйте еще раз.");
    }    
  } else if (text === "expendValue") {
    let expendValue = parseFloat(text);  // Получение значения суммы расхода
    
    if (expendValue >= 0) {  // Проверка, что число больше или равно нулю
      let incomeValue = table.getRange("Temp!A1").getValue();  // Получение значения суммы прихода из временной переменной
      
      sheet.appendRow([timestamp, username, incomeValue, expendValue]);
      sendText(chat_id, `Сумма расхода в размере ${expendValue} рублей записана.`);

      // Очистка временной переменной
      table.getRange("Temp!A1").clearContent();
      
      // Запрос следующего значения
      sendText(chat_id, "Введите следующую сумму прихода:");
    } else {
      sendText(chat_id, "Введенное значение должно быть больше или равно нулю. Попробуйте еще раз.");
    } 
  } else {
    sendText(chat_id, "Введенное значение должно быть числом. Попробуйте еще раз.");
  }
}
