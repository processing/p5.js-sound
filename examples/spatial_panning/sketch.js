// ====================
// DEMO: P5.Panner3D: Moves sound in 3D space from max negative coordinates, to max positive
// ====================


var soundFile;
var panner3d;
var description, position;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/lucky_dragons_-_power_melody');
}

var i;
var factorI;
function setup() {
  createCanvas(500, 500, WEBGL); 
 

  description = createDiv('Panner3D: The cone symbolizes the soundFile '+
                          'which is panning the soundin relation to the center of the '+
                          'canvas');
  p2 = createDiv(position);

  description.position(550,0).size(400,50);
  p2.position(550,50);

  panner1 = new p5.Panner3D();

  
  i = 0;
  factorI = 1;
  soundFile.disconnect();
  soundFile.loop();
  soundFile.connect(panner1);
}

function draw() {
  background(0);

  if (i > 500 || i < -500) {factorI = -1*factorI;}

  updateDescription();
  
  push();
  translate(i+=factorI*1,i + factorI*1,i + factorI*1);   
  rotateX(frameCount* 0.01);
  rotateY(frameCount* 0.01);
  rotateZ(frameCount* 0.01);
  cone(100);
  pop();

  //pan the sound along with the cone
  panner1.set(i*10,i*10,i*10);

  
}

function updateDescription(){
  position = 'positionX: '+ panner1.positionX() +
                '<br>positionY: '+ panner1.positionY() +
                '<br>positionZ: '+ panner1.positionZ();
p2.html(position);
}