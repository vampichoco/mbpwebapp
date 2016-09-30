﻿var Partidas        = new Array()         ;
var total           = 0.0                 ;
var claveadd_id     = 0                   ;
var _prodId_        = 0                   ;
var db                                    ;
var request                               ;
var currentProd                           ;
var currentSale     = {}                  ;
var cliente                               ;

function sellsingle() {

    $('sendButton').text('Sending request');
    var prodId   = $('#prodtb').val();
    var clientid = $('#clienttb').val();

    var queryString =
        endpoint + '/sellsingle.ashx?prod=' + prodId + '&client=' + clientid + '&format=json';

    $.getJSON(queryString, function (results) {
        showSellSingleResults(results);
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Un error ocurrió")
    })

return false;

}

function showSellSingleResults(results) {
    var vta = results.VENTA;
    $("#statuslabel").removeAttr ("class");
    $('#statuslabel').text('Venta ' + vta + ' hecha');
}


/* Search product======================================================================= /*


/* Step one: On seachProd click */
function populateSearch() {
    
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchProdText').val(); 
    
    if (term.length > 0) {
        var url = 
            endpoint + '/search.ashx?q=contains&c=' + term; 
        
        $('#prodSearch ul').empty();
    
        $.getJSON(url, function (results) {
            for (i = 0; i < results.length; i++) {
                console.log(JSON.stringify(results[i]));
                addToProdList(results[i]);
            }
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", "Un error ocurrió");
        });
        
    }else{
        setStatLabel("warning", 'Escribe un articulo para buscar');
    }
       
} 

/* Step 2, add to html, set state. */

function addToProdList(item)
{
    var id = getProdId();
         
    var content = $('<div></div>').html(item.DESCRIP);
          
    var li = $('<li></li>').attr("id", id).attr("class", "list-group-item").html(content).click(function(){
        
        localStorage.setItem("prdescrip", "");
        localStorage.setItem("prcantidad", "");

        setPriceSelect(item);
        
        setStatLabel("info", item.DESCRIP);
        $('#prodtb').val(item.ARTICULO);
        currentProd = item;

         
        $('#searchProdModal').modal('hide');
        saveState();

        $('#prodSearch ul').empty();
        
    })
      
    console.log(id + ";");
    $('#prodSearch ul').append(li);
       
}

function searchClient() {
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchClientText').val();
    var vend = $('#usertb').val();
    
    if (term.length > 0)
    {
        var url =
        endpoint + '/searchclient.ashx?c=' + term + "&vend=" + vend;
        
        $('#clientSearch ul').empty(); 
     
        $.getJSON(url, function (results) {
            console.log(JSON.stringify(results));
            for (i = 0; i < results.length; i++) { 
            addToClientList(results[i]);
            } 
            
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", 'Un error ocurrió');
        });
    }else{
       setStatLabel("warning", 'Escribe un cliente para buscar');
    } 
     
} 

function addToClientList(result){
   
    
    var li = $('<li class="list-group-item"></li>').html(result.nombre).click(function(){
                $('#clienttb').val(result.cliente);
                setStatLabel("info", "Cliente seleccionado: " + result.nombre);
                $('#searchClientModal').modal('hide');
                saveState();
             })
    
    $('#clientSearch ul').append(li);
}

function addProd(results) {
    var endpoint = localStorage.getItem("endpoint");

    var prodId = $('#prodtb').val();

    var queryString = endpoint +  '/prods.ashx?single=true&p=' + prodId;

    var prod = $.getJSON(queryString, function (results) {
        
        instanceProd(results);
    }).fail(function (jqXHR) {
        setStatLabel("danger", "algo fallo :()")
    });


} 

function instanceProd(results) {
    
    var price = parseFloat($('#pricetb').val());
    var qty = parseFloat($('#qtytb').val());
   

    var prcantidad = localStorage.getItem("prcantidad")
    var prdescrip = localStorage.getItem("prdescrip")


    if (isEmpty(prcantidad) || prcantidad == 'undefined') {
        prcantidad = 1.0;
    }

    if (isEmpty(prdescrip) || prdescrip == 'undefined') {
        prdescrip = ""
    }

    var newP = {
        Precio     : price,
        Cantidad   : qty,
        Impuesto   : results.TX,
        Costo      : results.COSTO,
        Descrip    : results.DESCRIP,
        Articulo   : results.ARTICULO, 
        Unique     : results.U,
        Prcantidad : prcantidad,
        Prdescrip  : prdescrip
    }; 
    
    Partidas.push(newP);


    saveState();
    
    total = calculateTotal();

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text('Articulo agregado, total: ' + total);

    $('#totalLabel').html(total);

    $('#pricetb').val(0);
    $('#qtytb').val(1);
    $('#prodtb').val("");

    
    console.log(JSON.stringify(newP));
    
    renderPartida(newP);
    
} 

