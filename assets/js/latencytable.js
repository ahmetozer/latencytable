var ltJson // Written by loadServerList and used by tableLoadService
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
                vtable = vtable + '<td id="ltid-'+x+'-'+y+'" class="text-center" style="color: #17c0eb;">' + 'loading'
            } else {                // Before it self block
                vtable = vtable + '<td id="ltid-'+x+'-'+y+'" class="text-center" style="color: #17c0eb;">' + 'loading'
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
          tableLoadService(ltJson.servers)
        },
        error: function (data) {
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

var icmpAlKeyValue = ["rttmin","rttavg","rttmax","mdev","packetloss"]

var IPType = "IPvDefault"
function rowWriteData(rowid,data) {
    if ( data.code == "OK" ) {
        let htmlData =""
        $.each(data, function(k, v) {
            if(icmpAlKeyValue.indexOf(k) != -1)  {  
                htmlData += '<span class="'+k+'">'+v+'</span>';
            }
          });
        $('#'+'ltid-'+rowid[0]+'-'+rowid[1]).html(htmlData).css("color", "#218c74")
    } else if ( data.code == "RemoteHostDown" ) {
        $('#'+'ltid-'+rowid[0]+'-'+rowid[1]).html("Down").css("color", "#ff9f1a")
    } else {
        $('#'+'ltid-'+rowid[0]+'-'+rowid[1]).html("ERR r-"+rowid[0]+"-"+rowid[1]).css("color", "#ff3838")
        console.log("ERR r-"+rowid[0]+"-"+rowid[1],data)
    }
    
}

function showType(sType) {
    let outputStyle = ""
    for (y in icmpAlKeyValue) {
        if ( icmpAlKeyValue[y] != sType ) {
            outputStyle += ' .'+icmpAlKeyValue[y]+" {display:none;}\n"
        }
    }
    $('#showDataTypeStyle').html(outputStyle)
}
$('#showType').on('change', function() {
    showType(this.value)
  });


$('#IPType').on('change', function() {
    IPType = this.value
  });

function extractHostname(url) {
    let hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

//var IPMode="IPv6"

function rowWebRequest(rowid,IPMode) {
    // X rowid[0], Y rowid[1]
    let tableData = ltJson.servers
    let testAddr


    // Test ADDR selection System
    // If server has a dualstack addr, return dualstack addr
    //  else {
    //  if IPmode is IPv4 look server has IPv4 addr, if has it  return IPv4 addr if not return test url hostname
    //  if IPmode is IPv6 look server has IPv6 addr, if has it  return IPv6 addr if not return test url hostname
    //  if IPmode is IPvDefault look server has IPv6 addr, if has it  return IPv6 addr if not if look server has IPv4 addr, \
    //      if has it  return IPv4 addr if IPv4 add is not available return test url hostname
    // }

    if (tableData[rowid[1]].ds !== undefined && tableData[rowid[1]].ds !== '') { // Firstly look if has a DualStack connection, use this addr for IPv4 and IPv6
        
        testAddr = tableData.ds

    } else { // If dualstack addr is not found, look individual
        
        if ( IPMode == "IPv4" ) { // Check mode is IPv4

            if (tableData[rowid[1]].ipv4 !== undefined && tableData[rowid[1]].ipv4 !== '') {
                testAddr = tableData[rowid[1]].ipv4
            } else { 
                testAddr = extractHostname(tableData[rowid[1]].ntsurl)
            }

        } else if ( IPMode == "IPv6" ) { // For IPv6

            if (tableData[rowid[1]].ipv6 !== undefined && tableData[rowid[1]].ipv6 !== '') {
                testAddr = tableData[rowid[1]].ipv6
            } else {
                testAddr = extractHostname(tableData[rowid[1]].ntsurl)
            }

        } else {    // For Default

            if (tableData[rowid[1]].ipv6 !== undefined && tableData[rowid[1]].ipv6 !== '') {
                testAddr = tableData[rowid[1]].ipv6
            } else if (tableData[rowid[1]].ipv4 !== undefined && tableData[rowid[1]].ipv4 !== '') {
                testAddr = tableData[rowid[1]].ipv4
            } else {
                testAddr = extractHostname(tableData[rowid[1]].ntsurl)
            }

        }
    }
    // END of the Test ADDR selection System

        
    $.ajax({
        url: tableData[rowid[0]].ntsurl+'?funcType=icmp&IPVersion='+IPMode+'&host='+testAddr,
        dataType: 'json',
        success: function (data) {
            rowWriteData(rowid,data,IPMode)
        },
        error: function (data) {
            rowWriteData(rowid,data)
        }
      });
}

function tableLoadService(tableData) {
    for (let index = 0; index < 1; index++) {    // This infinity loop
      
        //for (x in tableData) {  // this for horizontal lines
        for (let x = 0; x < 2; x++){

            for (y in tableData) {  //this for destinations
                
                if ( x != y ) {     // Do not process to self 
                    rowWebRequest([x,y],IPType)
                }
                
                // Sleep between two row // This is important because request sent over to same server and low duration might be trigger rate limit.
                // sleep 400
            }
        
            // Sleep for between lines
            // sleep 200
        }

        // Sleep for re run time
        // sleep 10000 ten second
    }
}

loadServerList(JsonlistURL)