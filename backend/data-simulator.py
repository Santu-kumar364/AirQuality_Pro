import requests
import json
import time
import random
from datetime import datetime

API_URL = "https://nenql5mpli.execute-api.ap-south-1.amazonaws.com/prod/data"

def generate_sensor_data():
    """Generate realistic air quality sensor data"""
    return {
        "pm25": round(random.uniform(10, 150), 2),  # PM2.5 particles
        "pm10": round(random.uniform(20, 200), 2),  # PM10 particles
        "temperature": round(random.uniform(20, 35), 2),  # Temperature in Celsius
        "humidity": round(random.uniform(30, 80), 2),  # Humidity percentage
        "location": "IIT-Patna-Lab-1"
    }

def send_data_to_api():
    """Send sensor data to AWS API Gateway"""
    sensor_data = generate_sensor_data()
    
    try:
        response = requests.post(
            API_URL,
            headers={"Content-Type": "application/json"},
            data=json.dumps(sensor_data)
        )
        
        if response.status_code == 200:
            print(f"Data sent successfully: {sensor_data}")
            result = response.json()
            print(f"   AQI: {result['data']['aqi']}, Status: {result['data']['status']}")
        else:
            print(f"Failed to send data: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

def continuous_simulation(interval_seconds=30):
    """Continuously send data at specified intervals"""
    print("Starting air quality data simulation...")
    print("Location: IIT-Patna-Lab-1")
    print("Interval: 30 seconds")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            send_data_to_api()
            print(f"Waiting {interval_seconds} seconds...\n")
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print("\nSimulation stopped")

if __name__ == "__main__":
    # Test single data send
    print("🧪 Testing single data transmission...")
    send_data_to_api()
    
    # Start continuous simulation
    continuous_simulation(interval_seconds=30)