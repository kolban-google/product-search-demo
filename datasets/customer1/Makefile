GCS-PREFIX=gs://kolban-product-search/customer1_products
REGION=us-east1
PROJECT=kolban-product-search

.PHONY: check-env

check-env:
ifndef PRODUCT_SET_ID
	$(error PRODUCT_SET_ID is undefined)
endif

all: check-env
	@echo "copy"
	@echo "describe-product-search"
	@echo "create-product-search"

copy:
	#gsutil -m cp tmp/20200917-215251/*.jpg $(GCS-PREFIX)
	gsutil -m cp tmp/20200917-215251/*.csv $(GCS-PREFIX)

describe-product-search: check-env
	gcloud beta ml vision product-search product-sets describe $(PRODUCT_SET_ID) \
		--location $(REGION) \
		--project $(PROJECT)

create-product-search:
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/product_search.csv \
		--location $(REGION) --project $(PROJECT) > /tmp/product_search.log
	