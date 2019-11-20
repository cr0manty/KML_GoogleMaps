let map;
const src = 'https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml';

function init_url(file = src) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(-19.257753, 146.823688),
        zoom: 1,
        mapTypeId: 'terrain'
    });

    let kmlLayer = new google.maps.KmlLayer(file, {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: map
    });

    kmlLayer.addListener('click', function (event) {
        const content = event.featureData.infoWindowHtml;
        $('#content-window').html(content);
    });
}

function read_file(file) {

}

function init_local(marks) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 49.9842435, lng: 36.2600159},
        mapTypeId: 'terrain'
    });

    marks.forEach(function (data) {
        var marker = new google.maps.Marker({
            position: data.latlng,
            map: map,
            description: data.description,
            name: data.name
        });

        marker.addListener('click', function () {
            const infowindow = new google.maps.InfoWindow({
                content: `<h6>${marker.name}</h6>
                    <p class="google_mark">${marker.description}</p>`
            });
            infowindow.open(map, marker);
        });
    })
}

$(function () {
    $('#set_btn').click(function () {
        const local = $('#kmlLocal');
        const url = $('#kmlUrl');

        if (local.val()) {
            read_file(local.val());
            local.val('')
        } else if (url.val()) {
            init_url(url.val());
            url.val('')
        } else {
            alert('File not selected');
        }
    });
});