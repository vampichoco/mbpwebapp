$(document).ready(function(){
    onLoad();
}); 

function onLoad() {

    //inputBox('Hola', "Cuadro de mensaje",
    //    function () { window.alert($("#messagetb").val()) },
    //    function () { window.alert("cancel") },
    //    function () { window.alert("Style"); accept("Aceptar")});
    
        opendb();
        statCheck2();
        getState();

        
    
        // Main page handlers   
        $('#sendButton'            ).click(sellsingle           );    // Sell Single Click
        //$('#addButton'           ).click(addProd              );    // Add prod to prods to be sent
        $('#addButton'             ).click(addProdOffline       );    // Add prod to prods to be sent
        //$('#terminateButton'     ).click(terminateSell        );    // terminate sell on click
        //$('#terminateButton'     ).click(insertPendingSell    );
        $('#terminateButton'       ).click(insertPendingSell    ); 
        //$('#searchProdButton'    ).click(populateSearch       );    // On search prod click
        //$('#searchClientButton'  ).click(searchClient         );    // On search client click 
        $('#searchClientButton'    ).click(searchClientOffline  );    // On search client offline
        $('#saveUserBtn'           ).click(saveUser             );    // On Save user click
        $('#syncdb'                ).click(syncdb               );
        // x $('#connectdb'        ).click(opendb               );    
         
        $('#searchProdButton'      ).click(searchProdOffline    );
        $('#connectserver'         ).click(statCheck2           );
        $('#displayClavesaddBtn'   ).click(displayClavesadd     );
        $('#mnuDisplayCob'         ).click(openCob              );
        $('#pendingButton'         ).click(insertPendingSell    );

        //$('#connectserver').click(function () {
        //    localStorage.setItem("workoffline", "false");
        //    statCheck2();
        //    window.alert("hello1");
        //});

        //$('#workofflineButton').click(function () {
        //    window.alert("Attemting to work Offline");
        //    localStorage.setItem("workoffline", "true");
        //    workOffline()
    //});

        var __user__ = localStorage.getItem("user");

        if (isEmpty(__user__)){
            inputBox("Usuario", "Por favor introduce tu clave de vendedor",
                function () {
                    localStorage.setItem("user", $('#messagetb').val());
                    closeInput();
                },
                function () { },
                function () { accept(); });
        }
        
        $('#viewpendingsales'  ).click(function(){
            renderPendingSales();
            getPendingCob();
            $('#pendingSalesModal').modal("show");
        }) 
        
        $('#prodtb').click(function (e) {
            e.preventDefault();

            $('#searchProdModal').modal("show");

            var input = $("#searchProdText");
            input[0].selectionStart = 0

            $('#searchProdText').focus()
            $('#prodSearch ul').empty();
        });

        var wo = localStorage.getItem("workoffline")
        if (wo == "true") {
            $('#connToggle').bootstrapToggle('off')
        } else {
            $('#connToggle').bootstrapToggle('on')
        }

        $('#connToggle').change(function () {
            var val = $(this).prop('checked');
            if (val == true) {
                localStorage.setItem("workoffline", "false");
                statCheck2();
                
            } else {
                //window.alert("Attemting to work Offline");
                localStorage.setItem("workoffline", "true");
                workOffline()
            }
        });

        function openCob() {
            var wo = localStorage.getItem("workoffline");

            if (wo == "true") {
                getCobOffline();
            } else {
                getCob();
            }

            $('#cobScreen').attr("style", "width:100%");
            
        }

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


        $('#pricetb').change(function () {
            var p = $('#pricetb').val();
            localStorage.setItem("price", p);
        })

        $('#qtytb').change(function () {
            window.alert("hello");
            var q = $('#qtytb').val();
            localStorage.setItem("qty", q);
        });
  
}