# Environment variables
REGION=us-east1
PROJECT=kolban-product-search
API-KEY=2adbf59c-61fd-46f6-a2c7-2ac924dae30c
SERVICE-ACCOUNT=demo-sa@kolban-product-search.iam.gserviceaccount.com
GCS-PREFIX=gs://kolban-fashion-products/fashion-dataset
PRODUCT_SEARCH_PRODUCT_SET=my_product_set

all:
	@echo "Configuration"
	@echo "-------------"
	@echo "run-react                 - Run the REACT environment."
	@echo "run-cloud-function-local  - Run the test Cloud Functions handler for local testing."
	@echo "test-cloud-function       - Make a REST call to the Cloud Function handler (GCP)."
	@echo "test-cloud-function-local - Make a REST call to the Cloud Function handler (local)."
	@echo "deploy-function           - Deploy the Cloud Function to GCP."
	@echo "delete-function           - Delete the Cloud Function."
	@echo "enable-services           - Enable the GCP services we need."
	@echo "create-product-search     - Create the definitions for Product Search."
	@echo "describe-product-search   - Examine the Product Search definition."
	@echo "delete-product-search     - Delete the definitions for Product Search."


# Run react
run-react:
	HTTPS=true npm start

# Run the local Cloud Function test framework.
run-cloud-function-local:
	USE_CREDENTIALS_FILE=demo-sa.key npx functions-framework --port 9876 --source ./cloud-function/cloud_function.js --target function --signature-type http


# Send a request to the cloud function for testing
test-cloud-function:
	curl --request POST "https://$(REGION)-$(PROJECT).cloudfunctions.net/product-search" \
		--data-binary @data.json \
		--header "Content-Type: application/json" \
		--header "API-KEY: $(API-KEY)"


# Test the Cloud Function on the local framework.
test-cloud-function-local:
	curl --request POST http://localhost:9876 \
		--data-binary @data.json \
		--header "Content-Type: application/json" \
		--header "API-KEY: $(API-KEY)"


# Deploy the Cloud Function on GCP.
deploy-function:
	gcloud functions deploy product-search \
		--project $(PROJECT) \
		--region $(REGION) \
		--allow-unauthenticated \
		--entry-point function \
		--runtime nodejs10 \
		--service-account $(SERVICE-ACCOUNT) \
		--trigger-http \
		--source ./cloud-function


service-account:
	gcloud iam service-accounts keys create demo-sa.key \
		--project $(PROJECT) \
		--iam-account $(SERVICE-ACCOUNT)

# Delete the Cloud Function on GCP.
delete-function:
	gcloud functions delete product-search --region $(REGION) --quiet

enable-services:
	gcloud services enable --project $(PROJECT) cloudbuild.googleapis.com
	gcloud services enable --project $(PROJECT) vision.googleapis.com

# Create the product search information from the CSV data describing the product-set/products/images.
create-product-search:
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/0_9999.csv --location $(REGION) --project $(PROJECT) > /tmp/product_search.log
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/10000_19999.csv --location $(REGION) --project $(PROJECT) >> /tmp/product_search.log
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/20000_29999.csv --location $(REGION) --project $(PROJECT) >> /tmp/product_search.log
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/30000_39999.csv --location $(REGION) --project $(PROJECT) >> /tmp/product_search.log
	gcloud beta ml vision product-search product-sets import $(GCS-PREFIX)/40000_44424.csv --location $(REGION) --project $(PROJECT) >> /tmp/product_search.log

# Display the details of the product search entry for the product set called "my_product_set".  Watch for index time being recent.
describe-product-search:
	gcloud beta ml vision product-search product-sets describe my_product_set \
		--location $(REGION) \
		--project $(PROJECT)

# Delete the definitions for product search.  This includes products and product-sets.
delete-product-search:
	gcloud beta ml vision product-search product-sets delete $(PRODUCT_SEARCH_PRODUCT_SET) --location=$(REGION) --quiet --project $(PROJECT)
	gcloud beta ml vision product-search product-sets list --location=$(REGION) --project $(PROJECT)
	gcloud alpha ml vision product-search products delete-all $(REGION) --product-set $(PRODUCT_SEARCH_PRODUCT_SET) --force --project $(PROJECT)
	gcloud alpha ml vision product-search products delete-all $(REGION) --orphan-products --force --project $(PROJECT)
	gcloud beta ml vision product-search products list --location=$(REGION) --project $(PROJECT)
	

upload-csv:
	gsutil cp 0_9999.csv $(GCS-PREFIX)
	gsutil cp 10000_19999.csv $(GCS-PREFIX)
	gsutil cp 10000_19999.csv $(GCS-PREFIX)
	gsutil cp 20000_29999.csv $(GCS-PREFIX)
	gsutil cp 30000_39999.csv $(GCS-PREFIX)
	gsutil cp 40000_44424.csv $(GCS-PREFIX)

deploy:
	npm run build
	cd firebase; firebase deploy