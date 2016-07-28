var Partidas = new Array();
var total = 0.0;
var claveadd_id = 0;
var db;
var request;
var currentProd;
var _prodId_ = 0;

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
        //Deselecciona las lineas de abajo para agregar el articulo directamente
        window.alert(item.DESCRIP);
/*
        

*/

        setPriceSelect(item);
        
        setStatLabel("info", item.DESCRIP); 
        currentProd = item;

                
        //console.log(JSON.stringify(item));
        
         
        $('#searchProdModal').modal('hide');
        saveState();
        
        //if (item.clavesadd.length > 0) {
        //    selectclaveadd(item.clavesadd, item);
        //}
         
        // Selecciona la linea de abajo para agregar el articulo directamente
        //selectclaveadd2(item.ARTICULO);
    })
      
    console.log(id + ";");
    $('#prodSearch ul').append(li);
   

       
}

function searchClient(){
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchClientText').val(); 
    
    if (term.length > 0)
    {
        var url = 
        endpoint + '/searchclient.ashx?c=' + term;
        
        $('#clientSearch ul').empty(); 
     
        $.getJSON(url, function (results) {
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
    /*
    $('#clientSearch ul').append(
         '<li class="list-group-item" id="' +
          result.cliente +  '">' +
          result.nombre + '</li>');
      
    
     
     $(document).on('click', '#' + result.cliente, 
     function(){
         
         $('#clienttb').val(result.cliente); 
         $('#searchClientModal').modal('hide');
         saveState();
     } ); 
     
     */ 
    
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
        // edit here, result will be an array with multiple product presentations
        instanceProd(results);
    }).fail(function (jqXHR) {
        setStatLabel("danger", "algo fallo :()")
    });


} 

function instanceProd(results) {
    //var price = results.ARTICULO.PRECIO1;
    var price = parseFloat($('#pricetb').val());
    var qty = parseFloat($('#qtytb').val());
    //window.alert(price);
    //if (results.clavesadd.length > 0)
    //{
    //    selectclaveadd(results.clavesadd, results.ARTICULO);
    //}else{
        var newP = {
        Precio: price,
        Cantidad: qty,
        Impuesto: results.ARTICULO.TX,
        Costo: results.ARTICULO.COSTO,
        Descrip: results.ARTICULO.DESCRIP,
        Articulo: results.ARTICULO.ARTICULO, 
        Unique: results.ARTICULO.U, 
    }; 
    
    Partidas.push(newP);
    
    total = calculateTotal();

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text('Articulo agregado, total: ' + total);

    $('#pricetb').val(0);
    $('#qtytb').val(1);
    $('#prodtb').val("");

    
    console.log(JSON.stringify(newP));
    
    renderPartida(newP);
    
    //}
} 

function renderPartida(partida){
    var li = $('<li class="list-group-item"></li>').attr("id", partida.Unique) 
    
    var qtyId = partida.Unique + "-qty"; 
    var descId = partida.Unique + "-desc";
    
    var qty = $('<div id="qtyArea" class="col-xs-1"></div').attr("id", qtyId).html(partida.Cantidad); 
    var descrip = $('<div class="col-xs-5"></div>').html(partida.Descrip);
    var content = $('<div class="row"></div>').append([qty, descrip]);
    
    li.append(content); 
    
    li.click(function(){
        var i = Partidas.length - 1;
        var p = Partidas[i]; 
        
        $('#tituloPartida').html(p.Descrip);
        setEditActions(i, p)
        $('#editPartidaModal').modal("show");
        
        //window.alert(p.Articulo); 
    }); 
    
    $('#prods ul').append(li); 
    
    saveState();
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
        
        //setStatLabel("success", "Partida editada, total: " + calculateTotal());

        $('#editPartidaStatus').html("Partida editada, total: " + calculateTotal());
        saveState();
        
    }); 
    
    $('#removePartidaButton').unbind('click').click(function(){
       Partidas.splice(partida, 1); 
       
       $('#'+data.Unique).remove();
       
       setStatLabel("success", "Partida removida, total: " + calculateTotal());
       $('#editPartidaModal').modal('hide');
       saveState();
        
    });
}

