/**
* 最終更新日：2018/05/21 11:30
* トリガーアカウント：hogehoge@gamil.com
* 実行スクリプト：supportMessage
* トリガーイベント：分タイマー　15分ごと
* 〈コード要約〉
* #08_もくもく広場チャンネルで、もくもくしている人がいる場合に、ノンプロ君が応援メッセージを送ります。
*/


function supportMessage() {
  
  var properties = PropertiesService.getScriptProperties();
  
  /* 参加者がいる場合に、supportMessages シートから message をランダムピックアップ */
  if (properties.getProperty('MOKUMOKU_MEMBERS_COUNT') > 0) {
    var ss      = SpreadsheetApp.getActiveSpreadsheet();
    var smSh    = ss.getSheetByName('supportMessages');
    var values  = smSh.getDataRange().getValues();
    var cnt     = values.length;
    var num     = Math.floor(1 + Math.random() * (cnt - 1));
    var message = values[num][0]; // HACK:配列から取り出して String として扱うための処理
  }
  
  sendMessageFromBot(message);
  
}


/**
* ノンプロ君から Slack にメッセージを送信する
*
* @param {string} slack に投稿するメッセージ
* SlackApp(22)：M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
*/

function sendMessageFromBot(message) {
  
  var properties = PropertiesService.getScriptProperties();
  var slackApp   = SlackApp.create(properties.getProperty('SLACK_BOT_TOKEN'));
  var channelId  = properties.getProperty('SLACK_CHANNEL');
  var options    = {as_user: true};
  slackApp.postMessage(channelId, message, options);
  
}