function renderPartida(partida){
    var li = $('<li class="list-group-item"></li>').attr("id", partida.Unique) 
    
    var qtyId = partida.Unique + "-qty"; 
    var descId = partida.Unique + "-desc";
    var prId = partida.Unique + "-price";
    
    var qty   = $('<div id="qtyArea" class="col-xs-1"></div').attr("id", qtyId).html(partida.Cantidad);
    var price = $('<div id="prArea" class="col-xs-2"></div').attr("id", prId).html((partida.Precio * partida.Cantidad).toFixed(2));
    var descrip = $('<div class="col-xs-8"></div>').html(partida.Descrip);
    var content = $('<div class="row"></div>').append([qty, price, descrip]);
    
    li.append(content); 
    
    li.click(function(){
        var i = Partidas.indexOf(partida);
        var p = partida; 
        
        $('#tituloPartida').html(p.Descrip);
        setEditActions(i, p)
        $('#editPartidaModal').modal("show");
        
        
    }); 
    
    $('#prods ul').append(li); 
}

function setEditActions(partida, data){
    $('#savePartidaButton').unbind('click').click(function(){
        var qty = parseFloat(
            $('#modifyQtyTb').val()
        ); 
        
        Partidas[partida].Cantidad = qty;
        var selector = "#" + data.Unique + "-qty";
        
        $('#' + data.Unique).attr("style", "color:blue;");
        $(selector).html(qty);
        
        
        var total = calculateTotal();

        
        $('#editPartidaStatus').html("Partida editada, total: " + total.toFixed(2));
        $('#totalLabel').html(total)
        saveState();
        
    }); 
    
    $('#removePartidaButton').unbind('click').click(function(){
       Partidas.splice(partida, 1); 
       
       $('#'+data.Unique).remove();
       
       var total = calculateTotal();


       setStatLabel("success", "Partida removida, total: " + total.toFixed());
       $('#totalLabel').html(total)
       $('#editPartidaModal').modal('hide');
       saveState();
        
    });
}

function statCheck2(){
   
    var wo = localStorage.getItem("workoffline")


    if (wo == "true") {
        workOffline()
    } else {
        setStatLabel("info", "intentando conexion");


        var endpoint = localStorage.getItem("endpoint");

        var url = endpoint + '/dbstatus.ashx';

        setStatLabel("info", "intentando conexion a " + url);

        var stat = $.getJSON(url, function (result) {
            if (result.exists == true) {

                $('#addButton'          ).unbind('click').click(addProd        );    // Add prod to prods to be sent
                $('#terminateButton'    ).unbind('click').click(terminateSell  );    // terminate sell on click
                $('#searchProdButton'   ).unbind('click').click(populateSearch );    // On search prod click
                $('#validateProdButton' ).unbind('click').click(validateProd   );    // On validate product button click 
                $('#searchClientButton' ).unbind('click').click(searchClient   );    // On search client

                setStatLabel("success", "Sistema cargado y listo");
            } else {
                setStatLabel("danger", "No se pudo conectar a la base de datos");
            }
        }).error(function (jqXHR, textStatus, errorThrown) {
            $('#addButton'          ).unbind('click').click(addProdOffline      );    // Add prod to prods to be sent
            $('#terminateButton'    ).unbind('click').click(insertPendingSell   );    // On terminate sell button
            $('#searchProdButton'   ).unbind('click').click(searchProdOffline   );    // On search prod
            $('#validateProdButton' ).unbind('click').click(validateProdOffline );    // On validate product click 
            $('#searchClientButton' ).unbind('click').click(searchClientOffline );    // On search client

            setStatLabel("alert", "No se pudo conectar al servidor, usando conexión local");
        });
    }
}

function workOffline() {

    $('#addButton'         ).unbind('click').click(addProdOffline      );    // Add prod to prods to be sent
    $('#terminateButton'   ).unbind('click').click(insertPendingSell   );    // On terminate sell button
    $('#searchProdButton'  ).unbind('click').click(searchProdOffline   );    // On search prod
    $('#validateProdButton').unbind('click').click(validateProdOffline );    // On validate product click 
    $('#searchClientButton').unbind('click').click(searchClientOffline );    // On search client

    setStatLabel("info", "Usando bases de datos local");
}

