import requests
from bs4 import BeautifulSoup
import csv
import wget
import os
from os import path
import ssl
import datetime


now = datetime.datetime.now()
folder_id = now.strftime('%Y%m%d' + '-' + '%H%M%S')
#Destination_Folder = input('Input your folder directory(include /): ')
Destination_Folder = '/Users/waleowoeye/Documents/Working/imageScraper/'

dest_folder = Destination_Folder + folder_id + '/'
product_search = Destination_Folder + 'product_search.csv'
products_catalog = Destination_Folder + 'products_catalog.csv'

os.makedirs(dest_folder, exist_ok=True)

image_store = 'gs://prod-search-tool/'

if (not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context

url = input('What page will you scrape from: ')
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')


page = soup.body
pageTags = soup.find_all("div", {"class": "product"})
os.makedirs(dest_folder, exist_ok=True)


def dld(dest_folder, src):
    try:
        wget.download(src, out=dest_folder)
    except Exception:
        print(Exception)
        #continue


def product_search_header():
    with open(Destination_Folder + 'product_search.csv', 'w') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow(['image_uri', 'image_id', 'product_set_id', 'product_id', 'product_category', \
                            'product_display_name', 'labels', 'bounding_poly'])

def products_catalog_header():
    with open(Destination_Folder + 'products_catalog.csv', 'w') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow(['imageUrl', 'image_id', 'product_set_id', 'productId', 'product_category', \
                            'name', 'labels', 'bounding_poly', 'src', 'productPage', 'availability'])


for page in pageTags:
    container_a = page.find('a')
    container_img = container_a.find('img')

    container_href = container_a.get('href')
    product_id = container_img.get('data-pid')
    image_uri = image_store + product_id + '.jpg'
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
    dld(dest_folder, src)

    if (path.exists(product_search) == False):
        print('no existing product_search file')
        product_search_header()

    with open(Destination_Folder + 'product_search.csv', 'a') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                            product_display_name, labels, bounding_poly])


    if (path.exists(products_catalog) == False):
        print('no existing products_catalog file')
        products_catalog_header()

    with open(Destination_Folder + 'products_catalog.csv', 'a') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                            product_display_name, labels, bounding_poly, src, product_page, \
                            product_availability])

