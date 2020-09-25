# Cloud Function
When a client application has an image that is to be used as a reference, it must send that image somewhere for
it to be passed to Vision API Product Search for processing.  One such possibility is to use a Cloud Function.  This
folder contains the source of such a function.

The incoming request is expected to be an HTTP POST request with the image supplied.  The payload will contain:

```
{
    "image": "<BASE64 ENCODED IMAGE>
}
```

The headers for the request must include:

* Content-Type: "`application/json`"
* API-KEY: "`<CURRENT API KEY>`"

Note: The API-KEY is a uuid that was generated for the project and can be found at the start of the source of the
application.  The notion behind the API key is to protect against un-authorized public access.  For example, if
a port scanner was run against Google, it is _possible_ the Cloud Function may show up.  Given that we are being
charged for incoming requests, a bad actor could spam our endpoint creating cost.  If an API-KEY is not supplied or
is incorrect, the request will end quickly without invoking Product Search.

Within the source, we have some additional configuration properties.  These have been hard-coded for now but may
be exposed as environment variables is we go further.

* `API-KEY` - The API key to be used for access.
* `PROJECT_ID` - The Project ID for the project hosting the Product Search definitions.
* `REGION` - The Region hosting the Product Search definitions.

The following *must* be set as environment variables:

* `PRODUCT_SET_ID` - The name of the product set within the Product Search definitions that we are searching within.

## Response
The response from the Cloud Function must be a JSON string of the format:

```
[
  {
    "productName": <String>,
    "displayName": <String>,
    "score": <Float>,
    "uri": <String>
  },
  ...
]
```

With `Content-Type: application/json` header value and response code of `200`.  A response other than `200` means an error.


## Debugging
Should we wish to run this function locally, we can do that using the Functions Framework.  When using that feature, we must supply
a credentials file that contains the credentials to access Product Search.  Experience shows that the gcloud environment is
not sufficient.  We can use a service account key file and supply the name of that file in the environment variable
called `USE_CREDENTIALS_FILE`.  We need not specify this file when running in a Cloud Function.
