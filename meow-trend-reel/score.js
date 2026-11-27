// МЯУ-ТРЕНД (9:16, ~21s): an original couple mini-comic. Liya begs Ars to do the "kitty meow" trend,
// he refuses, she begs on her knees, he gives in (cat ears, paws, "...мяу"), she melts into hearts,
// and the punchline: she filmed it and it is already in her stories.
// A comic escalation at 120 BPM: every cut is on a bar line, every heart pops on a melody note.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords, placeBar } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 120, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(10) + 1.4;

  const ev = {
    ask: T(0), refuse: T(2), beg: T(3), plead: T(5), breath: T(5, 3.5), meow: T(6), meow2: T(6, 2),
    melt: T(7), faint: T(8, 2), phone: T(9), stories: T(9, 2), end: T(10),
  };
  const S = { ask: [0, T(2)], refuse: [T(2), T(3)], beg: [T(3), T(5)], plead: [T(5), T(6)], meow: [T(6), T(7)], melt: [T(7), T(9)], phone: [T(9), DURATION] };

  const { chords, chordAt } = makeChords(clock, {
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G2' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  }, [
    [0, 0, 4, 'F'], [1, 0, 4, 'Bb'], [2, 0, 4, 'Dm'], [3, 0, 4, 'Gm'], [4, 0, 4, 'A'], [5, 0, 4, 'Bb'],
    [6, 0, 4, 'F'], [7, 0, 4, 'Bb'], [8, 0, 4, 'C'], [9, 0, 4, 'F'],
  ]);

  // the music-box hook (8ths: [note, start8th, len8ths])
  const hook = [
    ...placeBar(clock, [['C5', 0, 1], ['F5', 1, 1], ['A5', 2, 2], ['G5', 4, 1], ['F5', 5, 1], ['D5', 6, 2]], 0),
    ...placeBar(clock, [['Bb4', 0, 1], ['D5', 1, 1], ['F5', 2, 2], ['E5', 4, 1], ['D5', 5, 1], ['C5', 6, 2]], 1),
  ];
  // the melt: one heart pops per note
  const melt = [
    ...placeBar(clock, [['A5', 0, 1], ['C6', 1, 1], ['F6', 2, 1], ['E6', 3, 1], ['D6', 4, 1], ['C6', 5, 1], ['A5', 6, 1], ['F5', 7, 1]], 7),
    ...placeBar(clock, [['G5', 0, 1], ['Bb5', 1, 1], ['E6', 2, 1], ['D6', 3, 1], ['C6', 4, 2]], 8),
  ];
  // "мя-у" sung on the drop, twice
  const meowSong = [
    { t: ev.meow, dur: BEAT * 0.5, midi: m('C5'), syl: 'mya' }, { t: ev.meow + BEAT * 0.5, dur: BEAT * 1.2, midi: m('F5'), syl: 'u' },
    { t: ev.meow2, dur: BEAT * 0.5, midi: m('D5'), syl: 'mya' }, { t: ev.meow2 + BEAT * 0.5, dur: BEAT * 1.4, midi: m('A5'), syl: 'u' },
  ];

  // the dialogue (captions, like a comic)
  const lines = [
    { t: T(0, 0.5), end: T(2), who: 'Она', text: 'Зай, а сделаешь со мной\nтренд «котик-мяу»?..' },
    { t: T(2), end: T(3), who: 'Он', text: 'Чего? Нет.\nНи за что.' },
    { t: T(3), end: T(5), who: 'Она', text: 'НУ ПОЖАЛУЙСТААА!!!\nОДИН РАЗИИИК!!! УМОЛЯЮЮЮ!!!' },
    { t: T(5, 0.5), end: T(6), who: 'Он', text: '...ладно. Только один раз.' },
    { t: T(6), end: T(7), who: 'Он', text: '...мяу. Довольна?' },
    { t: T(9), end: T(9, 2), who: 'Он', text: 'Только никому\nне показывай.' },
    { t: T(9, 2), end: DURATION, who: 'Она', text: 'Уже в сторис ♥' },
  ];

  const markers = {
    refuse: { t: ev.refuse, sync: 'av' }, // the whip cut + a bwomp
    beg: { t: ev.beg, sync: 'av' },
    meow: { t: ev.meow, sync: 'av' }, // the reveal after a held breath
    melt: { t: ev.melt, sync: 'av' },
    faint: { t: ev.faint, sync: 'av' },
    stories: { t: ev.stories, sync: 'av' },
    plead: ev.plead, end: ev.end,
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, hook, melt, meowSong, lines, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
