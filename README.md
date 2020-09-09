# Product Search demonstration

One of the products in the Vision API portfolio is called Product Search.  This example allows us to execute
tests against Product Search.  It is composed of:

* A React based web app presenting a front end from which a source image can be entered
* A Cloud Function which is invoked passing in an image.  The results are matched products.


The following GCP APIs must be enabled:
* Compute
* Cloud Build
* Cloud Functions

## Building the Product Seach catalog

We must build the Product Search information.  We do this using a CSV that contains the identities of
the product sets (only one), products and images for each products.  We pass this CSV into
`gcloud beta ml vision product-search product-sets import`.  This starts the training for the
Product Search which proceeds in the background.  We know when the task completes because the output
of `gcloud beta ml vision product-search product-sets describe my_product_set --location us-east1`.  The training 
may take up to an hour to complete after submission.

An entry in our Makefile runs the command.  The Makefile entry is called `create-product-search`.

As an example of what we will find in the control CSV:

```
image-uri,image-id,product-set-id,product-id,product-category,product-display-name,labels,bounding-poly
gs://kolban-fashion-products/images/15970.jpg,,my_product_set,15970,apparel-v2,Turtle Check Men Navy Blue Shirt,,
gs://kolban-fashion-products/images/39386.jpg,,my_product_set,39386,apparel-v2,Peter England Men Party Blue Jeans,,
gs://kolban-fashion-products/images/59263.jpg,,my_product_set,59263,apparel-v2,Titan Women Silver Watch,,
```

The key items are:

* 1 - `image-uri` - URL to GCS file containing image.
* 2 - `image-id` - Identity of image (leave blank to have generated).
* 3 - `product-set-id` - The product set identifier.  A constant for our usage.
* 4 - `product-id` - Identity of the product for which this is an image.
* 5 - `product-category`
* 6 - `product-display-name`
* 7 - `labels`
* 8 - `bounding-poly`

It must be noted that the CSV files can only contain a maximum of 20,000 images.  If we need to define more images, we need to do so in batches of 20,000 or less.

## Fashion Product Images dataset
A sample dataset is available on the Internet within Kagle.  The data set is called [Fashion Product Images (Small)](https://www.kaggle.com/paramaggarwal/fashion-product-images-small).  It contains over 44,000 images.  A companion with this data is called `styles.csv`.  An IPython notebook has been built which parses this file and generates a Product Search CSV.


## Other files
* `test_product_search.js` - A stand-alone JS app that tests Product Search without needing web or
Cloud Functions.