import requests
from bs4 import BeautifulSoup
import csv
import wget
import os
from os import path
import ssl
import datetime

from gcloud import storage
from google.cloud import storage


client_secret = input('Put in Path/to/client_secrets.json: ')
Destination_Folder = input('Path/to/Working/folder/: ')

storage_client = storage.Client.from_service_account_json(client_secret)
bucketName = input('GCS bucket name: ')
bucket = storage_client.get_bucket(bucketName)

# To be able to track and differentiate between the different times of running
# the script, the timestamp is used to create a folder.
now = datetime.datetime.now()
folder_id = now.strftime('%Y%m%d' + '-' + '%H%M%S')

dest_folder = Destination_Folder + folder_id + '/'

# product_search.csv and products_catalog.csv are automatically created
# product_search.csv is the file that is used with the Product Search API
# products_catalog.csv contains all the information scraped on the image
product_search = Destination_Folder + 'product_search.csv'
products_catalog = Destination_Folder + 'products_catalog.csv'

os.makedirs(dest_folder, exist_ok=True)

image_store = 'gs://prod-search-tool/'

if (not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context

# To collect which page to scrape from
url = input('What page will you scrape from: ')
html = requests.get(url)
soup = BeautifulSoup(html.text, 'html.parser')


page = soup.body
pageTags = soup.find_all("div", {"class": "product"})
os.makedirs(dest_folder, exist_ok=True)


# This allows to download to the local computer
def dld(dest_folder, src):
    try:
        wget.download(src, out=dest_folder)
    except Exception:
        print(Exception)
        #continue

# This creates the header of the product_search.csv
def product_search_header():
    with open(Destination_Folder + 'product_search.csv', 'w') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow(['image_uri', 'image_id', 'product_set_id', 'product_id', 'product_category', \
                            'product_display_name', 'labels', 'bounding_poly'])

# This creates the header of the products_catalog.csv
def products_catalog_header():
    with open(Destination_Folder + 'products_catalog.csv', 'w') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow(['imageUrl', 'image_id', 'product_set_id', 'productId', 'product_category', \
                            'name', 'labels', 'bounding_poly', 'src', 'productPage', 'availability', 'gcsLink'])

# This downloads the images to the Google Bucket
def gdld(product_id, src, bucket, bucketName):
    #bucket = storage_client.get_bucket(bucket)
    try:
        bucket.blob(product_id).upload_from_string(src)
        print('gs://' + bucket.blob(product_id).path_helper(bucketName, filename))
        return 'gs://' + bucket.blob(product_id).path_helper(bucketName, filename)
    except:
        print('Didn\'t upload')

# This uploads a file to the Google Bucket from the local computer.
# In this case, it will be for the product_search.csv and products_catalog.csv files
def gdld_up(filename, bucket):
    #bucket = storage_client.get_bucket(bucket)
    print('Uploading ' + filename)
    try:
        bucket.blob(filename).upload_from_filename(Destination_Folder + filename)
        print(bucket.blob(filename).path(bucket, filename))
        return bucket.blob(filename).path(bucket, filename)
    except:
        print(filename + ' doesn\'t exist on local computer')

# This downloads a file from the Google Bucket to the local computer.
# In this case, it will be for the product_search.csv and products_catalog.csv files
def gdld_dn(filename, bucket):
    #bucket = storage_client.get_bucket(bucket)
    print('Downloading ' + filename)
    blob = bucket.get_blob(filename)
    blob.download_to_filename(Destination_Folder + filename)

# This checks if the file exists in the bucket already.
# Usually before downloading to the local computer
def gdld_chk(filename, bucket):
    print('Checking for ' + filename)
    #bucket = storage_client.get_bucket(bucket)
    print(bucket.get_blob(filename))
    return bucket.get_blob(filename)


# Check if the file is in the bucket. If it is, download, else, indicate so that the
# file can be created locally.
print()
for filename in ['product_search.csv', 'products_catalog.csv']:
    if gdld_chk(filename, bucket) == None:
        print(filename + ' not in GCS bucket')
    else:
        print('Downloading ' + filename + ' from GCS bucket')
        gdld_dn(filename, bucket)
    print()

print()
for page in pageTags:
    container_a = page.find('a')
    container_img = container_a.find('img')

    container_href = container_a.get('href')
    product_id = container_img.get('data-pid')
    #image_uri = image_store + product_id + '.jpg'
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

    image_uri = gdld(product_id, src, bucket, bucketName)


    if (path.exists(product_search) == False):
        print('no existing product_search file. Creating...')
        product_search_header()

    with open(Destination_Folder + 'product_search.csv', 'a') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                            product_display_name, labels, bounding_poly])


    if (path.exists(products_catalog) == False):
        print('no existing products_catalog file. Creating...')
        products_catalog_header()

    with open(Destination_Folder + 'products_catalog.csv', 'a') as csvfile:
        tagwriter = csv.writer(csvfile, delimiter=',')
        tagwriter.writerow([image_uri, image_id, product_set_id, product_id, product_category, \
                            product_display_name, labels, bounding_poly, src, product_page, \
                            product_availability])

    print('-'*50)

print()
# Upload the files to GCS
for filename in ['product_search.csv', 'products_catalog.csv']:
    gdld_up(filename, bucket)

print()
# Confirm that the files were properly uploaded.
for filename in ['product_search.csv', 'products_catalog.csv']:
    gdld_chk(filename, bucket)

print('Check bucket for new images. Confirm complete')



