const vision = require('@google-cloud/vision');
const fs = require('fs');
const util = require('util')
const PROJECT_ID="kolban-product-search"
const CREDENTIALS_FILE="demo-sa.key"


async function run() {
    const content = fs.readFileSync('sample_images/blue.jpeg', 'base64');
    //const content              = fs.readFileSync('3431.jpg', 'base64');
    const productSearchClient = new vision.ProductSearchClient({ keyFilename: CREDENTIALS_FILE });
    const imageAnnotatorClient = new vision.ImageAnnotatorClient({ keyFilename: CREDENTIALS_FILE });
    //const projectId = 'test1-253523';
    const location = 'us-east1';
    const productSetId = 'my_product_set';
    const productSetPath = productSearchClient.productSetPath(PROJECT_ID, location, productSetId);
    console.log(`productSetPath: ${productSetPath}`);
    const request = {
        image: { content: content },
        features: [{ type: 'PRODUCT_SEARCH' }],
        imageContext: {
            productSearchParams: {
                productSet: productSetPath,
                productCategories: ['apparel-v2'],
                filter: ''
            },
        }
    };
    const [response] = await imageAnnotatorClient.annotateImage(request);

    console.log(util.inspect(response, {depth: 10}));
    //console.log(JSON.stringify(response))

    const output = [];
    for (let i = 0; i < response.productSearchResults.results.length; i++) {

        result = response.productSearchResults.results[i];

        //console.log(`Product Display Name: ${result.product.displayName}, Product: ${result.product.name}`);
        const [imageDetails] = await productSearchClient.getReferenceImage({ name: result.image });
        //console.log(imageDetails.uri);

        const newRecord = {
            "displayName": result.product.displayName,
            "productName": result.product.name,
            "score": result.score,
            "uri": imageDetails.uri
        }
        output.push(newRecord);
    }
    console.log(JSON.stringify(output))

}

run();
//console.log('done');