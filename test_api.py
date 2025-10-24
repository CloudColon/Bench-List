#!/usr/bin/env python
"""
Quick test script to verify the new resource listing API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    print("Testing Resource Listing API Endpoints\n")
    print("=" * 50)

    # Test 1: Check if resource-listings endpoint exists
    print("\n1. Testing GET /api/resource-listings/")
    try:
        response = requests.get(f"{BASE_URL}/api/resource-listings/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 401:
            print("   ✓ Endpoint exists (requires authentication)")
        elif response.status_code == 200:
            print("   ✓ Endpoint accessible")
            data = response.json()
            print(f"   Results: {len(data.get('results', []))} listings")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    # Test 2: Check if resource-requests endpoint exists
    print("\n2. Testing GET /api/resource-requests/")
    try:
        response = requests.get(f"{BASE_URL}/api/resource-requests/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 401:
            print("   ✓ Endpoint exists (requires authentication)")
        elif response.status_code == 200:
            print("   ✓ Endpoint accessible")
            data = response.json()
            print(f"   Results: {len(data.get('results', []))} requests")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    # Test 3: Check Swagger documentation
    print("\n3. Checking Swagger Documentation")
    try:
        response = requests.get(f"{BASE_URL}/swagger/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Swagger documentation is accessible")
        else:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ✗ Error: {e}")

    print("\n" + "=" * 50)
    print("Testing complete!\n")

if __name__ == "__main__":
    test_endpoints()
