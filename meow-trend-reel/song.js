// THE SONG: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// A cute lofi bed with a music-box hook; a bwomp on the refusal; wailing pizzicato begging;
// a held breath, then the sung "мя-у" drop; a heart pop on every melody note of the melt;
// a slide-whistle faint; a camera shutter and a chime for the punchline.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Sing = require('./engine/audio/sing');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), box = bus(), voice = bus(), fx = bus(), verb = bus();
const rng = U.mulberry32(7);

// ---------- 1. the ask: soft lofi + the music-box hook ----------
Genre.play('lofi', { clock, from: 0, to: 2, chordAt, buses: { drums, bass, pad, keys }, gain: 0.6 });
for (const n of sc.hook) { const x = I.musicBox(n.midi, { decay: 1.2 }); box.addMono(x, n.t, 0.32, 0.15); verb.addMono(x, n.t, 0.12); }

// ---------- 2. the refusal: a stab and a bwomp, the groove drops to bass + kick ----------
fx.addMono(I.bwomp(), ev.refuse, 0.55);
drums.addMono(I.kick({ punch: 1.2 }), ev.refuse, 0.8);
for (const b of [1, 2, 3]) drums.addMono(I.kick({ punch: 0.6 }), T(2, b), 0.35);
bass.addMono(I.bass(m('D2'), BEAT * 3.5, { bright: 0.3 }), ev.refuse, 0.5);

// ---------- 3. the begging: tiptoe pizzicato + a wailing voice that slides down ----------
Genre.play('lofi', { clock, from: 3, to: 5, chordAt, buses: { drums, bass, pad, keys }, gain: 0.7, chords: false });
drums.addMono(I.crash(2), ev.beg, 0.25);
fx.addMono(I.subBoom(0.6, 90, 45), ev.beg, 0.35);
clock.eachStep(3, 5, 8, (t, bar, step) => {
  const c = chordAt(t); const n = c.notes[step % 3];
  keys.addMono(I.pizz(n + (step % 4 === 3 ? 12 : 0)), t, 0.55, step % 2 ? 0.3 : -0.3);
});
for (const [bar, beat, midi, len] of [[3, 0, m('A5'), 1.6], [3, 2, m('G5'), 1.6], [4, 0, m('Bb5'), 1.6], [4, 2, m('A5'), 1.8]]) {
  const x = I.voice(midi, len * BEAT, { syl: 'a', type: 'alto', seed: bar * 10 + beat, vib: 0.5, glide: -4, breath: 0.25, shout: 1.1 });
  voice.addMono(x, T(bar, beat), 0.16); verb.addMono(x, T(bar, beat), 0.06);
}

// ---------- 4. plead: soft music box alone, then an 8th of held breath ----------
for (const [b, n] of [[0, 'D5'], [1, 'F5'], [2, 'Bb5'], [3, 'A5']]) { const x = I.musicBox(m(n), { decay: 1.0 }); box.addMono(x, T(5, b), 0.26); verb.addMono(x, T(5, b), 0.12); }
for (const n of ['D4', 'F4', 'Bb4']) { const { L, R } = I.padNote(m(n), BEAT * 3.4, { cutoff: 1400, attack: 0.3, release: 0.3 }); pad.addStereo(L, R, T(5), 0.07); }
fx.addMono(I.noiseSweep(BEAT * 1.5, 400, 4000, { q: 1, pink: true, shape: (x) => x * x }), T(5, 2), 0.08);

// ---------- 5. МЯУ: the drop ----------
const drop = Genre.play('lofi', { clock, from: 6, to: 9, chordAt, buses: { drums, bass, pad, keys }, gain: 1.05, fill: [8] });
drums.addMono(I.crash(4), ev.meow, 0.35);
fx.addMono(I.subBoom(0.8, 80, 38), ev.meow, 0.4);
for (const k of [0, 1, 2]) {
  const x = Sing.phrase(sc.meowSong.map((n) => ({ ...n, t: n.t - ev.meow, midi: n.midi + (k - 1) * 0.08 })), { type: 'alto', vib: 0.25, breath: 0.08, seed: 40 + k, bright: 1.2 });
  voice.addMono(x, ev.meow - x.lead + k * 0.01, k === 1 ? 0.42 : 0.16, (k - 1) * 0.4);
  verb.addMono(x, ev.meow - x.lead, 0.08);
}
for (const n of sc.meowSong) box.addMono(I.musicBox(n.midi + 12, { decay: 0.8 }), n.t, 0.18);

// ---------- 6. the melt: a heart pops on every note ----------
for (const n of sc.melt) {
  const x = I.musicBox(n.midi, { decay: 1.0 }); box.addMono(x, n.t, 0.3, (rng() - 0.5) * 0.6); verb.addMono(x, n.t, 0.12);
  fx.addMono(I.pop(1 + (n.midi - 77) / 24), n.t, 0.22, (rng() - 0.5) * 0.8);
}
// the faint: a slide whistle down and a soft thud
fx.addMono(I.whistle(BEAT * 1.4), ev.faint - BEAT * 1.5, 0.12);
fx.addMono(I.thud(70, 0.3), ev.faint, 0.7);
fx.addMono(I.boing(), ev.faint, 0.3);

// ---------- 7. the punchline: groove thins, a shutter click, a chime ----------
Genre.play('lofi', { clock, from: 9, to: 10, chordAt, buses: { drums, bass, pad, keys }, gain: 0.55 });
fx.addMono(I.tvClick(), ev.phone + BEAT * 0.5, 0.5);
fx.addMono(I.ting(m('E6')), ev.stories, 0.4);
drums.addMono(I.clap({ spread: 1.2 }), ev.stories, 0.5);
for (const n of ['F4', 'A4', 'C5', 'F5']) { const x = I.musicBox(m(n), { decay: 2.4 }); box.addMono(x, T(10), 0.25); verb.addMono(x, T(10), 0.15); }

// ---------- mix ----------
const room = reverb(verb, { room: 0.7, damp: 0.4 });
const music = [drums, bass, pad, keys, box];
for (const b of [...music, voice]) MIX.gate(b, ev.breath, ev.meow - 0.005, 0.005); // the held breath before the meow
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.faint - 0.02, ev.faint + 0.25, 0.01); // the faint lands in a gap
for (const b of [drums, bass, pad, keys, box]) for (const h of [ev.refuse, ev.stories]) MIX.gate(b, h - BEAT * 0.5, h - 0.005, 0.005); // an 8th of breath before the hits
MIX.sidechain([pad, bass], drop.kicks, { depth: 0.4, release: 0.15 });
const stems = { drums, bass, pad, keys, box, voice, fx, verb: room };
const GAIN = { drums: 0.9, bass: 0.75, pad: 1, keys: 1, box: 1.2, voice: 2.6, fx: 1.1, verb: 0.45 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.9, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
