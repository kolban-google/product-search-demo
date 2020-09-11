import React from 'react';
import axios from 'axios';
//import './App.css';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import InfoIcon from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';
import { DropzoneArea } from 'material-ui-dropzone';
import AppBar from '@material-ui/core/AppBar';
//import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Webcam from "react-webcam";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Alert from '@material-ui/lab/Alert'

/*
const sampleData = [{ "displayName": "Myntra Men's Brain Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/3365", "score": 0.3483123481273651, "uri": "gs://kolban-fashion-products/images/3365.jpg" }, { "displayName": "Myntra Men's I am a nice guy Navy Blue T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/3353", "score": 0.3360078036785126, "uri": "gs://kolban-fashion-products/images/3353.jpg" }, { "displayName": "Flying Machine Men Tee Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/35971", "score": 0.31081119179725647, "uri": "gs://kolban-fashion-products/images/35971.jpg" }, { "displayName": "Myntra Men Black Printed T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/34408", "score": 0.30468350648880005, "uri": "gs://kolban-fashion-products/images/34408.jpg" }, { "displayName": "Locomotive Men Navy Blue Printed T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/24062", "score": 0.3008976876735687, "uri": "gs://kolban-fashion-products/images/24062.jpg" }, { "displayName": "Nike Men Dunk High Grey Casual Shoes", "productName": "projects/test1-253523/locations/us-east1/products/22733", "score": 0.2863667905330658, "uri": "gs://kolban-fashion-products/images/22733.jpg" }, { "displayName": "Locomotive Men Printed Brown TShirt", "productName": "projects/test1-253523/locations/us-east1/products/16501", "score": 0.2814158797264099, "uri": "gs://kolban-fashion-products/images/16501.jpg" }, { "displayName": "Indigo Nation Men Printed Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/29584", "score": 0.2806089222431183, "uri": "gs://kolban-fashion-products/images/29584.jpg" }, { "displayName": "ADIDAS Men's Graphic White T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/5838", "score": 0.2796860933303833, "uri": "gs://kolban-fashion-products/images/5838.jpg" }, { "displayName": "ADIDAS Men's Twelve Faster T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/5865", "score": 0.27686807513237, "uri": "gs://kolban-fashion-products/images/5865.jpg" }]
sampleData.forEach((element) => {
  // Substitute gs:// for http://
  element.uri = element.uri.replace(/gs:\/\//, 'http://storage.googleapis.com/');
});
*/

const REGION="us-east1";
const PROJECT_ID = "kolban-product-search";
const API_KEY="2adbf59c-61fd-46f6-a2c7-2ac924dae30c";
//const CLOUD_FUNCTION_URI="http://localhost:9876";
const CLOUD_FUNCTION_URI=`https://${REGION}-${PROJECT_ID}.cloudfunctions.net/product-search`;

class App extends React.Component {
  constructor(props) {
    super(props);
    //this.webcamRef = React.useRef(null);
    this.state = {
      products: [],
      loading: false,
      useWebcam: false,
      webcamDisabled: true,
      cameraFacing: "front",
      "videoConstraints": {
        "facingMode": "user"  // Direction of camera for phones which have multiple cameras.
      },
      alert: null
    }
    this.webcamRef = React.createRef();
    this.snapWebcam = this.snapWebcam.bind(this);
  } // End of constructor

  /**
   * Callback invoked to snap a webcam image.
   */
  snapWebcam() {
    //console.log("Snap Webcam!");
    let imageSrc = this.webcamRef.current.getScreenshot();
    imageSrc = imageSrc.replace(/.*,/, '');
    //console.log('Got a new image');
    this.invokeProductSearch(imageSrc);
  } // End of snapWebcam

