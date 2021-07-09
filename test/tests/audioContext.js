let { getAudioContext } = p5.prototype;
let { expect } = chai;
describe('Audiocontext', function () {
  it('is Running ', async function () {
    let audioContext = await getAudioContext();
    expect(audioContext.state).to.equal('running');
  });
  it('can be suspended', async function () {
    let audioContext = await getAudioContext();
    await audioContext.suspend();
    expect(audioContext.state).to.equal('suspended');
  });
  it('can be resumed after being suspended', async function () {
    let audioContext = await getAudioContext();
    await audioContext.suspend();
    expect(audioContext.state).to.equal('suspended');
    await audioContext.resume();
    expect(audioContext.state).to.equal('running');
  });
});
