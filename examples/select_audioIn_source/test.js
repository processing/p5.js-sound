var audioGrab, audioSources;

var fft = [];
var audioGrabArray = [];

function setup() {
    createCanvas(512, 400);

    audioGrab = new p5.AudioIn();
    audioGrab.getSources(function(sourceList) {
        //set the source to the first item in the inputSources array
        audioGrab.setSource(0);
        audioGrab.start();
        console.log(sourceList);
        audioSources = sourceList;

        for (var i = 0; i < sourceList.length; i++) {
            audioGrabArray[i] = new p5.AudioIn();
            audioGrabArray[i].setSource(i);
            audioGrabArray[i].start();

            fft[i] = new p5.FFT();
            fft[i].setInput(audioGrabArray[i]);
            //this will print the array of sources
        }
    });
}

function draw() {
    background(200);

    numSources = audioSources.length;
    for (var i = 0; i < numSources; i++) {
        var spectrum = fft[i].analyze();
        stroke();
        line(0, ((i + 1) / numSources) * height, width, ((i + 1) / numSources) * height);
        beginShape();
        vertex(0, ((i + 1) / numSources) * height);

        noStroke();
        fill(0, 255, 255);
        for (j = 0; j < spectrum.length; j++) {
            vertex(j, map(spectrum[j], 0, 1023, ((i + 1) / numSources) * height, 0));
        }
        endShape();
    }
}
