function tableBuilder(tableData) {
    // Horizontal location Names
    for (y in tableData) {
        $("#lathorizontal").append('<th scope="col" class="text-center">' + tableData[y]["name"] + '</th>');
    }

    // Vertical location Names
    
    for (x in tableData) {
        let vtable
        for (y in tableData) {
            if ( x == y ) {         // If it self
                vtable = vtable + '<td id="ltid-'+x+'-'+y+'" class="text-center">' + "-"
            } else if ( x > y ) {   // After it self block
                vtable = vtable + '<td id="ltid-'+x+'-'+y+'" class="text-center text-info">' + 'loading'
            } else {                // Before it self block
                vtable = vtable + '<td id="ltid-'+x+'-'+y+'" class="text-center text-info">' + 'loading'
            }
            vtable = vtable + '</td>'
        }
        // Append the line
        $("#latveritical").append('<tr><th scope="row" class="text-center">'+ tableData[x]["name"] +'</th>'+vtable).children('tr:last')
    }
}

function loadServerList(listURL) {
    $.ajax({
        url: listURL,
        dataType: 'json',
        success: function (data) {
          tableBuilder(data.servers)
          ltJson = data;
        },
        error: function (data) {
          $(".server-list-group").html(JSON.stringify(data));
          $(".serverSelectButton").html("ERR,Click more info");
          if (data["status"] == 200) {
            alert('ERROR: Json Parse Error. Check your server list is right.');
          } else if (data["status"] == 404) {
            alert('ERROR: Json not found at '+listURL);
          } else {
            alert('ERROR: Unknown error, please look Developer Console (F12) for more details');
            console.log(data)
          }
    
        }
      });
}

loadServerList(JsonlistURL)