function instanceProd2(results){
    var price = results.ARTICULO.PRECIO1;
    
    var newP = {
        Precio        : price,
        Cantidad      : 1,
        Impuesto      : 0,
        Costo         : results.ARTICULO.COSTO,
        Articulo      : results.ARTICULO.ARTICULO, 
        Unique        : results.ARTICULO.U}
        
        Partidas.push(newP);
    
        total = calculateTotal();

        $("#statuslabel").removeAttr ("class"                                                             );
        $('#statuslabel').addClass   ("alert alert alert-success"                                         );
        $('#statuslabel').text       ('Articulo agregado, total: ' + total                                );
        $('#prods ul'   ).append     ('<li class="list-group-item">' + results.ARTICULO.DESCRIP + '</li>' );
        
        saveState();
}


function selectclaveadd2(art){
        var endpoint = localStorage.getItem("endpoint"); 
        var url = endpoint +  '/prods.ashx?single=true&p=' + art;
    
    
        $.getJSON(url, function (results) {
            if (results.clavesadd.length > 0){
                selectclaveadd(results.clavesadd, results.ARTICULO)
            }else{
                instanceProd2(results)
            }
             
        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", 'Un error ocurrió');
        });
}

function selectclaveadd(data, art){
    $('#presList ul').empty();
    $('#clavesaddModal').modal('show');

    $('#presTable tbody').remove();
    $('#presTable').append('<tbody></tbody>');
    

    for (i = 0; i < data.length; i++) {


        var item = data[i];

        var pr = art.PRECIO1;
        var qty = item.Cantidad;

        var displayText = item.Desc;

        var displayHtml = $('<div></div>');

        var desc = $('<span></span>').html(displayText + '  ');
        var clavedesc = $('<small></small>').html(item.Clave);

        displayHtml.append(desc);
        displayHtml.append(clavedesc);

        var clath = $('<th></th>').html(item.Clave   );

        var button =
            $('<button class="btn btn-default btn-sm">Usar</button>').click(function () {
                localStorage.setItem("prcantidad", item.Cantidad)

                localStorage.setItem("prdescrip", item.Desc)

                var pressqty = $('#pressqtytb').val();

                if (isEmpty(pressqty)) {
                    pressqty = 1
                }

                $('#qtytb').val(item.Cantidad * pressqty);
                updatePrice();
                saveState();
                $('#clavesaddModal').modal('hide');
            });

        

        if (qty < art.C2) {
            console.log("P1");
            pr = art.PRECIO1

        }

        if (qty >= art.C2 && qty < art.C3) {
            console.log("P2");
            pr = art.PRECIO2

        }


        if (qty >= art.C3) {
            pr = art.PRECIO3;

        }

        
        var prth = $('<th></th>').html(pr);

        var tr = $('<tr></tr>');

        tr.append(clath);
        tr.append(prth);
        tr.append($('<th></th>').html(button));

        $('#presTable tbody').append(tr);
        
    } // for
     
} //selectclaveadd

function terminateSell() {

   var clientid = $('#clienttb').val(); 
   var vend = $('#usertb').val(); 
    
   console.log(Partidas.length + ", " + clientid.length + ", " + vend.length)

   if (Partidas.length > 0 && clientid.length > 0 && vend.length > 0){
       var endoint = localStorage.getItem("endpoint");
       
       var ob = { "ClientId": clientid, "Vendedor": vend, "Partidas": Partidas };

       var data = JSON.stringify(ob);

       var url = endoint + '/makesell.ashx';

       $.ajax({
            type: "POST",
            data: data,
            url: url,
            contentType: "application/json",
            dataType: 'json'
       }).done(function (res) {
            setStatLabel("success", "Venta " + res.VENTA + " hecha :D");
            console.log('res', res);
            clearState();
       }).fail(function (err) {
           insertPendingSell();
           console.log('err', err);
           clearState();
       })
   
   
   } else {
       setStatLabel("warning", "Especifica un cliente y un vendedor o agrega al menos una partida");
   }
   
}

function showTerminateSellResults(data, status) {
    $('#statuslabel').text(status);
} 

