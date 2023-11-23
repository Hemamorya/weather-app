// Selecting DOM elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// Initially selected tab
let oldTab = userTab;

// API Key for OpenWeatherMap API
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

// Adding 'current-tab' class to the initially selected tab
oldTab.classList.add("current-tab");

// Checking if coordinates are available in session storage
getfromSessionStorage();

// Function to switch between user weather tab and search weather tab
function switchTab(newTab) {
    if (newTab != oldTab) {
        // Removing 'current-tab' class from the old tab
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        // Adding 'current-tab' class to the new tab
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // If search form is invisible, make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // If search form is visible, display weather information
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
}

// Event listeners for tab clicks
userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// Function to check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // If local coordinates are not available, show grant access container
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        // Fetch weather information using coordinates
        fetchUserWeatherInfo(coordinates);
    }
}

// Function to fetch user weather information using coordinates
async function fetchUserWeatherInfo(coordinates) {
    // Extracting latitude and longitude from coordinates
    const { lat, lon } = coordinates;
    // Making grant access container invisible
    grantAccessContainer.classList.remove("active");
    // Making loader visible
    loadingScreen.classList.add("active");

    // API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        // Making loader invisible and user info container visible
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // Rendering weather information
        renderWeatherInfo(data);
    } catch (err) {
        // Handling API call errors (To Do: Add specific error handling)
        loadingScreen.classList.remove("active");
        // Handle error (To Do: Implement error handling)
    }
}

// Function to render weather information on the UI
function renderWeatherInfo(weatherInfo) {
    // Fetching UI elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Logging weather information for debugging purposes
    console.log(weatherInfo);

    // Updating UI elements with weather information
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// Function to get user's geolocation
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        // Handle the case when geolocation is not supported
        alert("Geolocation is not supported by your browser or device.");
    }
}

// Callback function when geolocation is retrieved successfully
function showPosition(position) {
    // Extracting user coordinates
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    // Saving user coordinates in session storage
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    // Fetch weather information using user coordinates
    fetchUserWeatherInfo(userCoordinates);
}

// Event listener for grant access button click
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

// DOM elements for search functionality
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "") {
        return;
    } else {
        // Fetch weather information using city name
        fetchSearchWeatherInfo(cityName);
    }
});

// Function to fetch weather information using city name
async function fetchSearchWeatherInfo(city) {
    try {
        // Making loader visible and hiding other containers
        loadingScreen.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");

        // API call to fetch weather information using city name
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            // If the response status is not in the range 200-299, it's an error
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Making loader invisible and user info container visible
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // Rendering weather information
        renderWeatherInfo(data);
    } catch (err) {
        // Handle API call errors
        console.error("API Error:", err);

        // You can add specific error handling here, such as displaying an error message
        // or updating the UI to inform the user about the error.
    }
}