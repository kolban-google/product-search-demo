import React from 'react';
import axios from 'axios';
//import './App.css';
import Button from '@material-ui/core/Button';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { DropzoneArea } from 'material-ui-dropzone';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import LinearProgress from '@material-ui/core/LinearProgress';
import Webcam from "react-webcam";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Alert from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Container from '@material-ui/core/Container';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from "@material-ui/core/styles";
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import InfoIcon from '@material-ui/icons/Info';


/**
 * The results from the Cloud Function that contains Product Search results
 * looks as follows:
 * 
 * [
 *  {
 *   "productName": <String>,
 *   "displayName": <String>,
 *   "score":       <Float>,
 *   "uri":         <String>
 *  },
 * ...
 * ]
 * 
 * These results are stored in the `state.products` state entry.
 */

const REGION     = "us-east1";
const PROJECT_ID = "kolban-product-search";
const API_KEY    = "2adbf59c-61fd-46f6-a2c7-2ac924dae30c";


//const CLOUD_FUNCTION_URI="http://localhost:9876";
const CLOUD_FUNCTION_URI=`https://${REGION}-${PROJECT_ID}.cloudfunctions.net/product-search`;

const useStyles = (theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  title: {
    flexGrow: 1,
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    //this.webcamRef = React.useRef(null);
    this.state = {
      products: [],  // The products that have been found in search
      openProoductInfoDialog: false,
      loading: false,
      useWebcam: false,
      webcamDisabled: true,
      cameraFacing: "front",
      selectedProduct: null,
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
    this.setState({ "products": retData });  // Set the products that we have received.
    this.setState({ "loading": false });     // Switch off any loading widgets
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
    const { classes } = this.props;
    return (
      <div>
      <Backdrop open={this.state.loading} className={classes.backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
        <Dialog open={this.state.openProoductInfoDialog}>
          <DialogTitle>Product Information</DialogTitle>
          <DialogContent dividers>

            <DialogContentText>
              {
                this.state.selectedProduct != null ? (
                  <div>
                    <p>Product Name: {this.state.selectedProduct.productName}</p>
                    <p>Display Name: {this.state.selectedProduct.displayName}</p>
                    <p>Score: {this.state.selectedProduct.score}</p>
                  </div>
                ):(<div></div>)
              }
            
            </DialogContentText>

          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => this.setState({openProoductInfoDialog: false})}
              color="primary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
        {this.state.alert != null?(<Alert severity="error">{this.state.alert}</Alert>):(<div />)}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" className={classes.title}>Product Search</Typography>
            { this.state.useWebcam == false?(
            <Button color="primary" variant="contained" onClick={
              () => {
                this.setState({"useWebcam": true});
              }
            }><PhotoCameraIcon/>&nbsp;Camera</Button>
            ): (
              <Button color="primary" variant="contained" onClick={
                () => {
                  this.setState({"useWebcam": false});
                }
              }><CloudUploadIcon/>&nbsp;Upload</Button>
            )}
          </Toolbar>
        </AppBar>

        <div style={({ margin: "20px" })}>
          <p>Select an image for Product searching:</p>

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
              <Grid container>
                <Grid item xs={6}>
                <DropzoneArea
                  acceptedFiles={['image/*']}
                  dropzoneText={"Drag and drop an image here or click to perform a Product Search"}
                  filesLimit={1}
                  showAlerts={['error']}
                  showPreviews={false}
                  onChange={(files) => { if (files.length > 0) this.fileSelected(files) }}
                />
                </Grid>
              </Grid>
            )
          }
          </div>
          <Container maxWidth="lg">
            <GridList cellHeight={150} cols={5}>
              {
                this.state.loading ? (<LinearProgress style={({width: '100%', height: "8px", marginTop: '8px'})}/>) : (
                this.state.products.map((item) => (
                  <GridListTile key={item.uri}>
                    <img src={item.uri} key={item.uri} alt="none" />
                    <GridListTileBar title={Math.round(item.score*1000)/1000}
                      actionIcon={
                        <IconButton onClick={() => {
                          console.log(item);
                          this.setState({selectedProduct: item});
                          this.setState({openProoductInfoDialog: true});
                        }}>
                          <InfoIcon />
                        </IconButton>
                      }>
                    </GridListTileBar>
                  </GridListTile>
                ))
                )
              }
            </GridList>
          </Container>
        </div>
      </div>
    );
  }
}

export default withStyles(useStyles)(App);