function saveUser(){
   
  
    var user = $('#usertb').val(); 
    
    var endpoint = localStorage.getItem("endpoint"); 
    var url = endpoint + '/vends.ashx?single=true&vend=' + user; 
    
    $.getJSON(url, function (results) {
        if (results.success = true){
            localStorage.setItem("user", user);
            
            var message = 'Iniciaste sesión como ' + user;
            setStatLabel("success", message);
            $('#configModal').modal('hide');
        }else{
            setStatLabel("warning", 'Usuario o contraseña incorrecto');
            $('#configModal').modal('hide');
        }
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Ocurrió un error al iniciar sesión :()");
    });
    
}

function setStatLabel(style, value){
    $("#statuslabel").removeAttr ("class");
    
    switch (style){
        
        case "info": 
        $("#statuslabel").addClass("alert alert-info");
        break; 
        
        case "success": 
        $("#statuslabel").addClass("alert alert-success");
        break;
        
        case "danger":
        $("#statuslabel").addClass("alert alert-danger");
        break; 
        
        case "warning":
        $("#statuslabel").addClass("alert alert-warning");
        break;
        
        default: 
        $("#statuslabel").addClass("alert alert-info");
        break;
    }
    
    $("#statuslabel").text(value);
}

function generateClaveAddId(){
    claveadd_id += 1; 
    
} 

function validateProd(){
    var prod = $('#prodtb').val(); 
    
    if (prod.length > 0) {
        var endpoint = localStorage.getItem("endpoint");
        var url = endpoint + "/prods.ashx?single=true&p=" + prod;

        $.getJSON(url, function (results) {
            console.log(results.ARTICULO);
            currentProd = results;
            setStatLabel("info", results.DESCRIP);

            
            setPriceSelect(results);

            saveState();

        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", "Ocurrió un error al obtener la información del servidor");
        });
    } else {
        setStatLabel("error", "Especifica un articulo primero!");
    }
    
} 

function displayClavesadd() {
    if (currentProd.clavesadd.length > 0) {
        console.log(JSON.stringify(currentProd))
        selectclaveadd(currentProd.clavesadd, currentProd);
    }
}

$('#qtytb').on('input', function(){
    text = $('#qtytb').val(); 
    
    selectPrice();
})  

function updatePrice() {
    var qty = parseFloat( $('#qtytb').val());
    var price = currentProd.C1 + ", " + currentProd.C2 + ", " + currentProd.C3;
    
    console.log(qty); 
    console.log(price);
    
    if (currentProd) {
        
        if (qty < currentProd.C2) {
            console.log("P1");
            $('#pricetb').val(currentProd.PRECIO1.toFixed(2));
            return;
            
        } 
        
        if (qty >= currentProd.C2 && qty < currentProd.C3){
            console.log("P2");
            $('#pricetb').val(currentProd.PRECIO2.toFixed(2));
            return;
            
        }
        
        if (qty >= currentProd.C3){
            console.log("P3");
            $('#pricetb').val(currentProd.PRECIO3.toFixed(2));
            
        } 
        
    }
} 

function clearState(){
    
    $('#prods ul'    ).empty();
    
    $('#clienttb'    ).val(''   );
    $('#prodtb'      ).val(''   );
    $('#qtytb'       ).val('1'  );
    $('#pricetb'     ).val(''   );
    
    Partidas         =   []; 
    total            =    0; 
   
    saveState();
}

function setPriceSelect(prod) {
    

    console.log(JSON.stringify(prod));

    $('#p1button').html('$' + prod.PRECIO1.toFixed(2)).unbind('click').click(function ()
    {
        
        $('#pricetb').val(prod.PRECIO1.toFixed(2));
        saveState();
    });

    $('#p2button').html('$' + prod.PRECIO2.toFixed(2)).unbind('click').click(function ()
    {
        $('#pricetb').val(prod.PRECIO2.toFixed(2));
        saveState();
    });

    $('#p3button').html('$' + prod.PRECIO3.toFixed(2)).unbind('click').click(function ()
    {
        $('#pricetb').val(prod.PRECIO3.toFixed(2));
        saveState();
    });

    
}

function getCob() {
    $('#cobtable tbody').remove();

    var endpoint = localStorage.getItem("endpoint");
    var client = $('#clienttb').val()
    var url = endpoint + "/synccob.ashx?op=cobbyclient&cl=" + client;

    

    $.getJSON(url, function (cobjson) {
        $.each(cobjson, function (index) {
            
            var item = cobjson[index];
            var li = $('<li class="list-group-item"></li>').html(item.COBRANZA);
            var tr = $('<tr></tr>')

            tr.append($('<td></td>').html(item.COBRANZA   ));
            tr.append($('<td></td>').html(item.VENTA      ));
            tr.append($('<td></td>').html(item.FECHA_VENC ));
            tr.append($('<td></td>').html(item.SALDO      ));
            

            var button =
                $('<button class="btn btn-default btn-xs"></button>').html("Abonar").click(function () {
                    showCobdet(item);
                })
            
            tr.append($('<td></td>').html(button));

            $('#cobtable').append($('<tbody></tbody'));

            $('#cobtable tbody').append(tr);

        });

        $('#loadingCob').hide();

    });
}

