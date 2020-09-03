var ltJson // Written by loadServerList and used by tableLoadService
function tableBuilder(tableData) {
    // Horizontal location Names
    for (y in tableData) {
        $("#lathorizontal").append('<th scope="col" class="text-center tbBdr">' + tableData[y]["name"] + '</th>');
    }
    // Vertical location Names
    for (y in tableData) {
        let vtable
        for (x in tableData) {
            if ( x == y ) {         // If it self
                vtable = vtable + '<td id="ltid-x'+x+'-y'+y+'" class="text-center">' + "-"
            } else if ( x > y ) {   // After it self block
                vtable = vtable + '<td id="ltid-x'+x+'-y'+y+'" class="text-center" style="color: #17c0eb;">' + 'loading'
            } else {                // Before it self block
                vtable = vtable + '<td id="ltid-x'+x+'-y'+y+'" class="text-center" style="color: #17c0eb;">' + 'loading'
            }
            vtable = vtable + '</td>'
        }
        // Append the line
        $("#latveritical").append('<tr class="tbBdr"><th scope="row" class="text-center">'+ tableData[y]["name"] +'</th>'+vtable).children('tr:last')
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

var IPType = "IPv4"
function rowWriteData(rowid,data,IPdata) {
    //$('#'+'ltid-'+rowid[0]+'-'+rowid[1]).html(rowid[0]+'-'+rowid[1]).css("color", "#218c74")
    //return

    if ( data.code == "OK" ) {
        let htmlData =""
        $.each(data, function(k, v) {
            if(icmpAlKeyValue.indexOf(k) != -1)  {  
                htmlData += '<span class="'+k+'">'+v+'</span>';
            }
          });
        $('#'+'ltid-x'+rowid[0]+'-y'+rowid[1]).html(htmlData).css("color", "#218c74")
    } else if ( data.code == "RemoteHostDown" ) {
        $('#'+'ltid-x'+rowid[0]+'-y'+rowid[1]).html("Down").css("color", "#ff9f1a")
    } else if ( data.code == "BadRequest" && data.err == "funcTypeMissMatchExecuted" ) {
        $('#'+'ltid-x'+rowid[0]+'-y'+rowid[1]).html("No "+IPdata).css("color", "#ff9f1a")
    } else {
        $('#'+'ltid-x'+rowid[0]+'-y'+rowid[1]).html("r-x"+rowid[0]+"-y"+rowid[1]).css("color", "#ff3838")
        console.log("ERR r-x"+rowid[0]+"-y"+rowid[1],data)
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
    $( ".tbBdr" ).remove(); //remove all created tables
    tableBuilder(ltJson.servers) // Create all tables again
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

function rowWebRequest(rowid) {
    const IPMode = $('#IPType').children("option:selected").val()
    // X-Axis rowid[0], Y-Axis rowid[1]
    // Y axis is current server.
    // Y axis make a test to X axis server. // rowid[1] make a test to rowid[0]
    let tableData = ltJson.servers

    // Now looking test addr.
    let testAddr //= tableData[rowid[0]].ipv6
    // Test ADDR selection System
    // If server has a dualstack addr, return dualstack addr
    //  else {
    //  if IPmode is IPv4 look server has IPv4 addr, if has it  return IPv4 addr if not return test url hostname
    //  if IPmode is IPv6 look server has IPv6 addr, if has it  return IPv6 addr if not return test url hostname
    //  if IPmode is IPvDefault look server has IPv6 addr, if has it  return IPv6 addr if not if look server has IPv4 addr, \
    //      if has it  return IPv4 addr if IPv4 add is not available return test url hostname
    // }

    if ( tableData[rowid[0]].ds != undefined && tableData[rowid[0]].ds != '') { // Firstly look if has a DualStack connection, use this addr for IPv4 and IPv6
        testAddr = tableData[rowid[0]].ds 
    } else { // If dualstack addr is not found, look individual
        
        if ( IPMode == "IPv4" ) { // Check mode is IPv4

            if (tableData[rowid[0]].ipv4 != undefined && tableData[rowid[0]].ipv4 != '') {
                testAddr = tableData[rowid[0]].ipv4
            } else { 
                testAddr = extractHostname(tableData[rowid[0]].ntsurl)
            }

        } else if ( IPMode == "IPv6" ) { // For IPv6

            if (tableData[rowid[0]].ipv6 != undefined && tableData[rowid[0]].ipv6 != '') {
                testAddr = tableData[rowid[0]].ipv6
            } else {
                testAddr = extractHostname(tableData[rowid[0]].ntsurl)
            }

        } else {    // For Default

            if (tableData[rowid[0]].ipv6 != undefined && tableData[rowid[0]].ipv6 != '') {
                testAddr = tableData[rowid[0]].ipv6
            } else if (tableData[rowid[0]].ipv4 != undefined && tableData[rowid[0]].ipv4 != '') {
                testAddr = tableData[rowid[0]].ipv4
            } else {
                testAddr = extractHostname(tableData[rowid[0]].ntsurl)
            }

        }
    }
    // END of the Test ADDR selection System

    if (testAddr != undefined ) {
        $.ajax({
            url: tableData[rowid[1]].ntsurl+'?funcType=icmp&IPVersion='+IPMode+'&host='+encodeURIComponent(testAddr),
            dataType: 'json',
            success: function (data) {
                rowWriteData(rowid,data,IPMode)
                //rowWriteData([rowid[0],rowid[1]],{'code': "OK", 'rttmin': tableData[rowid[1]].ntsurl+"=>"+testAddr})
            },
            error: function (data) {
                rowWriteData(rowid,data)
            }
          });
    } else {
        rowWriteData([rowid[0],rowid[1]],{'code': "OK", 'rttmin': tableData[rowid[1]].ntsurl+"=>"+testAddr })
    }
    
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function xAxis(y) { // Horizontal X-Axis Same server loop
    for (let x in ltJson.servers) {  //this for destinations
        if ( x != y ) {     // Do not process to it self
            setTimeout(() => { rowWebRequest([x,y],IPType); }, 2000*x);
        }
        // Sleep between two row // This is important because request sent over to same server and low duration might be trigger rate limit.
        // sleep 400
    }
    return y;
}

async function tableLoadService() {
    for (;;) {    // This infinity loop
        for (let y in ltJson.servers) {  // this for Vertical lines
            xAxis(y) // Start request to all servers
            // Sleep for between lines 200 ms
            await timeout(200);
        }
        // Sleep for re run time
        //                  Sleep For X-Lines             Sleep for Y-Lines
        await timeout( (ltJson.servers.length*2000) + (ltJson.servers.length*200));
    }
}



loadServerList(JsonlistURL)