import React from 'react';
import axios from 'axios';
//import './App.css';
//import Button from '@material-ui/core/Button';
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

const sampleData = [{ "displayName": "Myntra Men's Brain Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/3365", "score": 0.3483123481273651, "uri": "gs://kolban-fashion-products/images/3365.jpg" }, { "displayName": "Myntra Men's I am a nice guy Navy Blue T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/3353", "score": 0.3360078036785126, "uri": "gs://kolban-fashion-products/images/3353.jpg" }, { "displayName": "Flying Machine Men Tee Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/35971", "score": 0.31081119179725647, "uri": "gs://kolban-fashion-products/images/35971.jpg" }, { "displayName": "Myntra Men Black Printed T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/34408", "score": 0.30468350648880005, "uri": "gs://kolban-fashion-products/images/34408.jpg" }, { "displayName": "Locomotive Men Navy Blue Printed T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/24062", "score": 0.3008976876735687, "uri": "gs://kolban-fashion-products/images/24062.jpg" }, { "displayName": "Nike Men Dunk High Grey Casual Shoes", "productName": "projects/test1-253523/locations/us-east1/products/22733", "score": 0.2863667905330658, "uri": "gs://kolban-fashion-products/images/22733.jpg" }, { "displayName": "Locomotive Men Printed Brown TShirt", "productName": "projects/test1-253523/locations/us-east1/products/16501", "score": 0.2814158797264099, "uri": "gs://kolban-fashion-products/images/16501.jpg" }, { "displayName": "Indigo Nation Men Printed Black T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/29584", "score": 0.2806089222431183, "uri": "gs://kolban-fashion-products/images/29584.jpg" }, { "displayName": "ADIDAS Men's Graphic White T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/5838", "score": 0.2796860933303833, "uri": "gs://kolban-fashion-products/images/5838.jpg" }, { "displayName": "ADIDAS Men's Twelve Faster T-shirt", "productName": "projects/test1-253523/locations/us-east1/products/5865", "score": 0.27686807513237, "uri": "gs://kolban-fashion-products/images/5865.jpg" }]
sampleData.forEach((element) => {
  // Substitute gs:// for http://
  element.uri = element.uri.replace(/gs:\/\//, 'http://storage.googleapis.com/');
});

async function upload(files) {
  //debugger;
  console.log(`Performing upload!: ${files}`);
  let reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = async () => {
    console.log("Loaded!");
    //console.log(reader);
    const imageData = reader.result.replace(/.*,/, ''); // Remove the prefix of the data URL so we end up with just Base64
    //console.log(data);
    //reader.result = a Data URL
    const resp = await axios(
      {
        method: "post",
        "url": "http://localhost:9876",
        "data": {
          "image": imageData
        }
      }
    ); // End of axios
    console.log(resp.data);

  } // End of onload
} // End of upload

function App() {
  return (
    <div>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">Product Search</Typography>
        </Toolbar>
      </AppBar>


      {/*
      <Button variant="contained" component="label" color="primary">Upload File
      <input type="file" name="fileToUpload" id="fileToUpload" style={{display: "none"}}></input>
      </Button>
      */}
      <div style={({ margin: "20px" })}>
        <p>Upload an image for Product searching:</p>
        <DropzoneArea
          acceptedFiles={['image/*']}
          dropzoneText={"Drag and drop an image here or click to perform a Product Search"}
          filesLimit={1}
          onChange={(files) => {if (files.length > 0) upload(files)}}
        />
        <p>We have {sampleData.length} matches</p>

        <GridList cellHeight="auto" cols={5}>
          {
            sampleData.map((item) => (
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
          }
        </GridList>
      </div>
    </div>
  );
}

export default App;
