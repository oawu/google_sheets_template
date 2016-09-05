/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2016 OA Wu Design
 */


var GST = function (options, callback, errorCallback) {
  var url = 'https://spreadsheets.google.com/feeds/cells';
  options = $.extend ({ key: '', index: 0, beforeSend: null }, options);
  
  if (options.key.length === 0 || isNaN (options.index) || options.index < 0)
    return errorCallback && errorCallback ();

  $.get (url + '/' + options.key + '/' + (options.index + 1) + '/public/values?alt=json&t=' + new Date ().getTime (), { dataType: 'json', beforeSend: options.beforeSend })
   .done (function (result) {
    var gst_idOf = function (i) {
      return (i >= 26 ? idOf((i / 26 >> 0) - 1) : '') + 'ABCDEFGHIJKLMNOPQRSTUVWXY'[i % 26 >> 0];
    }, table = {};

    if ((typeof result.feed == 'undefined') || (typeof result.feed.entry == 'undefined'))
      return errorCallback && errorCallback ();

    result.feed.entry.filter (function (t) {
      return (typeof t.gs$cell != 'undefined') && (typeof t.gs$cell.row != 'undefined') && (typeof t.gs$cell.col != 'undefined') && (typeof t.gs$cell.$t != 'undefined') && !isNaN (t.gs$cell.row) && !isNaN (t.gs$cell.col) && (t.gs$cell.row > 0) && (t.gs$cell.col > 0);
    }).map (function (t) {
      return t.gs$cell;
    }).forEach (function (t) {
      table[gst_idOf(t.col - 1) + t.row] = t.$t;
    });

    var obj = {
      table: table,
      cell: function (key, returnDefaultValue) {
        key = key.toUpperCase ();
        return typeof this.table[key] == 'undefined' ? returnDefaultValue : this.table[key];
      }
    };

    return callback && callback (obj);

   }).fail (errorCallback);
};

$(function () {
  
  new GST ({
    key: '1SDK0D9UqZUpGt80BDaeC31_aTTACGthcH-KOImK42BA',
    index: 0,
    beforeSend: function () {
      console.error ('讀取 Google 試算表中..');
    }
  }, function (gst) {
    console.error ('讀取 Google 試算表完成！');
    document.body.innerHTML = document.body.innerHTML.replace(/{{([A-Za-z0-9]*)}}/g, function (match, p1) {
      return gst.cell (p1, '');
    });
  });

});