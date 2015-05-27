// first try at live beat detection from fft data
// contains two classes : one for onset detection - OnsetDetect and one to detect when amplitude reaches a certain treshold - BeatDetect (probably ill named)

var file ='../_files/Tripping.mp3'


var source_file; // sound file
var src_length; // hold its duration

var fft;

var pg; // to draw waveform

var playing = false;
var button;

// detectors
var onsetLow,beatLow;
var onsetLowMid,beatLowMid;
var onsetMid, beatMid;



function preload(){
    source_file = loadSound(file); // preload the sound
}

function setup() {
  createCanvas(windowWidth, 250);
  textAlign(CENTER);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  println("source duration: " +src_length);

  // draw the waveform to an off-screen graphic
  var peaks = source_file.getPeaks(); // get an array of peaks
  pg = createGraphics(width,150);
  pg.background(100);
  pg.translate(0,75);
  pg.noFill();
  pg.stroke(0);
  for (var i = 0 ; i < peaks.length ; i++){
        var x = map(i,0,peaks.length,0,width);
        var y = map(peaks[i],0,1,0,150);
          pg.line(x,0,x,y);
          pg.line(x,0,x,-y);
   }


    // FFT
   fft = new p5.FFT();

   // instanciation of onset and beat detection from fft
   // arguments are f1 , f2 , name , threshold
   // low band : 40Hz-120Hz
   onsetLow = new OnsetDetect(40,120,"bass",0.025);
   beatLow = new BeatDetect(40,120,"bass",0.9);
   // lowMid band : 140Hz-400Hz
   onsetLowMid = new OnsetDetect(140,400,"lowMid",0.025);
   beatLowMid = new BeatDetect(140,400,"lowMid",0.8);
   // mid band : 400Hz-2.6kHz
   onsetMid = new OnsetDetect(400,2600,"Mid",0.025);
   beatMid = new BeatDetect(400,2600,"Mid",0.65);


    // gui
   button = createButton('play');
   button.position(3, 3);
   button.mousePressed(play);
}


function draw() {
	background(180);

	image(pg,0,100); // display our waveform representation

	 // draw playhead position 
    fill(255,255,180,150);
    noStroke();
    rect(map(source_file.currentTime(),0,src_length,0,windowWidth),100,3,150);
    //display current time
    text("current time: "+nfc(source_file.currentTime(),1)+" s",60,50);

    // spectrum
    var spectrum = fft.analyze(); 

    	// display and update our detector objects
  	text("onset detection",350,15);
  	text("beat detection ",750,15);

  	onsetLow.display(250,50);
  	onsetLow.update(fft);

  	beatLow.display(650,50);
  	beatLow.update(fft);

  	onsetLowMid.display(350,50);
  	onsetLowMid.update(fft);

  	beatLowMid.display(750,50);
  	beatLowMid.update(fft);

  	onsetMid.display(450,50);
  	onsetMid.update(fft);

  	beatMid.display(850,50);
  	beatMid.update(fft);

  	if (source_file.currentTime()>=src_length-0.05){
  		source_file.pause();
  	}
  
}

function mouseClicked(){
	if(mouseY>100 && mouseY<350){		
		var playpos = constrain(map(mouseX,0,windowWidth,0,src_length),0,src_length);	
		source_file.play();	
		source_file.play(0,1,1,playpos,src_length);	
		playing = true;
		button.html('pause');		
	}	
	return false;//callback for p5js
}

function keyTyped(){
	if (key == ' '){
		play();
	}
	return false; // callback for p5js
}

function play(){
	if(playing){
		source_file.pause();
		button.html('play');
		playing = false;
	}
	else{
		source_file.play();
		button.html('pause');
		playing = true;
	}	
}


function OnsetDetect(f1,f2,str,thresh){
	this.isDetected = false;
	this.f1=f1;
	this.f2=f2;
	this.str = str;
	this.treshold = thresh;
	this.energy = 0;
	this.penergy =0;
	this.siz = 10;
	this.sensitivity = 125;
}

OnsetDetect.prototype.display = function(x,y) {
	
	if(this.isDetected == true){
		this.siz = lerp(this.siz,40,0.99);
	}
	else if (this.isDetected == false){
		this.siz = lerp(this.siz,15,0.99);
	}
	fill(255,0,0);
	ellipse(x,y,this.siz,this.siz);
	fill(0);
	text(this.str,x,y);
	text("( "+this.f1+" - "+this.f2+"Hz )",x,y+10);
}

OnsetDetect.prototype.update = function(fftObject) {
	this.energy = fftObject.getEnergy(this.f1,this.f2)/255;
	
	if(this.isDetected == false){
		if (this.energy-this.penergy > this.treshold){
			this.isDetected = true;
			var self = this;
			setTimeout(function () {
				self.isDetected = false;
			},this.sensitivity);
		}
	}
		
	this.penergy = this.energy;
		
}


function BeatDetect(f1,f2,str,thresh){
	this.isDetected = false;
	this.f1=f1;
	this.f2=f2;
	this.str = str;
	this.treshold = thresh;
	this.energy = 0;
	
	this.siz = 10;
	this.sensitivity = 125;
}

BeatDetect.prototype.display = function(x,y) {
	
	if(this.isDetected == true){
		this.siz = lerp(this.siz,40,0.99);
	}
	else if (this.isDetected == false){
		this.siz = lerp(this.siz,15,0.99);
	}
	fill(255,0,0);
	ellipse(x,y,this.siz,this.siz);
	fill(0);
	text(this.str,x,y);
	text("( "+this.f1+" - "+this.f2+"Hz )",x,y+10);
}

BeatDetect.prototype.update = function(fftObject) {
	this.energy = fftObject.getEnergy(this.f1,this.f2)/255;
	
	if(this.isDetected == false){
		if (this.energy > this.treshold){
			this.isDetected = true;
			var self = this;
			setTimeout(function () {
				self.isDetected = false;
			},this.sensitivity);
		}
	}	
}


