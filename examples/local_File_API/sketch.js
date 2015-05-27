//P5 drawing stuff
var CurrentSounds = [];
function setup(){
  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    // The File API isn't supported in this browser 
    alert('File API not supported');
  }
  createCanvas(500,100);

  //Event listeners for the file selection elements
  document.getElementById('menuFiles').addEventListener('change',menuHandler,false);
  document.getElementById('dndSelect').addEventListener('drop',dndDropHandler,false);
  document.getElementById('dndSelect').addEventListener('dragover',dndDragHandler,false);
}
function draw(){
  background(240);
  for(i =0; i<CurrentSounds.length; i++){
    if(CurrentSounds[i].isPlaying()){
      fill(0,255,0);
    }
    else{
      fill(255,0,0);
    }
    rect(77*i,12.5,75,75);
  }
}
function mousePressed(){
  for(var i=0;i<CurrentSounds.length;i++){
    if(mouseX > 77*i && mouseX < (77*i)+75 && mouseY > 12.5 && mouseY < 87.5){
      if(CurrentSounds[i].isLoaded()){
        if(CurrentSounds[i].isPlaying()){
          CurrentSounds[i].stop();
        }
        else{
          CurrentSounds[i].play();
        }
        break;
      }
    }
  }
}
// File API event handlers
function fileHandler(fileList){
  for(var i=0,currentFile; currentFile = fileList[i]; i++){
    var newSF = new p5.SoundFile(currentFile);
    CurrentSounds.push(newSF);
  }
}
//for the menu only
function menuHandler(evt){
  fileHandler(evt.target.files);
}
//for the drag and drop
function dndDropHandler(evt){
  evt.stopPropagation();
  evt.preventDefault();
  fileHandler(evt.dataTransfer.files);
}
function dndDragHandler(evt){
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy';
}