function showCobdet(cob) {

    $('#cobModal').modal("show");
    $('#cobdetTable tbody').remove();

    $('#cobdetTable').append($('<tbody></tbody>'));

    var endpoint = localStorage.getItem("endpoint");
    var url = endpoint + "/cobdet.ashx?cob=" + cob.COBRANZA;

    $.getJSON(url, function (cobdet) {
        $.each(cobdet, function (index, value) {

            var tr = $('<tr></tr>');

            tr.append($('<td></td>').html(value.ID     ));
            tr.append($('<td></td>').html(value.FECHA  ));
            tr.append($('<td></td>').html(value.IMPORTE));
            

            $('#cobdetTable tbody').append(tr);
        });
    });
    
    $('#cobTitle').html("<h3></h3>").html("Detalles de cobranza: " + cob.COBRANZA);
    $('#btn-addcob').unbind('click').click(function () {
        var newCob = {
            "Cobranza" : cob.COBRANZA,
            "Importe"  : $('#pricecobtb').val(),
            "Fecha"    : moment().format('DD/MM/YY'),
            "Hora"     : moment().format("LT")
        }
        

        console.log(JSON.stringify(newCob));
        sendCob(newCob);

    });
}

function sendCob(newcob) {
    var endpoint = localStorage.getItem("endpoint")
    var url = endpoint + '/addcobdet.ashx';

    $.ajax({
        type: "POST",
        data: JSON.stringify(newcob),
        url: url,
        contentType: "application/json",
        dataType: 'json'
    }).done(function (res) {
        window.alert("Abono hecho")
        console.log('res', res);

        var tr = $('<tr></tr>');


        tr.append($('<td></td>').html(res.ID       ));
        tr.append($('<td></td>').html(res.FECHA    ));
        tr.append($('<td></td>').html(res.IMPORTE  ));

        $('#cobdetTable tbody').append(tr);
    });
}

/* 
===========================================================================================
                                 Offline operations 
===========================================================================================
*/

function validateProdOffline(){
    
    var prod = $('#prodtb').val();

    db.prods.get(prod, function (item) {
        currentProd = item;
        setStatLabel("info", item.DESCRIP);

        saveState();
    })
    
}

function showCobdetOffline(OfflineCob) {

    $('#cobModal').modal("show");
    $('#cobdetTable tbody').remove();

    $('#cobdetTable').append($('<tbody></tbody>'));

    $.each(OfflineCob.cobdet, function (index, value) {

        var tr = $('<tr></tr>');

        tr.append($('<td></td>').html(value.id));
        tr.append($('<td></td>').html(value.FECHA));
        tr.append($('<td></td>').html(value.IMPORTE));

        $('#cobdetTable tbody').append(tr);
    });

    $('#cobTitle').html("<h3></h3>").html("Detalles de cobranza: " + OfflineCob.COBRANZA);
    $('#btn-addcob').unbind('click').click(function () {
        var newCob = {
            "Cobranza": OfflineCob.COBRANZA,
            "Importe": $('#pricecobtb').val(),
            "Fecha": moment().format('DD/MM/YY'),
            "Hora": moment().format("LT")
        }

        
        db.pendigCob.add(newCob).then(function () {
            setStatLabel("success", "Abono almacenado como pendiente");
        });

        console.log(JSON.stringify(newCob));

    });
}

function getCobOffline() {
    $('#cobtable tbody').remove();

    var client = $('#clienttb').val();

    db.cob.where('CLIENTE').equals(client).each(function (cob) {
        

        var item = cob;
        var li = $('<li class="list-group-item"></li>').html(item.COBRANZA);
        var tr = $('<tr></tr>')


        tr.append($('<td></td>').html(item.COBRANZA   ));
        tr.append($('<td></td>').html(item.VENTA      ));
        tr.append($('<td></td>').html(item.FECHA_VENC ));
        tr.append($('<td></td>').html(item.SALDO      ));

        var button =
                $('<button class="btn btn-default"></button>').html("Abonar").click(function () {
                    showCobdetOffline(item);
                })

        tr.append($('<td></td>').html(button));

        $('#cobtable').append($('<tbody></tbody'));

        $('#cobtable tbody').append(tr);

    });

}

