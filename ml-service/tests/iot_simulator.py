import time
import random
import requests
import json
from datetime import datetime

# The API endpoint on the Spring Boot backend
API_URL = "http://localhost:8080/api/iot/push"

def generate_sensor_data():
    """Generates realistic-looking mock data for farm sensors."""
    # Base values
    base_temp = 28.0
    base_moisture = 45.0
    
    # Add some random fluctuation
    temp = base_temp + random.uniform(-2.0, 2.0)
    moisture = base_moisture + random.uniform(-5.0, 5.0)
    
    payload = {
        "timestamp": datetime.now().isoformat(),
        "sensors": [
            {
                "id": "sensor_temp_01",
                "type": "temperature",
                "value": round(temp, 1),
                "unit": "°C",
                "status": "active"
            },
            {
                "id": "sensor_moist_01",
                "type": "soil_moisture",
                "value": round(moisture, 1),
                "unit": "%",
                "status": "active" if moisture > 30 else "warning"
            }
        ]
    }
    return payload

def start_simulation():
    print(f"Starting IoT Sensor Simulator. Pushing to {API_URL}")
    while True:
        data = generate_sensor_data()
        try:
            response = requests.post(
                API_URL, 
                json=data, 
                headers={'Content-Type': 'application/json'}
            )
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Pushed data: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Failed to connect to backend: {e}")
            
        time.sleep(5) # Push every 5 seconds

if __name__ == "__main__":
    start_simulation()
