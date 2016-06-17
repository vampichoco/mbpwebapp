var Partidas = new Array();
var total = 0.0;

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

function populateSearch(results) {
    
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
            setStatLabel("danger", "Un error ocurrió")
        });
        
    }else{
        setStatLabel("warning", 'Escribe un articulo para buscar')
    }
        
 
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
        })
    }else{
       setStatLabel("warning", 'Escribe un cliente para buscar');
    }
     
} 

function addToClientList(result){
    $('#clientSearch ul').append(
         '<li class="list-group-item" id="' +
          result.cliente +  '">' +
          result.nombre + '</li>');
      
    
     
     $(document).on('click', '#' + result.cliente, 
     function(){
         $('#clienttb').val(result.cliente); 
         $('#searchClientModal').modal('hide');
     } );
}

function addToProdList(item)
{
    
     
     $('#prodSearch ul').append(
         '<li class="list-group-item" id="' +
          item.ARTICULO +  '">' +
          item.DESCRIP + '</li>');
      
   
     $(document).on('click', '#' + item.ARTICULO, 
     function(){
         window.alert(item.PRECIO);
         $('#prodtb').val(item.ARTICULO);
         $('#pricetb').val(item.PRECIO); 
         $('#searchProdModal').modal('hide');
     } );
       
}

function addProd(results) {
    var endoint = localStorage.getItem("endpoint");

    var prodId = $('#prodtb').val();

    var queryString = endoint +  '/prods.ashx?single=true&p=' + prodId;

    var prod = $.getJSON(queryString, function (results) {
        // edit here, result will be an array with multiple product presentations
        instanceProd(results);
    }).fail(function (jqXHR) {
        setStatLabel("danger", "algo fallo :()")
    });


} 

function statCheck(){
    setStatLabel("info", "intentando conexion")
    
    
    var endpoint = localStorage.getItem("endpoint"); 
    
    var url = endpoint + '/dbstatus.ashx'; 
    
    var stat = $.getJSON(url, function(result){
        if (result.exists == true){
            setStatLabel("success", "Sistema cargado y listo")
        }else{
            setStatLabel("danger", "No se pudo conectar a la base de datos")
        }
    }).fail(function(jqXHR){
        setStatLabel("danger", "No se pudo conectar al servidor")
    });
}

function instanceProd(results) {
    var price = $('#pricetb').val();
    if (results.clavesadd.length > 0)
    {
        selectclaveadd(results.clavesadd, results.ARTICULO);
    }else{
        var newP = {
        Precio: price,
        Cantidad: 1,
        Impuesto: 0,
        Costo: results.ARTICULO.COSTO,
        Articulo: results.ARTICULO.ARTICULO
    };
    Partidas.push(newP);
    
    total = total + newP.Precio;

    $("#statuslabel").removeAttr ("class"                                                            );
    $('#statuslabel').addClass   ("alert alert alert-success"                                        );
    $('#statuslabel').text       ('Articulo agregado, total: ' + total                               );
    $('#prods ul'   ).append     ('<li class="list-group-item">' + results.ARTICULO.DESCRIP + '</li>' );
    }
} 

function selectclaveadd(data, art){
    $('#presList ul').empty();
    $("#presList ul").find("*").off();
    $('#clavesaddModal').modal('show');
    //$('#presList ul').append('<li>' + data[0].Dato1 + '</li>') 
    
    for (i = 0; i < data.length; i++) { 
        
        var item = data[i]; 
        
        
        var displayText = item.Clave + '(' + item.Precio + ')';
        
        $('#presList ul').append(
            '<li class="list-group-item" id="' +
            item.Clave +  '">' +
            displayText+ '</li>'); 
        
        //$('#presList ul').append('<li class="list-group-item">' + item.Dato1 +'</li>');
      
   
        $("#presList ul").unbind('click').on('click', '#' + item.Clave, 
            function(){
                var newP = {
                    Precio: item.Precio,
                    Cantidad: 1,
                    Impuesto: 0,
                    Costo: art.COSTO,
                    Articulo: art.ARTICULO
                };
                Partidas.push(newP);
    
                total = total + newP.Precio;
                
                $("#statuslabel"    ).removeAttr ("class"                                                    );
                $('#statuslabel'    ).addClass   ("alert alert alert-success"                                );
                $('#statuslabel'    ).text       ('Articulo agregado, total: ' + total                       );
                $('#prods ul'       ).append     ('<li class="list-group-item">' + art.DESCRIP + '</li>'     );
                $('#clavesaddModal' ).modal      ('show'                                                     );
        } // function
        ); // on click
        
    } // for
     
    
    
} //selectclaveadd

function terminateSell() {
   var clientid = $('#clienttb').val();
    
   if (Partidas.length > 0 && clientid.length > 0){
       var endoint = localStorage.getItem("endpoint");

       
       var ob = { "ClientId": clientid, "Partidas": Partidas };

       var data = JSON.stringify(ob);

       var url = endoint + '//makesell.ashx';

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
   
   $('#prods ul').empty();
   Partidas = []; 
   total = 0; 
   }
   
}

function showTerminateSellResults(data, status) {
    $('#statuslabel').text(status);
} 

function saveUser(){
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