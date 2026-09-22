import requests

def get_current_rainfall_pune() -> float:
    """
    Fetches live rainfall data (in mm) for Pune from Open-Meteo.
    Open-Meteo is a free API requiring no authentication.
    """
    url = "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=precipitation"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        return float(data.get("current", {}).get("precipitation", 0.0))
    except Exception as e:
        print(f"Error fetching live weather: {e}")
        return -1.0

def get_forecast_rainfall_pune() -> list:
    """
    Fetches the next 4 hours (now, +1, +2, +3) of rainfall data.
    """
    url = "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&hourly=precipitation&forecast_hours=4"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        precs = data.get("hourly", {}).get("precipitation", [0.0, 0.0, 0.0, 0.0])
        # Ensure we have 4 values
        while len(precs) < 4:
            precs.append(0.0)
        return precs[:4]
    except Exception as e:
        print(f"Error fetching live forecast: {e}")
        return [0.0, 0.0, 0.0, 0.0]
