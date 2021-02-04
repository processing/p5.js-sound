var expect = chai.expect;

describe('p5.PolySynth', function () {
  var audioContext = p5.prototype.getAudioContext();

  it('can be created and disposed', function () {
    var polySynth = new p5.PolySynth();
    polySynth.dispose();
  });

  it('keeps track of the number of voicesInUse', function () {
    var polySynth = new p5.PolySynth();
    var noteDuration = 0.01;

    var noteTriggerTime = audioContext.currentTime;
    var noteActiveTime = noteTriggerTime + noteDuration / 2;
    var noteDoneTime = noteTriggerTime + noteDuration;

    expect(polySynth._voicesInUse.getValueAtTime(noteTriggerTime)).to.equal(0);

    polySynth.play('A2', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(noteActiveTime)).to.equal(1);
    polySynth.play('A3', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(noteActiveTime)).to.equal(2);
    polySynth.play('A4', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(noteActiveTime)).to.equal(3);

    expect(polySynth._voicesInUse.getValueAtTime(noteDoneTime)).to.equal(0);

    polySynth.dispose();
  });
});
