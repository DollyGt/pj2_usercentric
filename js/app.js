var map; // the google map object
var selectedCity; // for the current city searched for
var markers = []; // to store the makers drawn on the map (so they can be cleared)

/*
 initApp gets called when the map is loaded
 The callback is located in the index.html file where the google library is included
    (...callback=initApp...)
 */
function initApp() {

    // ensuring nothing happens until the document is ready
    $(document).ready(function() {
        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(43, 0)
        };

        map = new google.maps.Map($('#mapcanvas')[0], mapOptions);

        // this will hide the search results if user clicks the x
        $('.close-result-list').on('click', function() {
            console.log('clicked');
            $('.result-list').slideUp();
        });

        // this is using Google library to do the search auto-complete for cities only
        var cityAutocomplete = $('.city-search-input')[0];
        var autoComplete = new google.maps.places.Autocomplete(cityAutocomplete);
        autoComplete.setTypes(['(cities)']);

        // Adaptation from Google's Documentation:
        // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete
        // this will trigger when the city is selected by the user
        autoComplete.addListener('place_changed', function() {
            resetMap(); // removes all the markers etc.
            selectedCity = autoComplete.getPlace();
            if (!selectedCity.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                console.log("No city found");
                return;
            }

            $('.city-name').text($('.city-search-input').val());
            $('.result-list').slideDown();

            // center the map, and zoom accordingly
            map.setCenter(selectedCity.geometry.location);
            map.setZoom(15);
            // Moves the map over a little bit, so it is more centered on the right panel
            map.panBy(-250, 0);
        });

        // Adaptation from Google's Documentation:
        // https://developers.google.com/maps/documentation/javascript/places#TextSearchRequests
        $('.attraction-btn').on('click', function() {
            // the data-attraction attribute is in the HTML as ('accomodation', 'tourist...' etc.)
            var attraction = $(this).attr('data-attraction');
            var request = {
                location: selectedCity.geometry.location,
                radius: '1000',
                query: attraction
            };
            service = new google.maps.places.PlacesService(map);
            // placesQueryCallback callback gets called after results are back from the query
            service.textSearch(request, placesQueryCallback);

            // center the map, and zoom accordingly
            map.setCenter(selectedCity.geometry.location);
            map.setZoom(15);
            map.panBy(-250, 0);

            // set the search title to the clicked button text, in the location
            $('.search-type-title').text($(this).text() + ' in ' + selectedCity.name);
        });

    }); //end document ready

    // gets called when the search query is returned
    // https://developers.google.com/maps/documentation/javascript/places#TextSearchRequests
    function placesQueryCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            resetMap(); // clear all markers

            // Set up variables so they are reused in the loop (better performance)
            var place;
            var imageUrl;
            var marker;
            // using the $ to show they are elements created via jQuery
            var $placeResult;
            var $placeImage;
            var $placeName;
            var $placeRating;
            var $placeAddress;
            var $safety;

            // loop through all the places
            for (var i = 0; i < results.length; i++) {
                place = results[i];

                // if the place has an image, use it
                if (place.photos && place.photos[0]) {
                    imageUrl = place.photos[0].getUrl({ maxHeight: 100, maxWidth: 100 });
                }
                else {
                    imageUrl = "";
                }

                // create a new marker for each place
                marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location
                });
                markers.push(marker); // add to the array for ease of clearing
                marker.setVisible(true);

                // create all the HTML structure of the place result
                $placeResult = $('<div class="place-result" />');
                // set the data-lat, data-lng for future reference (when user clicks result)
                $placeResult.attr('data-lat', place.geometry.location.lat);
                $placeResult.attr('data-lng', place.geometry.location.lng);
                $placeImage = $('<div class="place-img-holder" />').html('<img class="place-img" src="' + imageUrl + '"/>');
                $placeName = $('<div class="place-name" />').text(place.name);
                $placeRating = $('<span class="place-rating" />').text("(" + place.rating + ")");
                $placeAddress = $('<div class="place-address" />').text(place.formatted_address);
                // safety is used to clear floats
                $safety = $('<div class="safety" />');

                // append it all together
                $placeImage.appendTo($placeResult);
                $placeRating.appendTo($placeName);
                $placeName.appendTo($placeResult);
                $placeAddress.appendTo($placeResult);
                $safety.appendTo($placeResult);
                // finally add each place to the search results list
                $placeResult.appendTo('.search-results');
            } // end for loop

            // because place result is a dynamic element, we reset the click listener using off
            // this prevents it being fired multiple times if many queries are made
            $('.place-result').off('click').on('click', function() {
                // get the lat / long of the place
                var lat = parseFloat($(this).attr('data-lat'));
                var lng = parseFloat($(this).attr('data-lng'));
                map.setCenter({ lat: lat, lng: lng });
                map.setZoom(19);
                map.panBy(-250, 0);
            });

        }
    } // end placesQueryCallback


    function resetMap() {
        // clear all markers
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
        // clear the search results
        $('.search-results').empty();
    }

}
// end initApp
