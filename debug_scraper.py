"""Debug script to inspect FBRef table structure"""

import requests
from bs4 import BeautifulSoup
import time

url = "https://fbref.com/en/comps/9/Premier-League-Stats"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

time.sleep(3)
response = requests.get(url, headers=headers, timeout=10)
soup = BeautifulSoup(response.content, 'html.parser')

# List all tables
print("=== ALL TABLES ON PAGE ===")
for i, table in enumerate(soup.find_all('table')):
    table_id = table.get('id', 'NO ID')
    caption = table.find('caption')
    caption_text = caption.get_text(strip=True) if caption else "NO CAPTION"
    print(f"{i}: id='{table_id}' caption='{caption_text}'")

# Check for league table with standings
print("\n=== LOOKING FOR STANDINGS TABLE ===")
for table in soup.find_all('table'):
    table_id = table.get('id', '')
    if 'results' in table_id.lower() or 'overall' in table_id.lower():
        print(f"\nFound: {table_id}")
        header_row = table.find('thead').find_all('tr')[-1]
        for i, th in enumerate(header_row.find_all(['th', 'td'])):
            stat_name = th.get('data-stat')
            text = th.get_text(strip=True)
            print(f"  {i}: data-stat='{stat_name}' text='{text}'")
