/**
* 最終更新日：2018/06/17 08:11
* トリガーアカウント：なし
* 実行スクリプト：doPost
* トリガーイベント：イベント実行時
* 〈コード要約〉
* #08_もくもく広場チャンネルで、「もくもく開始」・「もくもく終了」のキーワードを受けたらレスします。
* 〈メモ〉
* コードの変更時に要再公開
*/

function doPost(e) {
  
  /* パラメータを取得し、条件が一致した場合、処理終了 */
  var properties = PropertiesService.getScriptProperties();
  var userId     = e.parameter.user_id;
  var token      = e.parameter.token;
  var text       = e.parameter.text;
  
  if (userId == properties.getProperty('SLACK_BOT_ID') 
    || token != properties.getProperty('SLACK_WEBHOOK_TOKEN')) {
      return;
    }
  
  /* logs シートに slack ID と message を残す */
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var logsSh = ss.getSheetByName('logs');
  var newLog = [new Date(), userId, text];
  logsSh.appendRow(newLog);
  
  /* メッセージを作成 */
  var message = '';
  
  if (text.match('もくもく開始')) { // 開始時のメッセージ
    message += 'もくもく、がんばってください！ :stmp_fight:';
    var count = parseInt(properties.getProperty('MOKUMOKU_MEMBERS_COUNT')) + 1;
    properties.setProperty('MOKUMOKU_MEMBERS_COUNT', count);
    message += '\n現在の参加者は、' + count + ' 人です。\n';
    
    var values = logsSh.getDataRange().getValues();
    var daysCount  = 0;
    var dateArr = [];
    for (var i = 0; i < values.length; i++) {
      if (values[i][1] == userId && values[i][2].match('もくもく開始')) {
        daysCount++;
        dateArr.push(Utilities.formatDate(new Date(values[i][0]), 'Asia/Tokyo', 'yyyy 年 M 月 d 日'));
      }
    }
    
    /* 配列の重複を削除 */
    dateArr = dateArr.filter(function (x, i, self) {
      return self.indexOf(x) === i;
    });
    
    var lastDate = dateArr[dateArr.length - 2].split('年 ')[1];
    message += '<@' + userId + '> さん、' + lastDate + 'ぶり、 ' + dateArr.length + ' 日目 (' + daysCount + ' 回目) のもくもくです。'; 
  }
  
  if (text.match('もくもく終了')) { // 終了時のメッセージ
    message += 'もくもく、おつかれさまでした！ :stmp_fight:';
    var count = parseInt(properties.getProperty('MOKUMOKU_MEMBERS_COUNT')) - 1;
    
    if (count == 0) {
      properties.setProperty('MOKUMOKU_MEMBERS_COUNT', count); // HACK:人数をマイナスにしないために if 内で行う
      message += '\n現在もくもくしている人はいません。';
      message += '\nもくもくされる方は「もくもく開始」、終了する場合は「もくもく終了」とこのチャンネルにメッセージしてくださいね。';
      
    } else if (count > 0) {
      properties.setProperty('MOKUMOKU_MEMBERS_COUNT', count); // HACK:人数をマイナスにしないために if 内で行う
      message += '\n現在の参加者は、' + count + ' 人です。';
    }
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