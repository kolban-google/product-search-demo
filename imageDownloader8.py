import requests
from bs4 import BeautifulSoup
import urllib3
import csv
import json
import wget
import os
import ssl
import re
import datetime


now = datetime.datetime.now()
folder_id = now.strftime('%Y%m%d' + '-' + '%H%M%S')
Destination_Folder = input('Input your folder directory: ')
dest_folder = Destination_Folder + folder_id + '/'

os.makedirs(dest_folder, exist_ok=True)

image_store = 'gs://prod-search-tool/' + folder_id

if (not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context

url = input('What page will you scrape from: ')
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')


page = soup.body
pageTags = soup.find_all("div", {"class": "product"})
os.makedirs(dest_folder, exist_ok=True)

#print(pageTags)


with open(dest_folder + 'product_search.csv', 'w') as csvfile:
    tagwriter = csv.writer(csvfile, delimiter=',')
    tagwriter.writerow(['image_uri', 'image_id', 'product_set_id', 'product_id', 'product_category', \
                        'product_display_name', 'labels', 'bounding_poly'])

with open(dest_folder + 'metadata_full.csv', 'w') as csvfile:
    tagwriter = csv.writer(csvfile, delimiter=',')
    tagwriter.writerow(['image_uri', 'image_id', 'product_set_id', 'product_id', 'product_category', \
                        'product_display_name', 'labels', 'bounding_poly', 'src', 'product_page', 'product_availability'])

for page in pageTags:
    container_a = page.find('a')
    container_img = container_a.find('img')

    container_href = container_a.get('href')
    product_id = container_img.get('data-pid')
    image_uri = image_store + '/' + product_id + '.jpg'
    image_id = ''
    product_set_id = 'athome'  # merchant_id
    product_id = container_img.get('data-pid')
    product_category = 'general-v1'  # category
    product_display_name = container_img.get('title')
    labels = ''
    bounding_poly = ''
    src = container_img.get('src')
    product_page = 'https://athome.com' + container_href
    product_availability = container_img.get('data-stock')

    try:
        wget.download(src, out=dest_folder)
        with open(dest_folder + 'product_search.csv', 'a') as csvfile:
            tagwriter = csv.writer(csvfile, delimiter=',')
            tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                                product_display_name, labels, bounding_poly])

        with open(dest_folder + 'products_catalog.csv', 'a') as csvfile:
            tagwriter = csv.writer(csvfile, delimiter=',')
            tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                                product_display_name, labels, bounding_poly, src, product_page, \
                                product_availability])

    except Exception:
        print(Exception)
        continue
