/**
 * quote-packs.js
 * ────────────────────────────────────────────────────────
 * Themed quote packs for Type Like Sherlock.
 * Lets the user pick a theme (Sherlock, Sci-Fi, Movies)
 * before each round. Swaps quotes in difficultySettings.
 */

const QUOTE_PACKS = {
  sherlock: {
    label: '🔍 Sherlock Holmes',
    easy: [
      'The game is afoot, Watson.',
      'Watson kept his notebook close at hand.',
      'A small clue can solve a big case.',
      'Sherlock walked the quiet street with care.',
      'Every good detective needs a keen eye.'
    ],
    medium: [
      'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      'There is nothing more deceptive than an obvious fact.',
      'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
      'I never make exceptions. An exception disproves the rule.',
      'What one man can invent another can discover.'
    ],
    hard: [
      'The subtle arrangement of evidence, the quiet precision of observation, and the relentless logic of deduction are all essential to every successful case.',
      'It was not the grandeur of the mystery that fascinated him, but the disciplined, almost mathematical beauty hidden within the clues.',
      'Any prudent investigator must weigh every contradiction, every minor inconsistency, and every unexpected punctuation of fact before reaching a conclusion.',
      'To dismiss a startling detail as insignificant is a common error, though a most dangerous one when the truth depends upon the slightest discrepancy.',
      'The challenge of a complicated case lies not merely in discovering the answer, but in recognizing the pattern beneath the confusion and uncertainty.'
    ]
  },

  scifi: {
    label: '🚀 Sci-Fi',
    easy: [
      'The stars are not for man to conquer.',
      'Time is the fire in which we all burn.',
      'Fear is the mind killer, let it pass.',
      'The universe is under no obligation to make sense.',
      'Space is big, really big, vastly big.'
    ],
    medium: [
      'Any sufficiently advanced technology is indistinguishable from magic, and any technology distinguishable from magic is insufficiently advanced.',
      'He who controls the spice controls the universe, and with it the fate of every living creature.',
      'In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.',
      'The answer to the great question of life, the universe, and everything is forty-two.',
      'I have seen things you people would not believe. Attack ships on fire off the shoulder of Orion.'
    ],
    hard: [
      'It is a truth universally acknowledged that a civilization advanced enough to traverse the vast emptiness between stars must also be wise enough to recognize the fragility of consciousness.',
      'The robots learned not from their programming but from the slow accumulation of experience, each decision branching into consequences that no designer had ever anticipated or intended.',
      'Across the infinite expanse of time and space, every civilization eventually confronts the same question: whether to reach outward toward the unknown or to turn inward and perfect what already exists.',
      'She understood that the paradox of faster-than-light travel was not a matter of physics alone but of philosophy, requiring the traveler to accept that the self who departed was not the self who arrived.',
      'The last transmission from the colony ship carried not a distress signal but a single observation: that the darkness between galaxies was not empty but was listening, patiently and without judgment.'
    ]
  },

  movies: {
    label: '🎬 Movie Quotes',
    easy: [
      'Here is looking at you, kid.',
      'May the Force be with you, always.',
      'I will be back, count on it.',
      'To infinity and beyond we shall go.',
      'Life is like a box of chocolates.'
    ],
    medium: [
      'I am going to make him an offer he simply cannot refuse, no matter how hard he tries.',
      'You talking to me? There is nobody else here, so you must be talking to me right now.',
      'After all, tomorrow is another day, and with it comes new hope and new possibilities for us all.',
      'The greatest trick the devil ever pulled was convincing the entire world that he did not exist.',
      'It is not our abilities that show what we truly are; it is our choices that define who we become.'
    ],
    hard: [
      'All those moments will be lost in time, like tears in the rain, vanishing without a trace as the world moves on and no one remembers what once was so vivid and alive.',
      'The path of the righteous man is beset on all sides by the inequities of the selfish and the tyranny of evil men, blessed is he who in the name of charity shepherds the weak.',
      'You see, in this world there are two kinds of people, my friend: those with loaded guns and those who dig. You dig, and you keep digging until you find what you are looking for.',
      'Every passing minute is another chance to turn it all around, to seize the moment and transform regret into resolution, to become the person you always knew you could be.',
      'Hope is a good thing, maybe the best of things, and no good thing ever dies. It lives on in the hearts of those who carry it, passed from one generation to the next like a sacred flame.'
    ]
  }
};

(function () {
  'use strict';

  const packSelect = document.getElementById('quote-pack');
  if (!packSelect) return;

  // Restore saved preference
  const savedPack = localStorage.getItem('typingQuotePack') || 'sherlock';
  packSelect.value = savedPack;
  applyQuotePack(savedPack);

  packSelect.addEventListener('change', function () {
    const packId = this.value;
    localStorage.setItem('typingQuotePack', packId);
    applyQuotePack(packId);
  });

  function applyQuotePack(packId) {
    const pack = QUOTE_PACKS[packId];
    if (!pack || typeof difficultySettings === 'undefined') return;

    difficultySettings[0].quotes = pack.easy;
    difficultySettings[1].quotes = pack.medium;
    difficultySettings[2].quotes = pack.hard;
  }
})();
