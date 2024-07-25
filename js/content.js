function requestWeatherData() {
    chrome.runtime.sendMessage({ action: 'getWeatherData' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error requesting weather data:', chrome.runtime.lastError);
            localStorage.removeItem('weatherData');
            return;
        }
        if (response && response.weatherData) {
            localStorage.setItem('weatherData', JSON.stringify(response.weatherData));
        } else {
            localStorage.removeItem('weatherData');
        }
    });
}

function addWeatherIcons() {
    const storyItems = document.querySelectorAll('.post-type-simple.volume-full');

    storyItems.forEach((item) => {
        const root = document.createElement('div');
        root.style.position = 'relative';
        const shadowRoot = root.attachShadow({ mode: 'open' });

        shadowRoot.innerHTML = `
            <link rel='stylesheet' href="${chrome.runtime.getURL('../css/styles.css')}">
            <img src="${chrome.runtime.getURL('icons/icon-32.png')}" class="weather-icon">
            <div class="weather-info"></div>
        `;

        item.prepend(root);

        const icon = shadowRoot.querySelector('.weather-icon');
        const weatherInfo = shadowRoot.querySelector('.weather-info');

        icon.addEventListener('mouseover', () => showWeatherInfo(weatherInfo));
        icon.addEventListener('mouseout', () => (weatherInfo.style.display = 'none'));
    });
}

function showWeatherInfo(weatherInfo) {
    weatherInfo.style.display = 'block';
    weatherInfo.innerHTML = 'Загрузка информации о погоде...';

    const weatherData = checkWeatherData();

    if (weatherData) {
        const temp = Math.round(weatherData.main.temp);

        weatherInfo.innerHTML = `Погода в Минске на сегодня ${temp}°C`;
    } else {
        weatherInfo.innerHTML = 'Не удалось получить информацию о погоде, проверьте apiKey';
        requestWeatherData();
    }
}

function checkWeatherData() {
    const weatherDataLocal = localStorage.getItem('weatherData');

    if (!weatherDataLocal) {
        console.log('No weather data available');
        return null;
    }

    const weatherData = JSON.parse(weatherDataLocal);

    if (!Object.keys(weatherData).length) {
        console.log('Weather data is empty');
        return null;
    }

    return weatherData;
}

function initialize() {
    addWeatherIcons();
    requestWeatherData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

window.addEventListener('focus', requestWeatherData);
