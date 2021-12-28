function GC_MONITOR(rows, webhook) {

    try {
      var header = rows[0];
      var currRow;
      var payload;
  
      // For each non-empty row, send it to pipedream webhook
      for (var i = 1; i < rows.length; i++) {
        var rowEmpty = rows[i].reduce((prev, element) => prev && (element == ""), true);
  
        if (!rowEmpty) {
          currRow = rows[i];
          payload = {};
          for (var j = 0; j < header.length; j++) {
            payload[header[j]] = currRow[j];
          }
  
          var options = {
            method: 'post',
            payload: payload 
          };
          UrlFetchApp.fetch(webhook, options);
  
        }
        else break;
      }
      return "Newest data sent:" + JSON.stringify(payload);
    }
    catch (err) {
      return "Error: " + err;
    }
  }