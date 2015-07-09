document.addEventListener("deviceready", init, false);
function init() {

    $('#registratorScan').click(regScan);
    $('#startScan').click(startScan);
    $('#sendPost').click(sendRegistration);

    // init options
    var dropDown = $('#location_selection');
    $.each(config.locations, function (key, value) {
        dropDown.prepend('<option value=' + key + '>' + value + '</option>');
    });

}

function regScan() {

    $("#registratorResult").html("");

    cordova.plugins.barcodeScanner.scan(
        function (result) {

            if (result.cancelled)
            {
                $("#registratorResult").append("<br/>" + 'Kártyabeolvasás megszakítva');
                return;
            }

            var s = "kártyaszám: " + result.text + "<br/>";
            $("#registratorResult").html(s);
            $('body').data('registratorBarcode', result.text);
            $("#userRegistration").show();
            $("#logon").hide();
        },
        function (error) {
            $("#registratorResult").append("<br/>" + 'Hiba scannelés közbe');
        }
    );

}



function startScan() {

    $("#postResults").html("");

    cordova.plugins.barcodeScanner.scan(
        function (result) {

            if (result.cancelled)
            {
                $("#results").append("<br/>" + 'Kártyabeolvasás megszakítva');
                return;
            }

            var s = "kártyaszám: " + result.text + "<br/>" +
                "formátum: " + result.format + "<br/>";

            $("#results").html(s);

            $('body').data('actualBarcode', result.text);

            $("#afterScan").show();

            $.get(config.urls.getUrl, { helyszin: $("#location_selection option:selected").text(), appkey: config.appkey_query, ssz: $('body').data('actualBarcode'), imei: device.uuid })
                .done(function (data) {

                    $("#results").append("<br/><span id='resultSpan'>" + data + "</span>");

                    if (data.trim().startsWith("YES")) {
                        $("#sendPost").attr("disabled", false);
                    }
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

function sendRegistration() {

    if ($("#location_selection option:selected").text() === 'Válassz!') {
        $("#postResults").append("<br/>" + 'Kérlek válassz helyszint!');
        return;
    }

    $.get(config.urls.getUrl, { helyszin: $("#location_selection option:selected").text(), appkey: config.appkey_note, ssz: $('body').data('actualBarcode'), imei: device.uuid })
        .done(function (data) {
            $("#postResults").html(data);

            $("#sendPost").attr("disabled", true);
        })
        .fail(function () {
            $("#postResults").html('Hiba bejelentkezés közbe');
        });
}

