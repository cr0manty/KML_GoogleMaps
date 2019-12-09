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
        try {
            const result = await extract_marks(data.target.result);
            init_local(result);
        } catch (error) {
            alert(error);
        }
    };
    fileReader.onerror = function (event) {
        alert("Read file error, code: " + event.target.error.code);
    };
    fileReader.readAsText(file)
}

async function extract_marks(body) {
    const parser = new DOMParser();
    const doc = $(parser.parseFromString(body, "text/xml"));
    const marks = [];

    if (doc.find('kml').length) {
        for (let item of doc.find('Placemark')) {
            item = $(item);
            let coordinates = [];

            for (const marker of item.find('Point')) {
                const coords = $(marker).find('coordinates').html().split(",");
                coordinates.push({lat: +coords[1], lng: +coords[0]});
            }
            marks.push({
                name: item.find('name').html(),
                description: item.find('description').html(),
                coordinates: coordinates[0]
            });
        }
    } else {
        throw "Error while parsing";
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
            alert('File or url not specified!');
        }
    });
});
