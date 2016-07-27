$(document).ready(function(){
    onLoad();
}); 

function onLoad(){ 
    
        opendb();
        statCheck2();
        getState();
    
        // Main page handlers   
        $('#sendButton'        ).click(sellsingle           );    // Sell Single Click
        //$('#addButton'       ).click(addProd              );    // Add prod to prods to be sent
        $('#addButton'         ).click(addProdOffline       );    // Add prod to prods to be sent
        //$('#terminateButton' ).click(terminateSell        );    // terminate sell on click
        //$('#terminateButton' ).click(insertPendingSell    );
        $('#terminateButton'   ).click(insertPendingSell    ); 
        //$('#searchProdButton').click(populateSearch       );    // On search prod click
        //$('#searchClientButton').click(searchClient       );    // On search client click 
        $('#searchClientButton').click(searchClientOffline  );    // On search client offline
        $('#saveUserBtn'       ).click(saveUser             );    // On Save user click
        // x $('#connectdb'    ).click(opendb               );
        $('#syncdb'            ).click(syncdb               ); 
        $('#searchProdButton'  ).click(searchProdOffline    );
        $('#connectserver'     ).click(statCheck2           );
        
        
        $('#viewpendingsales'  ).click(function(){
            renderPendingSales(); 
            $('#pendingSalesModal').modal("show");
        }) 
        
        $('#prodtb').click(function(){
           $('#searchProdModal').modal("show"); 
        });

        //Get enpoint setting
        var endpoint = localStorage.getItem("endpoint");
        $('#urltb').val(endpoint); 
        
        // get user setting 
        
        var user = localStorage.getItem("user"); 
        $('#usertb').val(user);

        // When save button is clicked, store new url endpoint
        $('#saveUrlBtn').click(function () {
            var urlendpoint = $('#urltb').val();
            localStorage.setItem("endpoint", urlendpoint); 
            statCheck2();
        });

        // Set status label to loader
        //$('#statuslabel').text('Bienvenido, el sistema está cargado');
        
        $('#button-qty-plus').click(function(){
            var qty = parseInt($('#qtytb').val());
            
            if (qty.length == 0 || isNaN(qty)){
                qty = 0;
            }
             
            qty = qty + 1; 
            
            $('#qtytb').val(qty);
            selectPrice();
            saveState();
        });
        
        $('#button-qty-minus').click(function(){
            var qty = parseInt($('#qtytb').val());
            
            if (qty.length == 0 || isNaN(qty)){
                qty = 0;
            }
             
            qty = qty - 1; 
            
            if (qty < 0){
                $('#qtytb').val(0);
                selectPrice();
            }else{
                $('#qtytb').val(qty);
                selectPrice();
            }
            
            saveState();
            
        });
}