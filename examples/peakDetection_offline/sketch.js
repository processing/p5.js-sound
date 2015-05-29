// Beat Detection with offline context
// port of this code : http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
// and this one too : https://github.com/JMPerez/beats-audio-api


var file ='../_files/Tripping.mp3'

var source_file; // sound file
var src_length; // hold its duration

var pg_beats; // to draw the beat detection on preprocessed song
var pg_tempo; // draw our guessed tempi

function preload(){
    source_file = loadSound(file); // preload the sound
   // clave = loadSound('cl.wav');
}


function setup() {
  createCanvas(windowWidth, 150);
  textAlign(CENTER);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  println("source duration: " +src_length);

   // prepare our tempo display
   pg_tempo = createGraphics(width,100);
   pg_tempo.background(180);
   pg_tempo.strokeWeight(3);
   pg_tempo.noFill();
   pg_tempo.stroke(255);
   pg_tempo.rect(0,0,width,100);
   pg_tempo.strokeWeight(1);
   //prepare our beats graph display
   pg_beats = createGraphics(width,50);
   pg_beats.background(180);
   pg_beats.strokeWeight(3);
   pg_beats.noFill();
   pg_beats.stroke(255);
   pg_beats.rect(0,0,width,50);
   pg_beats.strokeWeight(1);

   // find beat preprocessing the source file with lowpass
   preprocess(); // it will draw in pg_beats and pg_tempo
}

function draw() {
	background(225);

	image(pg_tempo,0,0); // display detected tempi
	image(pg_beats,0,100); // display filtered beats we found preprocesing with a lp filter
}

function drawPeaksAtTreshold(data, threshold) {
  for(var i = 0; i <  data.length;) {	
    if (data[i] > threshold) {
      var xpos = map(i,0,data.length,0,width);
      var intensity = map(data[i],threshold,0.3,0,255);
      var hei = map(data[i],threshold,0.3,3,50);
      pg_beats.stroke(intensity,0,0);
	  pg_beats.line(xpos,3,xpos,47);
	  // Skip forward ~ 1/8s to get past this peak.
      i += 6000; 
    }
    i++;
  }
}

// Function to identify peaks
function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/8s to get past this peak.
      i += 6000; 
    }
    i++;
  }
  return peaksArray;
}

// Function used to return a histogram of peak intervals
function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      // store with JSson like formatting
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

// Function used to return a histogram of tempo candidates.
function groupNeighborsByTempo(intervalCounts, sampleRate) {
  var tempoCounts = [];
  intervalCounts.forEach(function(intervalCount, i) {
    if (intervalCount.interval !== 0) {
      // Convert an interval to tempo
      var theoreticalTempo = 60 / (intervalCount.interval / sampleRate );
      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) theoreticalTempo *= 2;
      while (theoreticalTempo > 180) theoreticalTempo /= 2;
      theoreticalTempo = Math.round(theoreticalTempo);
      var foundTempo = tempoCounts.some(function(tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return tempoCount.count += intervalCount.count;
      });
      // store with Json like formating
      if (!foundTempo) {
        tempoCounts.push({
          tempo: theoreticalTempo,
          count: intervalCount.count
        });
      }
    }
  });
  return tempoCounts;
}


function preprocess(){
	// Create offline context
	var offlineContext = new OfflineAudioContext(1, source_file.buffer.length, source_file.buffer.sampleRate);
	// Create buffer source
	var source = offlineContext.createBufferSource();
	source.buffer = source_file.buffer; // copy from source file
	// Create filter
	var filter = offlineContext.createBiquadFilter();
	filter.type = "lowpass";
	source.connect(filter);
	filter.connect(offlineContext.destination);
	// start playing at time:0
	source.start(0);	
	offlineContext.startRendering(); // Render the song

	// Act on the result
	offlineContext.oncomplete = function(e) {
		// Filtered buffer!
  		var filteredBuffer = e.renderedBuffer;
  		var lowpeaks = drawPeaksAtTreshold(e.renderedBuffer.getChannelData(0), 0.25); // store and draw peaks

  		// get tempo on a subset of the sample
  		var peaks,
                initialThresold = 0.9,
                thresold = initialThresold,
                minThresold = 0.22,
                minPeaks = 200;

            do {
              peaks = getPeaksAtThreshold(e.renderedBuffer.getChannelData(0), thresold);
              thresold -= 0.005;
            } while (peaks.length < minPeaks && thresold >= minThresold);
         // find and group intervals
         var intervals = countIntervalsBetweenNearbyPeaks(peaks);
         var groups = groupNeighborsByTempo(intervals, filteredBuffer.sampleRate);
         // sort top intervals
         var top = groups.sort(function(intA, intB) {
              return intB.count - intA.count;
            }).splice(0,5);
         // dsplay them
         for (var i = 0 ; i < top.length; i++){
         	pg_tempo.noStroke();
         	pg_tempo.fill(0);
         	pg_tempo.textSize(12);
         	pg_tempo.text("Tempo n"+i+" : " + int(top[i].tempo) + "bpm  /  found " +top[i].count +" times.",5,15+i*18);
         }
	};
}