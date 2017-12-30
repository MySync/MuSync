var search = "Counting Stars";
  
      $.ajax({
          url: "http://api.musixmatch.com/ws/1.1/track.search?q=" + search + "&apikey=e5398b313d3765d91c9d09e9fa8a06e5",
          method: "GET",
          dataType: "jsonp",
          data: {
          "format": "jsonp"
          }
        }).done(function(result){
          console.log(result);
          result = JSON.parse(result.message.body.track_list[0].track.track_id);
          console.log(result);
            $.ajax ({
                url: "http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=" + result + "&apikey=e5398b313d3765d91c9d09e9fa8a06e5",
                method: "GET",
                dataType: "jsonp",
                data: {
                "format": "jsonp"
                }
              }).done(function(data1){
                console.log (data1.message.body.lyrics.lyrics_body);

               var p = $("<p>");
               p.html(data1.message.body.lyrics.lyrics_body.replace(/\n/g, "<br />"));
        
               $("lyrics card-panel").append(p);