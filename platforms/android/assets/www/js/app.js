document.addEventListener("deviceready", init, false);
function init() {

    $('#registratorScan').click(regScan);
    $('#startScan').click(startScan);
    $('#sendPost').click(sendRegistration);
    $('#regSwitch').click(regSwitch);

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

            if (result.cancelled) {
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
    $("#locationMsg").hide();

    if ($("#location_selection option:selected").text() === 'Válassz!') {
        $("#locationMsg").show();
        return;
    }
    cordova.plugins.barcodeScanner.scan(
        function (result) {

            $("#sendPost").prop("disabled", true);

            if (result.cancelled) {
                $("#results").append("<br/>" + 'Kártyabeolvasás megszakítva');
                return;
            }


            var s = "kártyaszám: " + result.text + "<br/>" +
                "formátum: " + result.format + "<br/>";

            $("#results").html(s);

            $('body').data('actualBarcode', result.text);

            $("#afterScan").show();

            $.get(config.urls.getUrl, { helyszin: $("#location_selection option:selected").text(), appkey: config.appkey_query, ssz: $('body').data('actualBarcode'), imei: device.uuid, reg_ssz: $('body').data('registratorBarcode')})
                .done(function (data) {

                    var dataArray = data.split(',');
                    $("#results").append("<br/><span class='resultSpan'>");

                    $("#results").append("Kimenet: " + dataArray[0] + "  ");
                    $("#results").append("Befizetett: " + dataArray[1] + "  ");
                    $("#results").append("Számláló: " + dataArray[2] + " ");
                    $("#results").append("Név: " + (dataArray[3] || "N/A" ) + "  ");
                    $("#results").append("Egyéb: " + (dataArray[4] || "N/A") + "  ");

                    $("#results").append("</span>");

                    if (data.trim().indexOf("YES,1") == 0) {
                        $("#sendPost").prop("disabled", false);
                        $("#results").append("<br/> <span class='success'>BELÉPHET</span>");
                    } else {
                        $("#results").append("<br/>  <span class='error'> NEM LÉPHET BE </span>");
                    }
                })
                .fail(function () {
                    $("#results").append("<br/>" + 'Hiba küldés közbe');
                });


        },
        function (error) {
            $("#results").append("<br/>" + 'Hiba scannelés közbe');
            $("#sendPost").prop("disabled", true);
        }
    );

}

function sendRegistration() {
    $("#locationMsg").hide();
    if ($("#location_selection option:selected").text() === 'Válassz!') {
        $("#locationMsg").show();
        return;
    }

    $.get(config.urls.getUrl, { helyszin: $("#location_selection option:selected").text(), appkey: config.appkey_note, ssz: $('body').data('actualBarcode'), imei: device.uuid, reg_ssz: $('body').data('registratorBarcode')})
        .done(function (data) {


            var dataArray = data.split(',');
            $("#postResults").append("<br/><span class='resultSpan'>");

            $("#postResults").append("Kimenet: " + dataArray[0] + "  ");
            $("#postResults").append("Befizetett: " + dataArray[1] + "  ");
            $("#postResults").append("Számláló: " + dataArray[2] + " ");
            $("#postResults").append("Név: " + (dataArray[3] || "N/A" ) + "  ");
            $("#postResults").append("Egyéb: " + (dataArray[4] || "N/A") + "  ");

            $("#postResults").append("</span>");

            if (data.trim().indexOf("NOK") == 0) {
                $("#postResults").append("<br/> <span class='error'> SIKERTELEN BELÉPTETÉS </span>")
            } else if (data.trim().indexOf(",1,") != -1) {
                $("#postResults").append("<br/>  <span class='success'> SIKERES BELÉPTETÉS</span>");
            } else {
                $("#postResults").append("<br/>  <span class='error'> NEM VÁRT HIBA</span>");
            }

            $("#sendPost").prop("disabled", true);
        })
        .fail(function () {
            $("#postResults").html('Hiba bejelentkezés közbe');
        });
}


function regSwitch() {
    $("#userRegistration").hide();
    $("#logon").show();
    $("#registratorResult").html("");
    $("#results").html("");
    $("#postResults").html("");
    $("#sendPost").prop("disabled", true);
}

