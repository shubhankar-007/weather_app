const apiKey = "684cc72e14437f714c7d85edcb72e227"; // Replace with your OpenWeatherMap API key
const unsplashAccessKey = "zpYzcX1Pj3l9su6kuzB_e5lf3MeJU33T3DfmbIwe3aA"; // Unsplash API Key
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const errorMessage = document.getElementById("errorMessage");
const temperatureElement = document.getElementById("temperature");
const unitElement = document.getElementById("unit");
const toggleTempBtn = document.getElementById("toggleTemp");

let isCelsius = true;
let temperatureCelsius = 0;

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return;
    fetchWeather(`q=${city}`);
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(`lat=${lat}&lon=${lon}`);
            },
            (error) => {
                errorMessage.innerText = "Geolocation permission denied.";
                errorMessage.classList.remove("hidden");
            }
        );
    } else {
        errorMessage.innerText = "Geolocation is not supported by your browser.";
        errorMessage.classList.remove("hidden");
    }
});

async function fetchWeather(query) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("City not found");

        const data = await response.json();

        document.getElementById("cityName").innerText = data.name;
        document.getElementById("description").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("windSpeed").innerText = data.wind.speed;

        temperatureCelsius = data.main.temp;
        isCelsius = true;
        updateTemperature();

        const iconCode = data.weather[0].icon;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        const weatherCondition = data.weather[0].main;
        fetchBackgroundImage(weatherCondition); // Fetch live background

        weatherInfo.classList.remove("hidden");
        weatherInfo.classList.add("visible");
        errorMessage.classList.add("hidden");
    } catch (error) {
        weatherInfo.classList.add("hidden");
        errorMessage.classList.remove("hidden");
        errorMessage.innerText = error.message;
    }
}

toggleTempBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;
    updateTemperature();
});

function updateTemperature() {
    if (isCelsius) {
        temperatureElement.innerText = temperatureCelsius.toFixed(1);
        unitElement.innerText = "C";
        toggleTempBtn.innerText = "Convert to °F";
    } else {
        const tempFahrenheit = (temperatureCelsius * 9/5) + 32;
        temperatureElement.innerText = tempFahrenheit.toFixed(1);
        unitElement.innerText = "F";
        toggleTempBtn.innerText = "Convert to °C";
    }
}

// ✅ Fetch Live Background Image from Unsplash
async function fetchBackgroundImage(weatherCondition) {
    const queryKeywords = {
        Clear: "sunny sky",
        Clouds: "cloudy sky",
        Rain: "rainy day",
        Snow: "snowy landscape",
        Thunderstorm: "thunderstorm",
        Drizzle: "light rain",
        Mist: "foggy weather",
        Haze: "hazy weather",
        Smoke: "smoky sky"
    };

    const searchQuery = queryKeywords[weatherCondition] || "weather";
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=${searchQuery}&client_id=${unsplashAccessKey}`;

    try {
        const response = await fetch(unsplashUrl);
        const data = await response.json();

        if (data.urls && data.urls.full) {
            document.body.style.backgroundImage = `url('${data.urls.full}')`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
        }
    } catch (error) {
        console.error("Error fetching Unsplash image:", error);
    }
}
