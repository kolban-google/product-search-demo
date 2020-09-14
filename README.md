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
To best appreciate this demonstration you need an understanding of the GCP Product Search offering.  Here are some notes that may help.

Product Search is a Google offering that is used to match a user supplied image to a list of the closest products that look like the image.
Think of this as a function that takes an image as input and returns a list of objects as output where each object contains:

* The identity of the product that matched (product id)
* The score for the match (0.0 = almost no match, 1.0 = an exact/idential match)

It is assumed that the product id returned from Product Search will then be used to perform some "lookup" of a web page or other information
that will be presented to the user.  Take care to understand that Product Search concerns itself with just the data to perform a product
visual match.  Product Search won't contain any data un-related to that need.  For example, Product Search should not know how many items
are in stock or which isle in the store contains the product or the web URL to show details of the product.  Instead, one should assume
that the product id returned by Product Search would be used a lookup key to some product catalog database where those items (which are
not related to the task of Product Search) should be found.

So what then *do* we need to describe to Product Search?

The first concept is that of the "product set".  A product set is the set of all products that belong together in a catalog.  For our demonstration,
this will be a constant as we are only maintaining a single catalog of products.

The second concept is that of a product.  Each product will be associated with a single product set.  Each product has a unique product id.  It is this
product id that is returned for an image match.

The last concept we need is that of the references images themselves.  Each reference image is associated with a product and a product can have multiple reference images.


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