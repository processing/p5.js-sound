// ====================
// DEMO: P5.Panner3D: use mouseX and mouseY to control panners X and Y
// panners positionZ moves from -10000 to 10000
// ====================


var soundFile;
var panner3d;
var zPos, ZDir;
var description, position;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/beat');
}

function setup() {
  createCanvas(500, 500); 
  soundFile.volume = .6;

  //disconnect sound file and send it to output via Panner3D
  soundFile.disconnect();
  panner3d = new p5.Panner3d();
  soundFile.connect(panner3d);
  soundFile.loop();
  zPos = 0;
  zDir = 0.5;

  description = createDiv('Panner3D: Control the the panners '+
                  'positionX and positionY with the mouse '+
                  'positionZ pans from -100 to 100')
  position = 'positionX: 0'+'positionY: 0' + 'positionZ: 0';
  p2 = createDiv(position);

  description.position(550,0).size(400,50);
  p2.position(550,50);

}

function draw() {
  background(0);
  updateDescription();

  //Pan the sound in the Z direction
  if (zPos > 50 || zPos < -50) {
    zDir = -zDir;
  }
  zPos += zDir;

  //Position the sound in 3 dimensions
  panner3d.position( max(min(25*(mouseX-width/2),6500),-6500), 
                    max(min(25*(mouseY-width/2),6500),-6500), 
                    max(min(200*zPos,10000),-10000));
  ellipse(width/2, height/2, 20, 20);
  fill(255,0,0);
  ellipse(mouseX, mouseY, 20,20)
  
}

function updateDescription(){
  position = 'positionX: '+ panner3d.positionX() +
                '<br>positionY: '+ panner3d.positionY() +
                '<br>positionZ: '+panner3d.positionZ();
p2.html(position);
}