function removePendingSale(id){
    db.ventas.where('id').equals(id).delete();
}

function terminateSell2(item) {
   
       var endpoint = localStorage.getItem("endpoint");

       
       var ob = { "ClientId": item.CLIENTE, Vendedor: item.vend, "Partidas": item.PARTIDAS };

       var data = JSON.stringify(ob);

       var url = endpoint + '/makesell.ashx';

       $.ajax({
            type: "POST",
            data: data,
            url: url,
            contentType: "application/json",
            dataType: 'json'
       }).done(function (res) {
           removePendingSale(item.id);
           setStatLabel("success", "Venta " + res.VENTA + " hecha :D");
           console.log(res);
       }); 
   
   
   $('#prods ul').empty();
   Partidas = []; 
   total = 0; 
   
   saveState();
  
   
} 

function renderPendingSales() {
    $('#pendingSalesList ul').empty();
    getPendingSales();
} 

function read(key) {
   var transaction = db.transaction(["prods"]);
   var objectStore = transaction.objectStore("prods");
   var request = objectStore.get(key);
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         $('#prodtb').val(request.result.ARTICULO);
         currentProd = request.result; 
         saveState();
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   };
} 

function read(key, callback) {
   var transaction = db.transaction(["prods"]);
   var objectStore = transaction.objectStore("prods");
   var request = objectStore.get(key);
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         callback(request.result);
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   };
} 

function insertPendingSell(){ 
    
    var d = new Date();
    var fecha = d.toLocaleDateString();
    var CANTIDAD = $('#qtytb').val();
    var cliente = $('#clienttb').val();
    var qty = $('#qtytb').val();
    var vendor = $('#usertb').val();
    
    if (isEmpty(cliente) == false && isEmpty(vendor) == false) {
        var newvta = {
            PRECIO   : total,
            CLIENTE  : cliente,
            USUFECHA : fecha,
            cantidad : qty,
            PARTIDAS : Partidas,
            vend     : vendor
        };


        db.ventas.add(newvta).then(function () {
            setStatLabel("sucess", "Venta almacenada como pendiente");
            clearState();
        });
    }
    else {
        setStatLabel("error", "Especifica un cliente y vendedor")
    }
    
}

function opendb(){
    
    db = new Dexie("mbptest20");

    db.version(1).stores({
        prods     : 'SP,DESCRIP',
        ventas    : "++id",
        clients   : "cliente,nombre",
        cob       : "COBRANZA,CLIENTE",
        pendigCob : "++selfId"
    });

    db.open().catch(function (e) {
        alert("Open failed: " + e);
    })
} 

function syncdb() {

    var step = 0.0;
    var vend = localStorage.getItem("user");
    
    setStatLabel("info", "Sincronizando bases de datos");
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + "/prods.ashx?take=5000";
    
    
    $.getJSON(url, function (results) {
        var count = 0; 
        step++;
       
        db.prods.bulkPut(results).then(function(){
            setStatLabel("success", "Productos sincronizados (" + step + "/3)");
        }); 
    }).fail(function (jqXHR) {
        window.alert("Error al descargar información del servidor :(");
    }) 
    
    var clientsUrl = endpoint + '/searchclient.ashx?vend=' + vend;

    db.clients.clear();
    
    $.getJSON(clientsUrl, function(r){
        db.clients.bulkPut(r).then(function () {
            step++;
            setStatLabel("success", "Clientes sincronizados(" + step + "/3)");
        })
    });

    var cob = localStorage.getItem("user");
    var coburl = endpoint + "/synccob.ashx?op=synccob&cob=" + cob;

    db.cob.clear();

    $.getJSON(coburl, function (r) {

        db.cob.bulkPut(r).then(function () {

            step++;
            setStatLabel("success", "Cobranza sincronizada(" + step + "/3)");
        })

    });
    
}

function searchProdOffline()
{
   
    var key = $('#searchProdText').val();
    
    db.prods.where("DESCRIP").startsWithIgnoreCase(key).each(function(prod){
        addToProdList(prod);
    });
} 

function addProdOffline(){
   
   var key = $('#prodtb').val();
  
  db.prods.get(key, function(item){
      instanceProdOffline(item);
  })
  
} 

