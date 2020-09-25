// Variables for the project
//

const API_KEY        = "2adbf59c-61fd-46f6-a2c7-2ac924dae30c";
const PROJECT_ID     = "kolban-product-search";
const REGION         = "us-east1";

const util    = require("util");
const vision  = require("@google-cloud/vision");
//const fs      = require('fs');

async function performProductSearch(imageContent) {
    if (!process.env["PRODUCT_SET_ID"]) {
        throw "PRODUCT_SET_ID environment variable is not set.";
    }
    const PRODUCT_SET_ID = process.env["PRODUCT_SET_ID"];
    //const content              = fs.readFileSync('images.jpeg', 'base64');
    //const content              = fs.readFileSync('3431.jpg', 'base64');
    const options = {};
    if (process.env.USE_CREDENTIALS_FILE) {
        console.log(`Using credentials file: ${process.env.USE_CREDENTIALS_FILE}`);
        options.keyFilename = process.env.USE_CREDENTIALS_FILE;
    }
    const productSearchClient  = new vision.ProductSearchClient(options);
    const imageAnnotatorClient = new vision.ImageAnnotatorClient(options);
    const productSetPath = productSearchClient.productSetPath(PROJECT_ID, REGION, PRODUCT_SET_ID);
    const request = {
        image: { content: imageContent},
        features: [{type: 'PRODUCT_SEARCH'}],
        imageContext: {
            productSearchParams: {
                productSet: productSetPath,
                productCategories: ["general-v1"],
                filter: ''
            },
        }
    };
    const [response] = await imageAnnotatorClient.annotateImage(request);
    if (response.error || !response.productSearchResults) {
        console.log(util.inspect(response, {depth: 10}));
        return []; 
    }
    //console.log(util.inspect(response, {depth: 10}));
    //console.log(JSON.stringify(response))
    
    const output = [];
    for (let i=0; i<response.productSearchResults.results.length; i++) {

        const result = response.productSearchResults.results[i];

        //console.log(`Product Display Name: ${result.product.displayName}, Product: ${result.product.name}`);
        const [imageDetails] = await productSearchClient.getReferenceImage({name: result.image});
        //console.log(imageDetails.uri);
        
        const newRecord = {
            "displayName": result.product.displayName,
            "productName": result.product.name,
            "score": result.score,
            "uri": imageDetails.uri
        }
        output.push(newRecord);
    }
    //console.log(JSON.stringify(output))
    return output;
} // End of performProductSearch

//
// Entry point into our Cloud Function
//
exports.function = async (req, res) => {
    //console.log(`method: ${req.method}, body: ${util.inspect(req.body)}`);

    // Handle any CORS responses required.
    res.set("Access-Control-Allow-Origin", "*")
      .set("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    
    if (req.method == "OPTIONS") {
        res.status(200).send();
        return;
    }

    // Chgeck that we have an API key.
    if (req.header("API-KEY") != API_KEY) {
        res.status(500).send("Invalid API key");
        return; 
    }

    // Check that we have received an application/json payload.  We can't do a simple equals because value
    // values include:
    // * application/json
    // * application/json;charset
    //
    if (!req.header("Content-Type").includes("application/json")) {
        console.log(`Unexpected HTTP header value for Content-Type: ${req.header('Content-Type')}`);
        res.status(500).send("Unexpected content type");
        return;
    }

    // Check that we have received an image in the payload.  We expect
    // {
    //   "image": "<BASE64 ENCODED IMAGE>"
    // }
    if (!req.body || !req.body.image) {
        res.status(500).send("No image found in body");
        return;
    }

    //const body = JSON.parse(req.body);
    //const imageContent = fs.readFileSync('images.jpeg', 'base64');
    console.log("Received request");
    try {
        const output = await performProductSearch(req.body.image);
        console.log("Got response from Product Search");
        res.send(JSON.stringify(output)); // Is this the right way to send back JSON?  What if we just returned the JavaScript object?
        // Do we need to set the Content-Type: application/json header in our response?
    } catch(e) {
        console.log(e);
        res.status(500).send("crashed");
    }
} // End of function