function statCheck2(){
    //window.alert("intentando conexión")
    setStatLabel("info", "intentando conexion");
    
    
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + '/dbstatus.ashx'; 
    
    var stat = $.getJSON(url, function(result){
        if (result.exists == true){
            
            $('#addButton'         ).unbind('click').click(addProd          );    // Add prod to prods to be sent
            $('#terminateButton'   ).unbind('click').click(terminateSell    );    // terminate sell on click
            $('#searchProdButton'  ).unbind('click').click(populateSearch   );    // On search prod click
            $('#validateProdButton').unbind('click').click(validateProd     );    // On validate product button click 
            $('#searchClientButton').unbind('click').click(searchClient     );
            
            setStatLabel("success", "Sistema cargado y listo");
        }else{
            setStatLabel("danger", "No se pudo conectar a la base de datos");
        }
    }).error(function(jqXHR, textStatus, errorThrown){
        $('#addButton'         ).unbind('click').click(addProdOffline       );    // Add prod to prods to be sent
        $('#terminateButton'   ).unbind('click').click(insertPendingSell    );
        $('#searchProdButton'  ).unbind('click').click(searchProdOffline    );
        $('#validateProdButton').unbind('click').click(validateProdOffline  );   // On validate product click 
        $('#searchClientButton').unbind('click').click(searchClientOffline  );
        
        setStatLabel("alert", "No se pudo conectar al servidor, usando conexión local");
    });
}

function instanceProd2(results){
    var price = results.ARTICULO.PRECIO1;
    
    var newP = {
        Precio: price,
        Cantidad: 1,
        Impuesto: 0,
        Costo: results.ARTICULO.COSTO,
        Articulo: results.ARTICULO.ARTICULO, 
        Unique: results.ARTICULO.U}
        
        Partidas.push(newP);
    
        total = calculateTotal();

        $("#statuslabel").removeAttr ("class"                                                             );
        $('#statuslabel').addClass   ("alert alert alert-success"                                         );
        $('#statuslabel').text       ('Articulo agregado, total: ' + total                                );
        $('#prods ul'   ).append     ('<li class="list-group-item">' + results.ARTICULO.DESCRIP + '</li>' );
        
        saveState();
}

 

function selectclaveadd2(art){
    // url del articulo 
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
    //$('#presList ul').append('<li>' + data[0].Dato1 + '</li>') 
    
    for (i = 0; i < data.length; i++) { 
        
        var item = data[i]; 
        var displayText = item.Desc;

        var displayHtml = $('<div></div>');

        var desc = $('<span></span>').html(displayText + '  ');
        var clavedesc = $('<small></small>').html(item.Clave);

        displayHtml.append(desc);
        displayHtml.append(clavedesc);
        
/*
        $('#presList ul').append(
            '<li class="list-group-item" id="' +
            item.Clave +  '">' +
            displayText + '</li>');
*/

        var li = $('<li class="list-group-item"></li>')
            .attr('id', "#" + item.U)
            .html(displayHtml)
            .click(function () {
                $('#qtytb').val(item.Cantidad);
                selectPrice();
                saveState();
                $('#clavesaddModal').modal('hide');
            });
      
        $('#presList ul').append(li);
      
        
    } // for
     
    
    
} //selectclaveadd

function terminateSell() {

   var clientid = $('#clienttb').val(); 
   var vend = $('#usertb').val(); 
    
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
            setStatLabel("success", "Venta hecha")
            console.log('res', res);
            // Do something with the result :)
       }); 
   
   // clear state and gui
   
   clearState();
   } else {
       setStatLabel("warning", "Especifica un cliente y un vendedor");
   }
   
}

function showTerminateSellResults(data, status) {
    $('#statuslabel').text(status);
} 

