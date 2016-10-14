$(document).ready(function(){
    onLoad();
}); 

function onLoad() {

    var beta = false;

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
        //$('#addButton'             ).click(addProdOffline       );    // Add prod to prods to be sent
        //$('#terminateButton'     ).click(terminateSell        );    // terminate sell on click
        //$('#terminateButton'     ).click(insertPendingSell    );
        $('#terminateButton'       ).click(insertPendingSell    ); 
        //$('#searchProdButton'    ).click(populateSearch       );    // On search prod click
        //$('#searchClientButton'  ).click(searchClient         );    // On search client click 
        $('#searchClientButton'    ).click(searchClientOffline  );    // On search client offline
        $('#saveUserBtn'           ).click(saveUser             );    // On Save user click
        $('#syncdb'                ).click(syncdb               );
        // x $('#connectdb'        ).click(opendb               );    
         
        //$('#searchProdButton'      ).click(searchProdOffline    );
        $('#connectserver'         ).click(statCheck2           );
        $('#displayClavesaddBtn'   ).click(displayClavesadd     );
        $('#mnuDisplayCob'         ).click(openCob              );
        $('#pendingButton'         ).click(insertPendingSell    );


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

            $('#mainCobModal').modal('show');
            
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
            
            updatePrice();
            
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
                updatePrice();
            }else{
                $('#qtytb').val(qty);
                updatePrice();
            }
            
            saveState();
            
        });


        $('#button-press-plus').click(function () {
            var val = $('#pressqtytb').val();

            if (isEmpty(val) == false) {
                val++;

            } else {
                val = 1;
            }

            $('#pressqtytb').val(val);

        });

        $('#button-press-minus').click(function () {
            var val = $('#pressqtytb').val();

            if (isEmpty(val) == false) {
                val--;

                if (val <= 1) {
                    val = 1
                }

            } else {
                val = 1;
            }

            $('#pressqtytb').val(val);

        });


        $('#pricetb').change(function () {
            var p = $('#pricetb').val();

            if (!isEmpty(p)) {
                p = parseFloat(p);
            }

            localStorage.setItem("price", p);

            var __currentProd = localStorage.getItem("currentProd");

            if (!isEmpty("currentProd")) {
                __currentProd = JSON.parse(__currentProd)
                if (p < __currentProd.CST) {

                    messageBox("¿Precio?", "El precio especificado es menor al costo del articulo",
                        function () { closeMessage(); },
                        function () { },
                        function () { accept("Aceptar"); }
                        );

                    $('#pricetb').val(__currentProd.CST)
                }
            }

        });

        $('#qtytb').change(function () {
            var q = $('#qtytb').val();
            localStorage.setItem("qty", q);
            updatePrice();
        });

      

        calculateTotal(function (t) {
            $('#totalLabel').html(t);
        })


    // BETA FEATURE: use plugin plugin 

        if (beta == true) {
            var html = '<div><button id="plugin-button-1" class="btn btn-default">hola</button></div>';
            var js = "$('#plugin-button-1').click(function(){window.alert('fuck, yeah');});";

            var htmlBlob = new Blob([html], { type: "text/html" });
            var jsBlob = new Blob([js], { type: "text/javascript" });


            var htmlReader = new FileReader();
            //handler executed once reading(blob content referenced to a variable) from blob is finished. 
            htmlReader.addEventListener("loadend", function (e) {
                $('#plugins').html(e.srcElement.result);
            });
            //start the reading process.
            htmlReader.readAsText(htmlBlob);

            var script = document.createElement('script');
            //createObjectURL returns a blob URL as a string.
            script.src = window.URL.createObjectURL(jsBlob);
            document.body.appendChild(script);



            $('#pluginModal').modal('show');
        }

}