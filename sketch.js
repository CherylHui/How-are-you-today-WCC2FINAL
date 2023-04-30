//Canvas Setup

let canvas;
//GUI SetUp
let gui;
let checkbox;
let slider;
let val;
let f;
//FaceAPI variables
let faceapi;
let detections = [];
let video;
let nt, hap,sa,ang, dis, sur,fe;
//Audio Parts

var song;
var button;
var amp;
var volhistory = [ ];

//Audio Analysis
let fft;
let bass, lowMid, mid, highMid, treble;
let neutralPlaying = false;
let happyPlaying = false;
let sadPlaying = false;
let fearPlaying = false;
let meditationDone = false;



//Serial Communication 
let serial;// variable for p5.SerialPort object
let serialPortName = '/dev/tty.usbserial-1110';// variable of serialPortName (Change the name according to the portname on p5.serialcontrol app)



let inData; // for incoming serial data
let inByte;
let byteCount = 0;
let output = 0;
let options = { baudRate: 9600 };
let Hr;


//variable Timer
let fC;
//Preload Function
function preload(){
  //Loading Audio files
  song = loadSound ('SadHealer.mp3');
  happySong = loadSound('SelfloveHealer.mp3');
  nervousSong = loadSound('NervousHealer.mp3');
  //Loading Text Font
  myFont = loadFont('SourceSansPro-Light.ttf');

}
function setup() {
  canvas = createCanvas(windowWidth , windowHeight);
  canvas.parent("sketch-container");
  //show GUI for adjustment
  addGUI();
  
//Serial Communication setup
  // create instance of p5.SerialPort
  serial = new p5.SerialPort();

  // print version of p5.serialport library
  console.log('p5.serialport.js ' + serial.version);

  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors

  serial.openPort(serialPortName, options); // open a serial port
  serial.clear();


  video = createCapture(VIDEO);// Create the video
 
  //setting up faceAPI model
  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  //Initialize the model
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  angleMode(DEGREES);

  stroke(255);
  strokeWeight(1);
  //fill(100,25,100);
  noFill();




  function faceReady() {
  faceapi.detect(gotFaces);// Start detecting faces
}


// Got faces:
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;　//Now all the data in this detections
  // console.log(detections);

  //clear();//Draw transparent background
  //drawBoxs(detections);//Draw detection box
  // drawLandmarks(detections);//// Draw all the face points
 drawExpressions(detections);//Draw face expression

  faceapi.detect(gotFaces);// Call the function again at here


  //Audio part
  // Neutral Face trigger
  if(nt > 98 && neutralPlaying == false){
  song.play();
  happyPlaying = true;
  fearPlaying = true;
  sadPlaying = true;
  
  amp = new p5.Amplitude();
  fft= new p5.FFT();
  song.amp(0.2);
  neutralPlaying = true;
  nt = 0;
  hap = 0;
  fe = 0;
  sa = 0;
  ang = 0
  console.log('NEUTRAL');
  }
  if(happyPlaying == true || neutralPlaying == true || fearPlaying == true || sadPlaying == true){
    happyPlaying = true;
    fearPlaying = true;
    sadPlaying = true;
    neutralPlaying = true;
    nt = 0;
    hap = 0;
    fe = 0;
    sa = 0;
    ang = 0
  }


   // Happy Face trigger
   if(hap > 98 && happyPlaying == false){
    happySong.play();
    neutralPlaying = true;
    fearPlaying = true;
    sadPlaying = true;
  
    amp = new p5.Amplitude();
    fft= new p5.FFT();
    happySong.amp(0.2);
    happyPlaying = true;
    nt = 0;
    hap = 0;
    fe = 0;
    sa = 0;
    ang = 0

    console.log('Happy');
    }

    if(happyPlaying == true || neutralPlaying == true || fearPlaying == true || sadPlaying == true){
    neutralPlaying = true;
     nt = 0;
    hap = 0;
    fe = 0;
    sa = 0;
    ang = 0
    }
 

       // Angry Face trigger
   if(ang > 98 && fearPlaying == false){
    nervousSong.play();
    Playing = true;
    amp = new p5.Amplitude();
    fft= new p5.FFT();
    nervousSong.amp(0.2);
    fearPlaying = true;
    nt = 0;
    hap = 0;
    fe = 0;
    sa = 0;
    ang = 0

    console.log('Angry');
    }
    if(happyPlaying == true || neutralPlaying == true || fearPlaying == true || sadPlaying == true){
    neutralPlaying = true;
    happyPlaying = true;
    fearPlaying = true;
    sadPlaying = true;
     nt = 0;
    hap = 0;
    fe = 0;
    sa = 0;
    ang = 0
    }
 
}

function drawExpressions(detections){
  if(detections.length > 0){//If at least 1 face is detected
    let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
    nt = nf(neutral*100, 2, 2); // neutral(tired) face
    hap = nf(happy*100, 2, 2);  // happy face
    ang = nf(angry*100, 2, 2); // angry face
    sa = nf(sad*100, 2, 2); // sad face
    fe = nf(fearful*100, 2, 2); // fear (nervous ) face 
   // dis = nf(disgusted*100, 2, 2); //disgusted face  --> leave for further development
   //  sur = nf(surprised*100, 2, 2); // surprised face --> leave for further development
 

          ///////Console.log here for debug function/////// 
          
    // console.log("neutral:       " + nf(neutral*100, 2, 2));
    // console.log("happiness: " + nf(happy*100, 2, 2));
    // console.log("anger:        " + nf(angry*100, 2, 2));
    // console.log("sad:            "+ nf(sad*100, 2, 2));
    // console.log("disgusted: " + nf(disgusted*100, 2, 2));
    // console.log("surprised:  " + nf(surprised*100, 2, 2));
    // console.log("fear:           " + nf(fearful*100, 2, 2));
  }
}

}