function saveUser(){
   
   /*
    
    var user = $('#usertb').val(); 
    var password = $('#passwordtb').val();
    
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + '/login.ashx?user=' + user + '&password=' + password; 
    
     $.getJSON(url, function (results) {
        if (results.success = true){
            localStorage.setItem("user", user);
            
            var message = 'Iniciaste sesión como ' + user
            setStatLabel("success", message);
            $('#configModal').modal('hide');
        }else{
            setStatLabel("warning", 'Usuario o contraseñas incorrectos');
            $('#configModal').modal('hide');
        }
    }
    ).fail(function (jqXHR) {
        setStatLabel("danger", "Ocurrió un error al iniciar sesión :()")
    }); 
    
    */
    
    
    var user = $('#usertb').val(); 
    
    var endpoint = localStorage.getItem("endpoint"); 
    var url = endpoint + 'vends.ashx?single=true&vend=' + user; 
    
    $.getJSON(url, function (results) {
        if (results.success = true){
            localStorage.setItem("user", user);
            
            var message = 'Iniciaste sesión como ' + user
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
            currentProd = results.ARTICULO;
            setStatLabel("info", results.ARTICULO.DESCRIP);

            
            setPriceSelect(results.ARTICULO);

            if (results.clavesadd.length > 0) {
                selectclaveadd(results.clavesadd, results.ARTICULO);
            }

            saveState();

        }
        ).fail(function (jqXHR) {
            setStatLabel("danger", "Ocurrió un error al obtener la información del servidor");
        });
    } else {
        setStatLabel("error", "Especifica un articulo primero!")
    }
    
} 


$('#qtytb').on('input', function(){
    text = $('#qtytb').val(); 
    
    selectPrice();
})  

