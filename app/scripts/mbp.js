var Partidas = new Array();
var total = 0.0;

function sellsingle() {

    

    $('sendButton').text('Sending request');
    var prodId = $('#prodtb').val();
    var clientid = $('#clienttb').val();

    var queryString =
        endpoint + '/sellsingle.ashx?prod=' + prodId + '&client=' + clientid + '&format=json';

    $.getJSON(queryString, function (results) {
        showSellSingleResults(results);
    }
    ).fail(function (jqXHR) {
        $('#statuslabel').text('An error occurred :(');
    })

return false;

}

function showSellSingleResults(results) {
    var vta = results.VENTA;
    $('#statuslabel').text('Venta ' + vta + ' hecha');
}

function populateSearch(results) {
    
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchProdText').val(); 
    
    var url = 
        endpoint + '/search.ashx?q=contains&c=' + term; 
        
    $('#prodSearch ul').empty();
    
    $.getJSON(url, function (results) {
        for (i = 0; i < results.length; i++) { 
             
            addToProdList(results[i]);
        }
    }
    ).fail(function (jqXHR) {
        $('#statuslabel').text('An error occurred :(');
    })
    

} 

function searchClient(){
    var endpoint = localStorage.getItem("endpoint");
    var term = $('#searchClientText').val(); 
    
    var url = 
        endpoint + '/searchclient.ashx?c=' + term;
        
     $('#clientSearch ul').empty(); 
     
     $.getJSON(url, function (results) {
        for (i = 0; i < results.length; i++) { 
             
            addToClientList(results[i]);
        }
    }
    ).fail(function (jqXHR) {
        $('#statuslabel').text('An error occurred :(');
    })
     
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
         $('#prodtb').val(item.ARTICULO); 
         $('#searchProdModal').modal('hide');
     } );
       
}

function addProd(results) {
    var endoint = localStorage.getItem("endpoint");

    var prodId = $('#prodtb').val();

    var queryString = endoint +  '/prods.ashx?single=true&q=prod&p=' + prodId

    var prod = $.getJSON(queryString, function (results) {
        instanceProd(results);
    }).fail(function (jqXHR) {
        $('#statuslabel').text(jqXHR.responseText);
    });


}

function instanceProd(results) {
    var newP = {
        Precio: results.PRECIO1,
        Cantidad: 1,
        Impuesto: 0,
        Costo: results.COSTO,
        Articulo: results.ARTICULO
    };
    Partidas.push(newP);
    
    total = total + newP.Precio;

    $('#statuslabel').addClass("alert alert alert-success");
    $('#statuslabel').text('Articulo agregado, total: + ' + total);
    $('#prods ul').append('<li class="list-group-item">' + results.DESCRIP + '</li>');
}

function terminateSell() {

   var endoint = localStorage.getItem("endpoint");

   var clientid = $('#clienttb').val();
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
       $('#statuslabel').addClass("alert alert-success");
       $("#statuslabel").text("Venta hecha")
       console.log('res', res);
       // Do something with the result :)
   });
}

function showTerminateSellResults(data, status) {
    $('#statuslabel').text(status);
}