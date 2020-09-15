# Fashion Products

A data set is available on Kaggle called [Fashion Product Images Dataset](https://www.kaggle.com/paramaggarwal/fashion-product-images-dataset) and a second one that contains
smaller images [Fashion Product Images (small)](https://www.kaggle.com/paramaggarwal/fashion-product-images-small).  This folder
contains tools and utilities for working with that data.  An IPython notebook called `Styles_to_Product_Search` will convert the `styles.csv` 
that is part of the dataset to Product Search format CSV data ready for creating the Product Search catalog.

There are over 44,000 images in this data set.  They must be uploaded to GCS and then given public acls so that they can publicly read.
Be cautious in trying to list them as it appears that things break when we try and list 44,000 things.

Currently, the files should be uploaded to `gs://kolban-fashion-products/fashion-dataset/images/`.  Once uploaded, we need to open up the ACLs
for public read using:

```
gsutil acl ch -u AllUsers:R -r gs://kolban-fashion-products/fashion-dataset/images
```