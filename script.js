var map;
var src = 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';

function init(file = src) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(-19.257753, 146.823688),
        zoom: 1,
        mapTypeId: 'terrain'
    });

    var kmlLayer = new google.maps.KmlLayer(file, {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: map
    });

    kmlLayer.addListener('click', function (kmlEvent) {
        var text = kmlEvent.featureData.description;
        showInContentWindow(text);
    });

    function showInContentWindow(text) {
        var sidediv = document.getElementById('content-window');
        sidediv.innerHTML = text;
    }
}

$(function () {
    $('#set_btn').click(function () {
        const local = $('#kmlLocal');
        const url = $('#kmlUrl');
        let file;

        if (local.val()) {
            file = local.val();
            local.val('');
        } else if (url.val()) {
            file = url.val();
            url.val('')
        } else {
            alert('File not selected');
            return;
        }
        init(file);
    });
});