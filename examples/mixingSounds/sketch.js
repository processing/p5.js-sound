
// load two soundfile and crossfade beetween them
var sound1,sound2;
var gain1, gain2, gain3;

function preload(){
  soundFormats('ogg', 'mp3');
  sound1 = loadSound('../files/Damscray_-_Dancing_Tiger_01');
  sound2 = loadSound('../files/beat.mp3');
}

function setup() {
  createCanvas(400,200);

  // create a 'master' gain to which we will connect both soundfiles
  gain3 = new p5.Gain();
  gain3.connect();

  // setup first sound for playing
  sound1.rate(1);
  sound1.loop();
  sound1.disconnect(); // diconnect from p5 output

  gain1 = new p5.Gain(); // setup a gain node
  gain1.setInput(sound1); // connect the first sound to its input
  gain1.connect(gain3); // connect its output to the 'master'

  sound2.rate(1);
  sound2.disconnect();
  sound2.loop();

  gain2 = new p5.Gain();
  gain2.setInput(sound2);
  gain2.connect(gain3);

}


function draw(){
  background(180);
  
  // calculate the horizontal distance beetween the mouse and the right of the screen
  var d = dist(mouseX,0,width,0);

  // map the horizontal position of the mouse to values useable for volume control of sound1
  var vol1 = map(mouseX,0,width,0,1); 
  var vol2 = 1-vol1; // when sound1 is loud, sound2 is quiet and vice versa

  gain1.amp(vol1,0.5,0);
  gain2.amp(vol2,0.5,0);

  // map the vertical position of the mouse to values useable for 'master volume control'
  var vol3 = map(mouseY,0,height,0,1); 
  gain3.amp(vol3,0.5,0);
}