function instanceProdOffline(prod){
    var price = parseFloat($('#pricetb').val()); 
    var qty = parseFloat($('#qtytb').val());
   
    var newP = {
        Precio      : price,
        Cantidad    : qty,
        Articulo    : prod.ARTICULO,
        Impuesto    : prod.TX,
        Costo       : prod.COSTO,
        Descrip     : prod.DESCRIP,
        Unique      : prod.U
    };
    Partidas.push(newP);
    
    total = calculateTotal();

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text       ('Articulo agregado, total: ' + total                               );
    //$('#prods ul'   ).append   ('<li class="list-group-item">' + prod.DESCRIP + '</li>'            );
    $('#pricetb').val(0  );
    $('#qtytb'  ).val(1  );
    $('#prodtb' ).val("" );
    
    saveState();
    
    renderPartida(newP);
    
}

function getPendingSales() {
    
    $('#pendingSaleTable tbody').remove();
    $('#pendingSaleTable').append($('<tbody></tbody>'));
    
    db.ventas.toCollection().each(function (item) {

        var pencil = $('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>'       );
        var remove = $('<span class="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>');
        var save =   $('<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>'  );
       

        var tr = $('<tr></tr>');
        var terminateButton =
            $('<button type="button" class="btn btn-success"></button>').html(pencil).click(
            function () {
                restorePendingSale(item.id);
                $('#pendingSalesModal').modal('hide');
            }
        );

        var modifyButton =
            $('<button type="button" class="btn btn-default"></button>').html(save).click(
            function () {
                terminateSell2(item);
            }
        );

        var removeButton =
            $('<button type="button" class="btn btn-default"></button>').html(remove);

        tr.append($('<th></th>').html(item.id         ));
        tr.append($('<th></th>').html(item.CLIENTE    ));

        tr.append($('<th></th>').html(terminateButton ));
        tr.append($('<th></th>').html(modifyButton    ));
        tr.append($('<th></th>').html(removeButton    ));
        
        $('#pendingSaleTable tbody').append(tr);
        
    }); 
    
}

function getPendingCob() {

    $('#pendingCobTable tbody').remove();

    $('#pendingCobTable').append($('<tbody></tbody>'));

    db.pendigCob.toCollection().each(function (item) {
        console.log(JSON.stringify(item));
        var tr = $('<tr></tr>');

        var cobid = $('<th></th>').html(item.COBRANZA);
        var client = $('<th></th>').html(item.CLIENTE);


        var button = $('<button class="btn btn-default">Terminar</button>').click(function () {
            sendCob(item);
        })
        
        var buttonth = $('<th></th>').html(button);

        tr.append(cobid);
        tr.append(client);
        tr.append(buttonth);

        $('#pengingCobTable').append($('<tbody></tbody>'));

        $('#pendingCobTable tbody').append(tr);

    });
}

function searchClientOffline(){
    var term = $('#searchClientText').val(); 
    
    if (term.length > 0){
         db.clients.where("nombre").startsWithIgnoreCase(term).each(function(c){
            addToClientList(c);
        });
    }
    
}

function getProdId(){ 
    _prodId_ = _prodId_ + 1;
    
    var hashids = new Hashids("valerizont201948mu"), 
        id = hashids.encode(_prodId_); 
        
    return "#" + id;
} 


function saveState() {
    client = $('#clienttb' ).val(); 
    var prod    = $('#prodtb'   ).val();
    var _price  = $('#pricetb'  ).val();
    var _qty    = $('#qtytb'    ).val();
     
    var _price  = parseFloat(_price   ); 
    var _qty    = parseFloat(_qty     );
    
    
    localStorage.setItem("total"               , total                              ); 
    localStorage.setItem("prodId"              , _prodId_                           ); 
    localStorage.setItem("cliente"             , client                             ); 
    localStorage.setItem("price"               , _price                             ); 
    localStorage.setItem("qty"                 , _qty                               );

    localStorage.setItem("partidas"            , JSON.stringify(Partidas           ));
    localStorage.setItem("currentProd"         , JSON.stringify(currentProd        ));
    
    //localStorage.setItem("producto"            , JSON.stringify(prod)               ); 
   
}

