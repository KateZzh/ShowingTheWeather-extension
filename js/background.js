const apiKey = '';
const city = 'Minsk';

async function fetchWeatherData() {
    try {
        if (!apiKey) throw new Error(`apiKey not found`);

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

        if (!response.ok) {
            throw new Error(`Error, status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather data:', data);

        await chrome.storage.local.set({ weatherData: data });
    } catch (error) {
        console.error('Error fetching weather data', error);
        await chrome.storage.local.remove(['weatherData']);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getWeatherData') {
        fetchWeatherData().then(() => {
            chrome.storage.local.get('weatherData', (result) => {
                sendResponse({ weatherData: result.weatherData });
            });
        });
        return true;
    }
});
