# Environment variables
REGION=us-east1
PROJECT=kolban-product-search
API-KEY=2adbf59c-61fd-46f6-a2c7-2ac924dae30c
SERVICE-ACCOUNT=demo-sa@kolban-product-search.iam.gserviceaccount.com
GCS-PREFIX=gs://kolban-fashion-products

all:
	@echo "Configuration"
	@echo "-------------"
	@echo "create-product-search     - Create the Product Search definition."
	@echo "describe-product-search   - Examine the Product Search definition."




# Create the product search information from the CSV data describing the product-set/products/images.
create-product-search:
	echo "" > log.txt
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/40000_44424.csv \
		--location $(REGION) \
		--project $(PROJECT) >> log.txt

# Display the details of the product search entry for the product set called "my_product_set".  Watch for index time being recent.
describe-product-search:
	gcloud beta ml vision product-search product-sets describe my_product_set \
		--location $(REGION) \
		--project $(PROJECT)