function getState(){
    
    console.log("Get state");
    
    var client = localStorage.getItem("cliente");

    var _qtyStr = localStorage.getItem("qty");

    var _qty = 0.0

    if (!isEmpty(_qtyStr)) {
        var _qty = parseFloat(_qtyStr)
    } else {

    }

    
    var strCurrentProd = localStorage.getItem("currentProd");

    if (isEmpty(strCurrentProd) == false && (strCurrentProd == 'undefined') == false) {
        currentProd = JSON.parse(strCurrentProd);
    } else {

    }

    var _priceStr = localStorage.getItem("price");
    
    
    if (!isEmpty(_priceStr)) {
        _price = parseFloat(_priceStr)
    } else {
        _price = 0.0
    }
     
    
    if (localStorage.getItem("partidas")){
        var parStr = localStorage.getItem("partidas"); 
    
    
    if (parStr.length > 0){
        Partidas = JSON.parse(parStr); 
        
        $.each(Partidas, function(index, value){
           renderPartida(value); 
        });
        
    }else{
        Partidas = new Array();
    }
    }else{
        Partidas = new Array();
    } 
    
    
    if (!_price){
        _pr = 0.0;
    }
     
    total = parseFloat(localStorage.getItem("total")); 
    if (!total){
        total = 0;
    }

    
    $("#qtytb"    ).val(_qty                    );
    $('#pricetb'  ).val(_price                  );
    $('#clienttb' ).val(client                  ); 
    
    if (!isEmpty(currentProd)) {
        $('#prodtb').val(currentProd.ARTICULO);
    }
    
}

function calculateTotal(){
    var __total__ = 0; 
    
    if (isEmpty(Partidas) == false) {
        Partidas.forEach(function (value) {
            var importe = value.Precio;
            var impuesto = value.Impuesto;
            var cantidad = value.Cantidad;

            var _importePlusImpuesto = (importe + (importe * impuesto)) * cantidad;

            __total__ = __total__ + _importePlusImpuesto;

        })
    }
    
    return __total__;
}

function restorePendingSale(id) {

    var cliente = $('#clienttb').val();
    var vendor = $('#usertb').val();

    messageBox(
            'Venta pendiente?',
            '¿Deseas conservar la venta actual como pendiente?',
            function () {
                insertPendingSell();
                restorePendingSale2(id);
                closeMessage();
                $('#configModal').modal('hide');
            },
            function () {
                restorePendingSale2(id);
                $('#configModal').modal('hide');
                closeMessage();
            }, 
            function () { YesNo("Sí", "No") });

}


function restorePendingSale2(id) {
    clearState();

    db.ventas.get(id, function (item) {
        Partidas = item.PARTIDAS
        cliente = item.CLIENTE 

        $('#clienttb').val(cliente);

        saveState();

        $.each(item.PARTIDAS, function (i, k) {
            renderPartida(k);
        });

    });

    db.ventas.delete(id).then(function () { console.log("deleted from ventas: " + id) });
}

function closeMessage() {
    $('#messageModal').modal('hide');
}

function closeInput() {
    $('#inputModal').modal('hide');
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function messageBox(title, text, accept, cancel, style) {
    $('#messageTitle' ).html(title );
    $('#messageText'  ).html(text  );
    $('#messageAccept').unbind('click').click(accept);
    $('#messageCancel').unbind('click').click(cancel);

    $('#messageModal').modal('show');

    style();
}

function inputBox(title, text, accept, cancel, style) {
    $('#inputTitle').html(title);
    $('#inputText').html(text);
    $('#inputAccept').unbind('click').click(accept);
    $('#inputCancel').unbind('click').click(cancel);

    $('#inputModal').modal('show');

    style();
}

function YesNo(yes, no) {
    $('#messageAccept'     ).html(yes );
    $('#messageCancel'     ).html(no  );
    $('#inputAccept'       ).html(yes );
    $('#inputCancel'       ).html(no  );

    $('#inputAccept').removeAttr("style");
    $('#inputAccept').attr('style', 'visibility:visible');
}

function AcceptCancel(accept, cancel) {
    $('#messageAccept' ).val(accept  );
    $('#messageCancel' ).val(cancel  );
    $('#inputAccept'   ).val(accept  );
    $('#inputCancel'   ).val(cancel  );

    $('#inputCancel').removeAttr("style");
    $('#inputCancel').attr('style', 'visibility:visible');
}

function accept(accept) {
    $('#messageAccept').val(accept);
    $('#messageCancel').attr('style', 'visibility:hidden');

    $('#inputAccept').val(accept);
    $('#inputCancel').attr('style', 'visibility:hidden');

}

function storeMessage(message) {
    
    var __curentProd = localStorage.getItem("currentProd");
    var __vend = localStorage.getItem("user");
    var __partidas = localStorage.getItem("partidas");
    var __endpoint = localStorage.getItem("endpoint")

    if (!isEmpty(__currentProd)) {
        __c = JSON.parse(__curentProd);
    }


}