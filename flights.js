const express = require('express');
const app = express();
const port = 3001;
const Amadeus = require('amadeus');
var moment = require('moment');
moment().format();

//Alex API keys
var amadeus = new Amadeus({
    clientId: 'SdBL4kX4XGDuOrApW2aVatWhc8pePJrY',
    clientSecret: 'Ky5lGxL76Mmjy9Rp'
});

let flightsWithLayover = [];
let flightsWithLongLayover = [];

app.get('/flights', (req, res) => {

    // Flight Offers Search
    amadeus.shopping.flightOffersSearch.get({
        originLocationCode: 'SAN',
        destinationLocationCode: 'HND',
        departureDate: '2020-08-01',
        adults: '1',
        currencyCode: 'USD',
        max: 250,
        nonStop: false
    }).then(function (response) {


        for (let index = 0; index < response.data.length; index++) {
            const element = response.data[index];

            if (element.itineraries[0].segments.length === 2) {
                flightsWithLayover.push(element.id - 1);

                let arrivalTime = element.itineraries[0].segments[0].arrival.at;
                arrivalTime = arrivalTime.split("T").join(" ");
                arrivalTime = arrivalTime.split("-").join("/");

                let departureTime = element.itineraries[0].segments[1].departure.at;
                departureTime = departureTime.split("T").join(" ");
                departureTime = departureTime.split("-").join("/");

                // console.log(arrivalTime);
                // console.log(departureTime);

                var ms = moment(departureTime, "YYYY/MM/DD HH:mm:ss").diff(moment(arrivalTime, "YYYY/MM/DD HH:mm:ss"));
                var d = moment.duration(ms);

                // console.log(d.days(), d.hours(), d.minutes(), d.seconds());

                if (d.hours() > 10) {
                    flightsWithLongLayover.push({
                        "id": element.id,
                        "duration": element.itineraries[0].duration,
                        "origin": element.itineraries[0].segments[0].departure.iataCode,
                        "originDepartureTime": element.itineraries[0].segments[0].departure.at,
                        "layover": element.itineraries[0].segments[0].arrival.iataCode,
                        "layoverTime": d.hours(),
                        "destination": element.itineraries[0].segments[1].arrival.iataCode,
                        "destinationArrivalTime": element.itineraries[0].segments[1].arrival.at,
                        "grandTotal": element.price.grandTotal
                    });
                }
            }
        }

        res.send(JSON.stringify(flightsWithLongLayover));

    }).catch(function (responseError) {
        console.log(responseError.code);
    });
})

app.listen(port, () => console.log(`DELIGHT app listening on port ${port}!`));
