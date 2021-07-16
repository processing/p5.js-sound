// ====================
// DEMO: P5.Panner3D: use mouseX and mouseY to control panners X and Y
// panners positionZ moves from -10000 to 10000
// ====================



var nb = 1
var flock

var simulationParameters
var cameraControls

var cam_x_rot, cam_y_rot,cam_z_pos
var flock_sep, flock_ali, flock_coh

// audio

var soundFile;
var panner3d;
var listener3d;


function preload() {
    soundFormats('mp3', 'ogg');
    soundFile = loadSound('../files/beat');
}

function setup() {

    createCanvas(windowWidth, windowHeight,WEBGL);   

    resetCam()
    resetFlock()

    cameraControls = QuickSettings.create(5, 5, "Camera Controls");
    cameraControls.addRange("camera x rotation", -TWO_PI, TWO_PI, 0, 0.1, camXChange);
    cameraControls.addRange("camera y rotation", -PI, PI, -PI/2, 0.1, camYChange);
    cameraControls.addRange("camera z position", -15000, 1500, -500, 1, camZChange);
    cameraControls.addButton("camera reset", resetCam);

    simulationParameters = QuickSettings.create(255, 5, "Simulation Parameters");
    simulationParameters.addRange("separation" ,0,10, 1.5, 0.1, sepChange);
    simulationParameters.addRange("alignement" ,0,10, 1.0, 0.1, aliChange);
    simulationParameters.addRange("cohesion" ,0,10, 1.0,0.1, cohChange);
    simulationParameters.addButton("add boid", function (){flock.addBoid(new Boid(random(windowWidth),random(windowHeight)))});
    simulationParameters.addButton("remove boid", function (){flock.removeBoid();});
    simulationParameters.addButton("reset flock", resetFlock );

    soundFile.volume = .6;

    //disconnect sound file and send it to output via Panner3D
    soundFile.disconnect();
    panner3d = new p5.Panner3D();
    listener3d = new p5.Listener3D();
    //listener3d.connect(panner3d);
    soundFile.connect(panner3d);
    soundFile.loop();
    
    
    

}

function draw() {
    background(0);
  
    directionalLight(180, 180, 255, -1, 1 , -1);
   
    directionalLight(180, 180, 255,  1, 1 , 1 );

    translate(0,0,cam_z_pos);

    rotateY(cam_x_rot);
    rotateX(cam_y_rot);

    drawLimits();

    push();
    flock.run();
    pop();



  
    //Position the sound in 3 dimensions
    panner3d.set( flock.boids[0].position.x, 
                    flock.boids[0].position.y, 
                    flock.boids[0].position.z);

    listener3d.position(0,0,cam_z_pos)
    //listener3d.orientX(cam_y_rot)
    //listener3d.spatializer.orientY(cam_x_rot)
  //  listener3d.spatializer.setOrientation(cam_x_rot,cam_y_rot,0)
  
}



function resetCam(){
    cam_x_rot =0
    cam_y_rot =0
    cam_z_pos =0
}

function resetFlock(){
    flock_sep = 1.5
    flock_ali = 1.0
    flock_coh = 1.0
    flock = new Flock();
    for (var i = 0; i < nb; i++) {
        var b = new Boid(1,1,-400);
        b.acceleration = createVector(random(1,10)*cos(random(TWO_PI)),random(1,10)*sin(random(TWO_PI)),0 )
        flock.addBoid(b);
    }
}

function sepChange(val){
    flock_sep = val
}

function aliChange(val){
    flock_ali = val
}

function cohChange(val){
    flock_coh = val
}

function camXChange(val){
    cam_x_rot = val
}

function camYChange(val){
    cam_y_rot = val
}

function camZChange(val){
    cam_z_pos = val
}

function drawLimits(){

  push();
    translate(-width/2,-height/2,0);
    box(5,5,5);
    translate(0,0,-800);
    box(5,5,5);
    translate(width,0,0);
    box(5,5,5);
    translate(0,0,800);
    box(5,5,5);
    pop();

    push();
    translate(-width/2,0,0);
    box(5,5,5);
    translate(0,0,-800);
    box(5,5,5);
    translate(width,0,0);
    box(5,5,5);
    translate(0,0,800);
    box(5,5,5);
    pop();

    push();
    translate(-width/2,height/2,0);
    box(5,5,5);
    translate(0,0,-800);
    box(5,5,5);
    translate(width,0,0);
    box(5,5,5);
    translate(0,0,800);
    box(5,5,5);
    pop();
}