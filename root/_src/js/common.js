$(function(){
  $("a[href^=#]").on('click',function(e){
      var clickElm = $(this);
      var anchorStr = clickElm.attr('href');
      if(anchorStr || typeof anchorStr === 'String' || anchorStr.charAt(0) === '#') {
          e.preventDefault();
          Util.smoothScroll({pageID : anchorStr});
          return false;
      }
  });

  if ($('#top').length>=1) {
    SNSset.setTweetBtn('.share-area .tw .btn', 'http://comic-sp.kodansha.co.jp/evening2015/', '7月に最新刊が発売される『いぬやしき』『累』をはじめイブニングの人気作品試し読みでカラーイラストが入った11種類のモバイルバッテリーが当たる超豪華キャンペーン！', '');
    SNSset.getTweetNum('.share-area .tw .num','http://comic-sp.kodansha.co.jp/evening2015/');

    SNSset.setLikeBtn('.share-area .fb .btn', 'http://comic-sp.kodansha.co.jp/evening2015/');
    SNSset.getFbLikeNum('.share-area .fb .num','http://comic-sp.kodansha.co.jp/evening2015/');
    }
});



var SNSset = {
  //ポップアップサイズ設定
  popupSetting: function(){
    var w = 550;
    var h = 530;
    var left = (window.screen.width-w)/2;
    var top = (window.screen.height-h*2)/2;
    return 'width='+w+', height='+h+', left='+left+', top='+top;
  },//popupSetting

  //シェアURL、シェア文言、ハッシュタグ付きツイートボタン生成
  setTweetBtn : function(selector, url, title, hashtag){
    var _url = 'http://twitter.com/intent/tweet?text='+ encodeURIComponent(title) + '&amp;url=' + url + '&amp;hashtags=' + encodeURIComponent(hashtag);
    $(selector).find('a').attr('href', _url).on('click', function(){
      window.open($(this).attr('href'), null, SNSset.popupSetting());
      return false;
    });
  },

  // Twitterのshare数取得 パラメーターつきの場合urlはindex.htmlを消す
  getTweetNum : function(selector,targetUrl) {
      var pageURL = targetUrl;
      $.ajax({
        type: 'GET',
        url: 'http://urls.api.twitter.com/1/urls/count.json',
        data: {
          url : encodeURI(pageURL),
          noncache: new Date()
        },
        dataType: 'jsonp'
      })
      .done(function(data){
        //Success
        //4桁こえたらカンマをつける
        $(selector).text( (data.count) ? SNSset.setComma(data.count) : 0 );
      })
      .fail(function(data){
        //Error
        $(selector).text( 0 );
      });
  },//getTweetNum

  //いいねボタン生成
  setLikeBtn : function(selector, url){
    var _url = 'http://www.facebook.com/sharer.php?u='+ url;
    $(selector).find('a').attr('href', _url).on('click', function(){
      window.open($(this).attr('href'), null, SNSset.popupSetting());
      return false;
    });
  },

  // Fbのshare数取得 パラメータつきの場合og:urlはindex.htmlを消す
  getFbLikeNum : function(selector,targetUrl) {
      var apiURL = 'https://graph.facebook.com/';
          apiURL += encodeURI(targetUrl);
      $.ajax({
              url : apiURL,
              cache:false,
              type:'GET',
              dataType:'jsonp',
              timeout:10000
          })
          .done(function(data, textStatus, jqXHR){
                  //Success 成功したときの処理
                  if('shares' in data) {
                      //4桁こえたらカンマをつける
                      $(selector).text( (data.shares) ? SNSset.setComma(data.shares) : 0 );
                  }
          })
          .fail(function(jqXHR, textStatus, errorThrown){
              // Error
              $(selector).text(0);
          });
  },//getFbLikeNum

  //4桁こえたらカンマをつける処理
  setComma : function(num) {
    num = (num+'').replace(/,/g, "");
    while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
    return num;
  }
};//SNSset




  /**
   * ページ内リンク
   */
  var Util = {};
  Util.smoothScroll = function(params,aZoomRatio,callbackFunc) {
      var callback = (callbackFunc && typeof callbackFunc === 'function') ? callbackFunc : jQuery.noop;
      var goalYPos = 0;
      if('pageID' in params) {
          var $targetElm = $(params.pageID);
          if($targetElm.length === 0) {
              return;
          }
          if(aZoomRatio && aZoomRatio !== 1) {
              goalYPos = getAnchorLinkTargetPos($targetElm);
          } else {
              goalYPos = $targetElm.offset().top;
          }
      } else if('yPos' in params) {
          if(typeof params.yPos !== 'number') {
              return;
          }
          goalYPos = params.yPos;
      } else {
          return;
      }

      var speed = ('speed' in params) ? params.speed : 200;
      var offsetY = ('offsetY' in params) ? params.offsetY : 0;
      goalYPos += offsetY;

      // アニメーションさせる
      var easingStr;
      if ( jQuery.easing && jQuery.easing.easeOutQuad ) {
          easingStr = 'easeOutQuad';
      } else {
          // jQueryUIのeasing値を持ってない場合はlinearで移動
          easingStr = 'linear';
      }

      var movTarget = Util.getHtmlScrollElm();
      jQuery(movTarget).animate({
          scrollTop : goalYPos
      },speed,easingStr,callbackFunc);

      // スマホでページ全体にZoomをかけてる場合の位置調整
      function getAnchorLinkTargetPos(targetElm) {
          // 現在のスクロール位置とターゲットの差分とZoomの値をチェックしてから移動位置をきめる
          var curWinPos = $(window).scrollTop();
          var targetPos = targetElm.offset().top;
          var diff = targetPos - curWinPos;
          yPos = curWinPos + (diff * aZoomRatio);
          return yPos;
      }
  };

  /**
   * HTML要素でスクロールできるかどうか判定（IE対策）
   *
   * @return {string} html / body （スクロールできる要素を返します）
   */
  Util.htmlScrollElm = null;
  Util.getHtmlScrollElm = function(){
      var self = Util;
      if(Util.htmlScrollElm) {
          return Util.htmlScrollElm;
      }

      var result;
      var htmlElm = jQuery('html');
      var bodyElm = jQuery('body');

      if(self.isHtmlScroll) {
          // 既に取得済みの場合
          result = self.isHtmlScroll;
      } else {
          // html要素を生成して確認する
          var html = htmlElm;
          var top = html.scrollTop();
          var el = jQuery('<div/>').height(10000).prependTo('body');
          html.scrollTop(10000);
          var rs = !!html.scrollTop();
          html.scrollTop(top);
          el.remove();

          if(rs === true) {
              result = htmlElm;
          } else {
              result = bodyElm;
          }
          self.htmlScrollElm = result;
      }
      return result;
  };


/*----------------------
ロールオーバー
----------------------*/
$(function () {
  $(".clickable").each(function(){
    addRollOver($(this));
  });
});
function addRollOver(imgObj) {
  var img = imgObj;
  var src = img.attr('src');
  var ftype = src.substring(src.lastIndexOf('.'), src.length);
  var hoverSrc = src.replace(ftype, '_ov'+ftype);
  img.on({
    'mouseenter':function(){
      //over
      $(this).attr('src',hoverSrc);
    },
    'mouseleave':function(){
      //out
      $(this).attr('src',src);
    }
  });
}