  /**
   * Callback invoked to perform a Product Search.
   * @param {*} imageData 
   */
  async invokeProductSearch(imageData) {
    this.setState({"loading": true});
    const resp = await axios(
      {
        "method": "post",
        "url": CLOUD_FUNCTION_URI,
        "data": {
          "image": imageData
        },
        "headers": {
          "API-KEY": API_KEY
        }
      }
    ); // End of axios

    const retData = resp.data;
    retData.forEach((element) => {
      // Substitute gs:// for http://
      element.uri = element.uri.replace(/gs:\/\//, 'http://storage.googleapis.com/');
    });
    this.setState({ "products": retData });
    this.setState({ "loading": false });
  } // End of invokeProductSearch

  /**
   * Callback invoked when a file is selected in the drag/drop.
   * @param {*} files 
   */
  async fileSelected(files) {
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = async () => {
      console.log("Loaded!");

      const imageData = reader.result.replace(/.*,/, ''); // Remove the prefix of the data URL so we end up with just Base64
      this.invokeProductSearch(imageData);
    } // End of onload
  } // End of fileSelected

  render() {

    return (
      <div>
        {this.state.alert != null?(<Alert severity="error">{this.state.alert}</Alert>):(<div />)}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4">Product Search</Typography>
          </Toolbar>
        </AppBar>

        <div style={({ margin: "20px" })}>
          <p>Upload an image for Product searching:</p>
          { this.state.useWebcam === false?(
            <Button color="primary" variant="contained" onClick={
              () => {
                this.setState({"useWebcam": true});
              }
            }>Webcam</Button>
          ):(<div></div>)}

          <div>
          {
            this.state.useWebcam === true ? (
              <div>
                <Webcam audio={false}
                  screenshotFormat="image/png"
                  width={320} height={160}
                  ref={this.webcamRef}
                  videoConstraints={this.state.videoConstraints}
                  onUserMediaError={(error) => {
                    console.log(error);
                    this.setState({webcamDisabled: true, alert: "Camera failure"});
                  }}
                  onUserMedia={(event) => {
                    console.log(event);
                    this.setState({webcamDisabled: false});
                  }}
                />
                <Button color="primary" variant="contained" onClick={this.snapWebcam} disabled={this.state.webcamDisabled}>Snap!</Button>
                { /* Handle the radio button for direction of camera (front or back) */}
                <FormControl>
                  <FormLabel>Direction</FormLabel>
                  <RadioGroup value={this.state.cameraFacing} onChange={(event) => {
                    this.setState({cameraFacing: event.target.value});
                    if (event.target.value === "front") {
                      this.setState({videoConstraints: {
                        "facingMode": "user"
                      }});
                      
                    } else {
                      this.setState({videoConstraints: {
                        "facingMode": {
                          "exact": "environment"
                        }
                      }});
                    }
                  }}>
                    <FormControlLabel label="Front" value="front" control={<Radio disabled={this.state.webcamDisabled}/>}/>
                    <FormControlLabel label="Back" value="back" control={<Radio disabled={this.state.webcamDisabled}/>}/>
                  </RadioGroup>
                </FormControl>
                { /* End of radio button for direction camera */ }
              </div>
            ) : (
              <DropzoneArea
                acceptedFiles={['image/*']}
                dropzoneText={"Drag and drop an image here or click to perform a Product Search"}
                filesLimit={1}
                showAlerts={['error']}
                showPreviews={false}
                onChange={(files) => { if (files.length > 0) this.fileSelected(files) }}
              />
            )
          }
          </div>
          <GridList cellHeight="auto" cols={5}>
            {
              this.state.loading ? (<LinearProgress style={({width: '100%', height: "8px", marginTop: '8px'})}/>) : (
              this.state.products.map((item) => (
                <GridListTile key={item.uri}>
                  <img src={item.uri} key={item.uri} alt="none" />
                  <GridListTileBar title={item.displayName}
                    actionIcon={
                      <IconButton>
                        <InfoIcon />
                      </IconButton>
                    }>
                  </GridListTileBar>
                </GridListTile>
              ))
              )
            }
          </GridList>
        </div>
      </div>
    );
  }
}

export default App;
