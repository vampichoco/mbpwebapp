$(document).ready(function(){
    onLoad();
}); 

function onLoad(){ 
    
    
        // Main page handlers   
        $('#sendButton').click(sellsingle); // Sell Single Click
        $('#addButton').click(addProd); // Add prod to prods to be sent
        $('#terminateButton').click(terminateSell); // terminate sell on click
        $('#searchProdButton').click(populateSearch); // On search prod click
        $('#searchClientButton').click(searchClient); // On search client click

        //Get enpoint setting
        var endpoint = localStorage.getItem("endpoint");
        $('#urltb').val(endpoint);

        // When save button is clicked, store new url endpoint
        $('#saveUrlBtn').click(function () { 
            var urlendpoint = $('#urltb').val();
            localStorage.setItem("endpoint", urlendpoint); 
        });

        // Set status label to loader
        $('#statuslabel').text('Bienvenido, el sistema está cargado');
}