function getProdId(){ 
    _prodId_ = _prodId_ + 1;
    
    var hashids = new Hashids("valerizont201948mu"), 
        id = hashids.encode(_prodId_); 
        
    return "#" + id;
} 


function saveState(){
    var client = $('#clienttb' ).val(); 
    var prod   = $('#prodtb'   ).val();
    var _price = $('#pricetb'  ).val();
    var _qty   = $('#qtytb'    ).val();
     
    var _price = parseFloat(_price   ); 
    var _qty   = parseFloat(_qty     );
    
    localStorage.setItem("partidas"            , Partidas           ); 
    localStorage.setItem("total"               , total              ); 
    localStorage.setItem("currentProd"         , currentProd        ); 
    localStorage.setItem("prodId"              , _prodId_           ); 
    localStorage.setItem("cliente"             , client             ); 
    localStorage.setItem("producto"            , prod               ); 
    localStorage.setItem("price"               , _price             ); 
    localStorage.setItem("qty"                 , _qty               );
    
    console.log("cantidad" + _qty)
}

function getState(){
    
    var client = localStorage.getItem("cliente");
    var prod = localStorage.getItem("producto"); 
    var _qty = localStorage.getItem("qty");
    var _price = localStorage.getItem("price");
    
    console.log("==cantitad" + _qty);
    console.log("Get state");
    
    currentProd  = localStorage.getItem("currentProd"); 
    
    Partidas =  localStorage.getItem("partidas"); 
    
    if (!Partidas){
        Partidas = new Array();
    }
     
    total = localStorage.getItem("total"); 
    if (!total){
        window.alert(total);
        total = 0;
    }
    
    
        $("#qtytb").val(_qty);
    
        $('#pricetb').val(_price);
    
    
    $('#clienttb').val(client); 
    $('#prodtb'  ).val(prod  ); 
    
    
    
}