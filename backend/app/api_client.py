import time
import requests
from app.settings import settings

BASE_URL = "https://api.brightdata.com"


def trigger_review_scraping(payload):
    url = f"{BASE_URL}/datasets/v3/trigger?dataset_id=gd_le8e811kzy4ggddlq&include_errors=true"
    headers = {
        "Authorization": f"Bearer {settings.API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json().get("snapshot_id")
    raise Exception(f"Failed to trigger scraping: {response.text}")


def trigger_product_search(payload):
    url = f"{BASE_URL}/datasets/v3/trigger?dataset_id=gd_l7q7dkf244hwjntr0&include_errors=true&type=discover_new&discover_by=keyword"
    headers = {
        "Authorization": f"Bearer {settings.API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        return response.json().get("snapshot_id")
    raise Exception(f"Failed to trigger product search: {response.text}")


def fetch_snapshot_data(snapshot_id):
    url = f"{BASE_URL}/datasets/v3/snapshot/{snapshot_id}?format=json"
    headers = {"Authorization": f"Bearer {settings.API_TOKEN}"}
    
    while True:
        response = requests.get(url, headers=headers)

        snapshot_data = response.json()

        if isinstance(snapshot_data, list):
            print(f"Snapshot {snapshot_id} is ready!")
            return snapshot_data

        status = snapshot_data.get("status")
        print(f"Snapshot {snapshot_id} status: {status}")         
        
        time.sleep(10) 
