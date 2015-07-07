var resultDiv;

document.addEventListener("deviceready", init, false);
function init() {
    document.querySelector("#startScan").addEventListener("touchend", startScan, false);
    document.querySelector("#sendPost").addEventListener("touchend", sendPost, false);

    // init options
    var dropDown = $('#location_selection');
    dropDown.find('option').remove();

    $.each(config.locations,function(key, value)
    {
        dropDown.append('<option value=' + key + '>' + value + '</option>');
    });
}

function startScan() {

    $("#postResults").html("");

    cordova.plugins.barcodeScanner.scan(
        function (result) {
            var s = "barcode: " + result.text + "<br/>" +
                "formátum: " + result.format + "<br/>" +
                "megszakítva: " + result.cancelled;

            $("#results").html(s);

            $('body').data('actualBarcode', result.text);


            $.post(config.urls.getUrl, collectPostData())
                .done(function (data) {
                    $("#results").append("<br/>" + data);
                })
                .fail(function () {
                    $("#results").append("<br/>" + 'Hiba küldés közbe');
                });


        },
        function (error) {
            $("#results").append("<br/>" + 'Hiba scannelés közbe');
        }
    );

}

function sendPost() {

    $.post(config.urls.postUrl, collectPostData())
        .done(function (data) {
            $("#postResults").html(data);
        })
        .fail(function () {
            $("#postResults").html('Hiba bejelentkezés közbe');
        });

}

function collectPostData(){
    var postData = {};
    postData.helyszin = $("#location_selection option:selected").text();
    postData.authorizationCode = "random";
    postData.barcode = $('body').data('actualBarcode');

    return postData;
}