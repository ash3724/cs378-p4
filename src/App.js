import './App.css';
import MenuItem from './components/MenuItem';
import React, { useState, useEffect } from 'react';

const WeatherDashboard = () => {
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [fetchStatus, setFetchStatus] = useState({ loading: false, locationLoading: true, error: null });

  const retrieveWeather = async (latitude, longitude) => {
    if (!latitude || !longitude || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setFetchStatus(prevState => ({ ...prevState, error: "Invalid latitude or longitude." }));
      return;
    }

    setFetchStatus(prevState => ({ ...prevState, loading: true }));
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      setWeatherInfo(result);
      setFetchStatus({ loading: false, locationLoading: false, error: null });
    } catch (error) {
      console.error("Fetching error: ", error);
      setFetchStatus({ loading: false, locationLoading: false, error: "Weather data retrieval failed." });
    }
  };

  const onFetchClick = () => retrieveWeather(lat, lng);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude);
        setLng(coords.longitude);
        retrieveWeather(coords.latitude, coords.longitude);
        setFetchStatus(prevState => ({ ...prevState, locationLoading: false }));
      },
      () => {
        setFetchStatus({ loading: false, locationLoading: false, error: "Enable geolocation or enter coordinates." });
      }
    );
  }, []);

  const isLoading = fetchStatus.loading || fetchStatus.locationLoading;
  const { error } = fetchStatus;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Current Weather</h1>
      <input type="number" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitude" />
      <input type="number" value={lng} onChange={e => setLng(e.target.value)} placeholder="Longitude" />
      <button onClick={onFetchClick}>Get Weather</button>
      <div>
        <button onClick={() => retrieveWeather(30.2672, -97.7431)}>Austin</button>
        <button onClick={() => retrieveWeather(30.5083, -97.6789)}>Round Rock</button>
        <button onClick={() => retrieveWeather(30.5052, -97.8203)}>Cedar Park</button>
      </div>
      {weatherInfo && (
        <div>
          {weatherInfo.hourly.time.map((time, idx) => (
            <div key={idx}>
              <p>{new Date(time).toLocaleTimeString()}: {weatherInfo.hourly.temperature_2m[idx]} °F</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
