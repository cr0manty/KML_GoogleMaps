let map;

function init_url(url = null) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(-19.257753, 146.823688),
        zoom: 1,
        mapTypeId: 'terrain'
    });
    if (url) {
        if (!url.startsWith('http') || !url.endsWith('.kml')) {
            alert('The url should lead to a KML file ');
            return;
        }
        const kmlLayer = new google.maps.KmlLayer(url, {
            suppressInfoWindows: true,
            preserveViewport: false,
            map: map
        });

        kmlLayer.addListener('click', function (event) {
            const content = event.featureData.infoWindowHtml;
            $('#content-window').html(content);
        });
    }
}

function read_file(file) {
    const fileReader = new FileReader();
    fileReader.onload = async function (data) {
        const result = await extractMarks(data.target.result);
        init_local(result);
        console.log(result);
    };
    fileReader.onerror = function (event) {
        console.error("Файл не может быть прочитан! код: " + event.target.error.code);
    };
    fileReader.readAsText(file)
}

async function extractMarks(plainText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(plainText, "text/xml");
    const marks = [];

    if (xmlDoc.documentElement.nodeName === "kml") {
        for (const item of xmlDoc.getElementsByTagName('Placemark')) {
            let coordinates = [];

            for (const marker of item.getElementsByTagName('Point')) {
                const coords = marker.getElementsByTagName('coordinates')[0]
                    .childNodes[0].nodeValue.trim().split(",");
                coordinates.push({lat: +coords[1], lng: +coords[0]});
            }
            let marker = {
                name: item.getElementsByTagName('name')[0].childNodes[0].nodeValue.trim(),
                description: item.getElementsByTagName('description')[0].childNodes[0].nodeValue.trim(),
                coordinates: coordinates[0]
            };
            marks.push(marker);
        }
    } else {
        throw "error while parsing";
    }
    return marks;
}

function init_local(marks) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 49.9842435, lng: 36.2600159},
        mapTypeId: 'terrain'
    });

    marks.forEach(function (data) {
        let marker = new google.maps.Marker({
            position: data.coordinates,
            map: map,
            description: data.description,
            name: data.name
        });

        marker.addListener('click', function () {
            const description = marker.description ? `<p class="google_mark">${marker.description}</p>` : '';
            const infowindow = new google.maps.InfoWindow({
                content: `<h6>${marker.name}</h6>` + description
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
            read_file(local[0].files[0]);
            local.val('')
        } else if (url.val()) {
            init_url(url.val());
            url.val('')
        } else {
            alert('File not selected');
        }
    });
});