function draw() {
  f = -1 //Default to be mirror image for text [ you may set it to 1 if not using Pepper Ghost techniques]
  video.hide(); // hiding the video
// Slider and Checkbox Value
val = slider.value();// You may input the value after testing the setup
if (inByte> 50){
  Hr = inByte;
}
console.log(Hr);
  fC = frameCount/60;
  if (fC <10){
    background(255-val);
  textFont(myFont);
  fill(0);
  textSize(36);
  if (fC<5){
    background(255-val);
    textAlign(CENTER);
    push();
    translate(width/4,50); //the Xposition may need to adjust during setup
    scale(f,1);
  text('Hello, How are you today?',0,0);
  pop();
  }
  else if((fC<8) && (fC >= 5)){
    background(255-val);
    video.remove(); 
    push();
    translate(width/4,50); //the Xposition may need to adjust during setup
    scale(f,1);
    text('Put your finger onto the sensor and press it hard', 0, 0);
    pop();
  }
  else{
    background(255,255,255);
    push();
    translate(width/4,50); //the Xposition may need to adjust during setup
    scale(f,1);
    text('and let the journey begins...',0,0);
    pop();
  }
}
  if((fC >10) && (fC < 30)){
    background(255-val);
    noFill();
  let spectrum = fft.analyze();
  bass = fft.getEnergy("bass");
  lowMid = fft.getEnergy("lowMid");
  mid = fft.getEnergy("mid");
  highMid = fft.getEnergy("highMid");
  treble = fft.getEnergy("treble");
  var vol = amp.getLevel();
  volhistory.push (vol);
  push();
  translate(width/2,height/2);
  stroke(bass*1.2,mid+50*1.5,Hr);
  strokeWeight(2);
  shadow();
  figure(lowMid*2);
  pop();

  }


  song.onended(songDone);
  happySong.onended(songDone);
  nervousSong.onended(songDone);

  if (meditationDone == true){
    fC = 31;

  background(0,0,0);
  push();
  translate(0,0);
  noStroke();
  fill(0);
  rect(0,0,width,height);
  fill(255-val);
  push();
    translate(width/4,50); //the Xposition may need to adjust during setup
    scale(f,1);
  text('Look here...',0,0);
  pop();
  push();
    translate(width/4,height/2); //the Xposition may need to adjust during setup
    scale(f,1);
    text('Thank you for spending time with yourself.',0,0);
  pop();
  }

//console.log(fC);
}

function figure(radius){

  beginShape();


  for(let theta=0; theta< 360; theta +=1){
    for (i = 0; i < volhistory.length; i++){
      //let offset = map(volhistory[i],0,1,0,150);
    let x = ( bass *cos(20*theta*highMid))* cos(theta+fC);
    let y = (cos(10*theta*treble)+200)* sin(theta);
    //ellipse(ballX, ballY, 16, 16);
    vertex(x,y);

    }
  }
  endShape(CLOSE);

  beginShape();


  for(let theta=0; theta< 360; theta +=1){
    for (i = 0; i < volhistory.length; i++){
      //let offset = map(volhistory[i],0,1,0,150);
    let x = ( bass *cos(20*theta*highMid))* sin(theta);
    let y = (cos(10*theta*treble)+200)* cos(theta+frameCount);
    //ellipse(ballX, ballY, 16, 16);
    vertex(y,x);
   ;
    }
  }
  endShape(CLOSE);
console.log(val); // For adjusting the threshold of the "White" canvas
}


function shadow(){
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -5;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(bass,treble,mid,255);
}


function songDone() {
 
  console.log('END');
  meditationDone = true;
 }




 // callback function to update serial port name
function updatePort() {
  // retrieve serial port name from the text area
  serialPortName = htmlInputPortName.value();
  // open the serial port
  serial.openPort(serialPortName);
}

function serialEvent() {
  // read a byte from the serial port:
  inByte = int(serial.read());


  //console.log(inByte);
  byteCount++;
}

function serialError(err) {
  print('Something went wrong with the serial port. ' + err);
}


function keyTyped()  {
  if(key ==='g'){
    checkbox.show();
    slider.show();
  }
  if (key ==='e') {
  value = 0;
  checkbox.hide();
  slider.hide();
  
}
}

function addGUI(){
checkbox = createCheckbox('Flip', false);
checkbox.changed(myCheckedEvent);
checkbox.position(10, windowHeight-50);
checkbox.parent("gui-container");
slider = createSlider(0, 50, 0); // for adjusting the "white" of the canvas, prevent strong light
slider.position(10, windowHeight-30);
slider.style('width', '80px');
val = slider.value();
slider.parent("gui-container");
checkbox.hide();
  slider.hide();

}

function myCheckedEvent() {
if (checkbox.checked()) {

  f = 1;
} else {
  f = -1; // default to be mirro image (for this set up)
}
}

function windowResized() {
  console.log("Hello");
    resizeCanvas(windowWidth, windowHeight);
    f = 1;
    val = slider.value();
    slider.position( 10, windowHeight - 30); //Reset everytime
    checkbox.position(10, windowHeight-50); //Reset everytime
  }