let API_KEY = "YOUR_API_KEY";


// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
    //Get hours from milliseconds
    const date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    const hours = '0' + date.getHours();
    // Minutes part from the timestamp
    const minutes = '0' + date.getMinutes();
    // Seconds part from the timestamp (gebruiken we nu niet)
    // const seconds = '0' + date.getSeconds();

    // Will display time in 10:30(:23) format
    return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}


const updateSun = (sunrise, sunset) => {

    showRestingDaylight(sunset, sunrise);

    const currentTime = new Date().getTime() / 1000;
    let currentSunTime = currentTime - sunrise;
    if (currentSunTime < 0) {
        currentSunTime = 0;
    }
    const totalSecondsSun = sunset - sunrise;
    const ratio = currentSunTime / totalSecondsSun;

    // calculate left and top position to place sun in a half circle
    const left = -5 + 95 * ratio;
    const bottom = 50 * Math.sin(ratio * Math.PI);

    // set sun position
    document.querySelector('.js-sun').style.left = `${left}%`;
    document.querySelector('.js-sun').style.bottom = `${bottom}%`;

    document.querySelector('.js-sun').setAttribute('data-time', _parseMillisecondsIntoReadableTime(currentTime));

    setTimeout(() => {
        updateSun(sunrise, sunset);
    }, 1000);
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (sunset, sunrise) => {
    const currentTime = new Date().getTime();
    const currentTimeText = _parseMillisecondsIntoReadableTime(currentTime / 1000);


    const sunElement = document.createElement('span');
    sunElement.classList.add('c-horizon__sun', 'js-sun');
    sunElement.innerHTML = `<svg class="c-sun" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17,11c0,3.3-2.7,6-6,6s-6-2.7-6-6s2.7-6,6-6S17,7.7,17,11z M11.5,0h-1v3h1V0z M3.6,2.9L2.9,3.6L5,5.7L5.7,5L3.6,2.9zM0,10.5l0,1h3v-1H0z M2.9,18.4l0.7,0.7L5.7,17L5,16.3L2.9,18.4z M10.5,22h1v-3h-1V22z M18.4,19.1l0.7-0.7L17,16.3L16.3,17L18.4,19.1z M22,11.5v-1h-3v1H22z M19.1,3.6l-0.7-0.7L16.3,5L17,5.7L19.1,3.6z"/>
                            </svg>`;

    sunElement.setAttribute('data-time', currentTimeText);

    document.querySelector('.js-horizon').innerHTML = '';
    document.querySelector('.js-horizon').appendChild(sunElement);

    updateSun(sunrise, sunset);
};

const _secondsToTimeString = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    minutes %= 60;
    // set remaining sunlit time
    if (hours > 0) {
        return `${hours} hours and ${minutes} minutes`;
    } else {
        return `${minutes} minutes`;
    }
}

let showRestingDaylight = (sunset, sunrise) => {

    let currentSeconds = new Date().getTime() / 1000;

    if (currentSeconds < sunrise || currentSeconds > sunset) {
        let secondsToSunrise = sunrise - currentSeconds;

        if (currentSeconds > sunset) {
            secondsToSunrise = (86400 - currentSeconds) + sunrise; // 86400 = seconds in a day
        }
        document.querySelector('.js-time-left').textContent = _secondsToTimeString(secondsToSunrise);

        document.querySelector('.js-sunlight-text').textContent = 'until the sun rises';
    } else {
        const secondsToSunset = sunset - currentSeconds;
        document.querySelector('.js-time-left').textContent = _secondsToTimeString(secondsToSunset);
        document.querySelector('.js-sunlight-text').textContent = 'of sunlight left today. Make the most of it!';
    }
}

const showLocation = (city, country) => {
    document.querySelector('.js-location').textContent = `${city}, ${country}`;
}

const showHorizonSun = (sunrise, sunset) => {
    placeSunAndStartMoving(sunset, sunrise);
}

const showSunriseSunset = (sunrise, sunset) => {
    const sunriseTime = _parseMillisecondsIntoReadableTime(sunrise);
    const sunsetTime = _parseMillisecondsIntoReadableTime(sunset);

    document.querySelector('.js-sunrise').textContent = sunriseTime;
    document.querySelector('.js-sunset').textContent = sunsetTime;
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
    console.log(queryResponse);

    // set correct sunrise and sunset time
    const sunrise = queryResponse.city.sunrise;
    const sunset = queryResponse.city.sunset;

    const city = queryResponse.city.name;
    const country = queryResponse.city.country;

    // We gaan eerst een paar onderdelen opvullen
    // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
    showLocation(city, country);
    // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
    showSunriseSunset(sunrise, sunset);
    showRestingDaylight(sunset, sunrise);
    // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
    // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.

    showHorizonSun(sunrise, sunset);

};

const getEndpoint = (lat, lon) => {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=nl&cnt=1`;
}

const getData = (endpoint) => {
    return fetch(endpoint)
        .then((r) => r.json())
        .catch((e) => console.error(e))
}


// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
    const data = await getData(getEndpoint(lat, lon))
    showResult(data);
    return data;
    // Eerst bouwen we onze url op
    // Met de fetch API proberen we de data op te halen.
    // Als dat gelukt is, gaan we naar onze showResult functie.
};

document.addEventListener('DOMContentLoaded', function () {
    // 1 We will query the API with longitude and latitude.
    // load API key from /key.txt
    fetch('key.txt').then(response => response.text()).then(key => {
        API_KEY = key;
    }).then(() => {
        getAPI(50.8027841, 3.2097454)
    });
});