function selectPrice(){
    var qty = parseFloat( $('#qtytb').val());
    var price = currentProd.C1 + ", " + currentProd.C2 + ", " + currentProd.C3;
    
    console.log(qty); 
    console.log(price);
    
    if (currentProd){
        
        
        if (qty < currentProd.C2) {
            console.log("P1");
            $('#pricetb').val(currentProd.PRECIO1);
            return;
            
        } 
        
        if (qty >= currentProd.C2 && qty < currentProd.C3){
            console.log("P2");
            $('#pricetb').val(currentProd.PRECIO2);
            return;
            
        }
        
        
        if (qty >= currentProd.C3){
            console.log("P3");
            $('#pricetb').val(currentProd.PRECIO3);
            
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

    $('#p1button').html('$' + prod.PRECIO1).unbind('click').click(function ()
    {
        
        $('#qtytb').val(prod.PRECIO1);
        selectPrice();
        saveState();
    });

    $('#p2button').html('$' + prod.PRECIO2).unbind('click').click(function ()
    {
        $('#qtytb').val(prod.PRECIO2);
        selectPrice();
        saveState();
    });

    $('#p3button').html('$' + prod.PRECIO3).unbind('click').click(function ()
    {
        selectPrice();
        $('#qtytb').val(prod.PRECIO3);
        saveState();
    });

    
}


/* 
===========================================================================================
                                 Offline operations 
===========================================================================================
*/

function validateProdOffline(){
    
    var prod = $('#prodtb').val(); 
    
    read(prod, function(result){
        
        currentProd = result; 
        setStatLabel("info", result.DESCRIP); 
        
        saveState();
        
    })
    
} 

function removePendingSale(id){
    //db.ventas.get(id).delete(function () {
    //    window.alert("elemento eliminado")
    //});

    db.ventas.where('id').equals(id).delete();
}

function terminateSell2(item) {
   
    
   //var clientid = $('#clienttb').val();
    
   //if (clientid.length > 0){
       var endpoint = localStorage.getItem("endpoint");

       
       var ob = { "ClientId": item.CLIENTE, Vendedor: item.vend, "Partidas": item.PARTIDAS };

       var data = JSON.stringify(ob);

       var url = endpoint + '//makesell.ashx';

       $.ajax({
            type: "POST",
            data: data,
            url: url,
            contentType: "application/json",
            dataType: 'json'
       }).done(function (res) {
           removePendingSale(item.id);
           setStatLabel("success", "Venta hecha");
           console.log('res', res);
            // Do something with the result :)
       }); 
   
   // clear state and gui
   $('#prods ul').empty();
   Partidas = []; 
   total = 0; 
   
   saveState();
    
   //}
   
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
         //window.alert(request.result);
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
         //window.alert(request.result);
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
    
    var newvta = {PRECIO: total, CLIENTE: cliente, USUFECHA: fecha, cantidad: qty, PARTIDAS: Partidas, vend: vendor}; 
    
    
    
    db.ventas.add(newvta).then(function(){
        setStatLabel("sucess", "Venta almacenada como pendiente");
        clearState();
    })
    
    
}

function opendb(){
    
    /*
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 

    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
 
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB.");
    }else{
        //window.alert("Listo para conectarse");
    }
     
    
    var request = window.indexedDB.open("mbptest8", 1);
 
    request.onerror = function(event) {
        console.log("error: ");
    };
 
    request.onsuccess = function(event) {
        db = request.result;
        console.log("success: "+ db);
    };
 
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        var prodStore = db.createObjectStore("prods" , {keyPath: "SP"                       });
        var sellStore = db.createObjectStore("ventas", {keyPath: "id", autoIncrement: true  }); 
        
         
        
    } 
    
    */ 
    
    db = new Dexie("mbptest10");

    db.version(1).stores({
        prods: 'SP',
        ventas: "++id",
        clients: "cliente,nombre"
    });

    db.open().catch(function (e) {
        alert("Open failed: " + e);
    })
} 

function syncdb(){
    
    setStatLabel("info", "Sincronizando bases de datos");
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + "/prods.ashx?take=5000";
    
    
    $.getJSON(url, function (results) {
        var count = 0; 
        
        /*
        for (count = 0; count < results.length; count++){
            var item = results[count]; 
            
            var request = db.transaction('prods', "readwrite")
                .objectStore("prods")
                .add(item);
                                 
            request.onsuccess = function(event) {
                console.log(item.DESCRIP + " agregado"); 
                setStatLabel("info", item.DESCRIP + " agregado");
            };
         
            request.onerror = function(event) {
                
                var request = db.transaction('prods', "readwrite")
                .objectStore("prods")
                .put(item);
                
                console.log(item.DESCRIP + " actualizado"); 
                setStatLabel("info", item.DESCRIP + " actualizado");
                       
            }

        } // for
        
        */ 
        
        db.prods.bulkPut(results).then(function(){
            setStatLabel("success", "base de datos sincronizada con exito");
        }); 
        
        
        //setStatLabel("success", "Bases de datos sincronizadas con exito");
        
    }// function
    ).fail(function (jqXHR) {
        window.alert("Error al descargar información del servidor :()")
    }).done(function(){
        setStatLabel("success", "Bases de datos sincronizadas con exito");
    }).complete(function(){
        setStatLabel("info", "Sincronizando base de datos");
    }); 
    
    var clientsUrl = endpoint + 'searchclient.ashx';
    
    $.getJSON(clientsUrl, function(r){
        db.clients.bulkPut(r).then(function(){
            setStatLabel("success", "Base de datos sincronizada con exito")
        })
    });
    
}

function searchProdOffline()
{
    //window.alert("hello");
    /*
    var key = $('#searchProdText').val();
    var data = read(key);
    if (data){
        $('#prodtb').val(data.DESCRIP);
    } 
    */ 
    
    var key = $('#searchProdText').val();
    
    //db.prods.get(key, function(item){
    //  window.alert(item.DESCRIP);
    //}) 
    
    db.prods.where("SP").startsWith(key).each(function(prod){
        addToProdList(prod);
    });
} 

function addProdOffline(){
   //var transaction = db.transaction(["prods"]);
   //var objectStore = transaction.objectStore("prods");
   var key = $('#prodtb').val();
   //var request = objectStore.get(key);
   
   /*
   
   request.onerror = function(event) {
      setStatLabel("danger", "no se pudo extraer información de la base de datos");
   };
   
   request.onsuccess = function(event) {
      if(request.result) {
         
         instanceProdOffline(request.result);
         
      }
      
      else {
         setStatLabel("danger", "no se pudo extraer información de la base de datos");
      }
   }; 
   
   */
  
  
  db.prods.get(key, function(item){
      instanceProdOffline(item);
  })
  
} 

function instanceProdOffline(prod){
    var price = parseFloat($('#pricetb').val()); 
    var qty = parseFloat($('#qtytb').val());
    //if (results.clavesadd.length > 0)
    //{
        //selectclaveadd(results.clavesadd, results.ARTICULO);
    //}else{
        var newP = {
        Precio: price,
        Cantidad: qty,
        Articulo: prod.ARTICULO,
        Impuesto: prod.TX,
        Costo: prod.COSTO,
        Descrip: prod.DESCRIP,
        Unique: prod.U
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
    
    //}
}

function getPendingSales(){
    /*
    var trans = db.transaction("ventas", "readwrite");
    var store = trans.objectStore("ventas");
    var items = [];
 
    trans.oncomplete = function(evt) {  
        callback(items);
    };
 
    var cursorRequest = store.openCursor();
 
    cursorRequest.onerror = function(error) {
        console.log(error);
    };
 
    cursorRequest.onsuccess = function(evt) {                    
        var cursor = evt.target.result;
        if (cursor) {
            items.push(cursor.value);
            cursor.continue();
        }
    };
    
    */ 
    
    db.ventas.toCollection().each(function(item){
        var div = $('<div class="list-group-item"></div>');
        var span = '<span>' + "venta: " + item.id + ", importe: " + item.PRECIO + '<span>';
        var br = '<br />';
        var button = $('<button type="button" class="btn btn-success">Enviar a MyBusiness</button>').click(
            function(){
                window.alert(item.id);
                terminateSell2(item);
            }
        )
            
        div.append(span);
        div.append(br);
        div.append(button);
            
        $('#pendingSalesList ul').append(div);
    }); 
    
} 

function searchClientOffline(){
    var term = $('#searchClientText').val(); 
    
    if (term.length > 0){
         db.clients.where("nombre").startsWith(term).each(function(c){
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


function saveState(){
    var _client = $('#clienttb' ).val(); 
    var prod    = $('#prodtb'   ).val();
    var _price  = $('#pricetb'  ).val();
    var _qty    = $('#qtytb'    ).val();
     
    var _price  = parseFloat(_price   ); 
    var _qty    = parseFloat(_qty     );
    
    
    localStorage.setItem("total"               , total                              ); 
    localStorage.setItem("prodId"              , _prodId_                           ); 
    localStorage.setItem("cliente"             , _client                            ); 
    localStorage.setItem("price"               , _price                             ); 
    localStorage.setItem("qty"                 , _qty                               );
    localStorage.setItem("partidas"            , JSON.stringify(Partidas)           );
    localStorage.setItem("currentProd"         , JSON.stringify(currentProd)        );
    localStorage.setItem("producto"            , JSON.stringify(prod)               ); 
    
    console.log("cantidad" + _qty)
}

function getState(){
    
    console.log("Get state");
    
    var client = localStorage.getItem("cliente");
    var prod = JSON.parse(localStorage.getItem("producto")); 
    var _qty = localStorage.getItem("qty");
    var _price = parseFloat(localStorage.getItem("price"));
    
    currentProd  = JSON.parse(localStorage.getItem("currentProd")); 
    
    if (localStorage.getItem("partidas")){
        var parStr = localStorage.getItem("partidas"); 
    
    
    
    if (parStr.length > 0){
        Partidas = JSON.parse(parStr); 
        
        $.each(Partidas, function(inde, value){
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
    
    $("#qtytb"    ).val(_qty    );
    $('#pricetb'  ).val(_price  );
    $('#clienttb' ).val(client  ); 
    $('#prodtb'   ).val(prod    ); 
    
}

function calculateTotal(){
    var __total__ = 0; 
    
    Partidas.forEach(function(value){
        var importe  = value.Precio;
        var impuesto = value.Impuesto;
        var cantidad = value.Cantidad;
        
        //window.alert(importe + "," + impuesto + "," + cantidad);
        
        var _importePlusImpuesto = (importe + (importe * impuesto)) * cantidad;
        
        __total__ = __total__ + _importePlusImpuesto;
        
    })
    
    return __total__;
    
    
}