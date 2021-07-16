const expect = chai.expect;

describe('p5.PolySynth', function () {
  const audioContext = p5.prototype.getAudioContext();

  it('can be created and disposed', function () {
    const polySynth = new p5.PolySynth();
    polySynth.dispose();
  });

  it('keeps track of the number of voicesInUse', function () {
    const polySynth = new p5.PolySynth();
    const noteDuration = 0.01;

    const getTriggerTime = () => audioContext.currentTime;
    const getActiveTime = () => getTriggerTime() + noteDuration / 2;
    const getDoneTime = () => getTriggerTime() + noteDuration;

    expect(polySynth._voicesInUse.getValueAtTime(getTriggerTime())).to.equal(0);

    polySynth.play('A2', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(1);
    polySynth.play('A3', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(2);
    polySynth.play('A4', 0, 0, noteDuration);
    expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(3);

    expect(polySynth._voicesInUse.getValueAtTime(getDoneTime())).to.equal(0);

    polySynth.dispose();
  });
});
