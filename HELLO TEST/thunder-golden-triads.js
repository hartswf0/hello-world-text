/* ============================================================================
   @module GOLDEN_TRIADS
   Family-level prompt bridges from HELLO vehicle goldens to WORLD and FIELD
   BUILDER goldens. These are not compiled examples yet; they are the prompt
   context needed so WORLD and AI Builder meet HELLO at the same craft level.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GOLDEN_TRIADS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TRIADS = {
    thor: {
      family: 'NORSE',
      vehicle: { id: 'thor', name: 'MJOLNIR RUNNER', keywords: 'thor norse hammer mjolnir goat rune viking monster truck lightning' },
      world: {
        name: 'STORM HAMMER PASS',
        keywords: 'storm hammer rune pass lightning goat viking wet stone bridge thunder road',
        brief: 'A drivable storm pass with a hammer-shaped central road, rune gate pairs, wet stone ramps, goat-marker side paths, and lightning pylons that animate as visual hazards.',
        must: ['central hammer road silhouette', 'two readable driving lanes', 'rune gates', 'wet stone traction rule', 'animated lightning visuals', 'spawn-safe open court']
      },
      builder: {
        name: 'RUNE HAMMER GATE',
        keywords: 'hammer gate rune anvil shrine lightning battery mjolnir',
        brief: 'A local hammer gate: two stone uprights, cross-head lintel, cracked anvil base, rune plates, small lightning rods, and a drive-through opening.',
        must: ['drive-through clearance', 'hammer silhouette', 'rune detail', 'stone/metal contrast', 'animated glow']
      }
    },
    zeus: {
      family: 'GREEK',
      vehicle: { id: 'zeus', name: 'OLYMPUS GT', keywords: 'zeus greek olympus eagle laurel chariot bolt gold white racer' },
      world: {
        name: 'OLYMPUS SWITCHBACK',
        keywords: 'olympus greek eagle marble laurel temple sky switchback bolt gold',
        brief: 'A bright marble mountain switchback with eagle pylons, laurel checkpoint rings, temple platforms, gold bolt beacons, and long sightlines.',
        must: ['elevated temple landmark', 'switchback route', 'eagle pylons', 'marble/gold palette', 'visibility rule', 'bolt beacon animation']
      },
      builder: {
        name: 'EAGLE BOLT DAIS',
        keywords: 'eagle dais bolt laurel marble beacon olympus',
        brief: 'A local marble dais with eagle-wing side fins, laurel trim, a raised bolt spire, and a clean ramped approach.',
        must: ['ramped approach', 'eagle silhouette', 'bolt spire', 'laurel or greek trim', 'white/gold contrast']
      }
    },
    raijin: {
      family: 'JAPANESE',
      vehicle: { id: 'raijin', name: 'TAIKO ONI', keywords: 'raijin japan japanese taiko drum oni demon storm red' },
      world: {
        name: 'TAIKO STORM ALLEY',
        keywords: 'taiko drum oni red storm alley shrine thunder mask japanese',
        brief: 'A storm alley organized by drum towers and oni mask gates, with pulse-lit crossings, red lantern rows, and rhythmic hazard zones.',
        must: ['drum tower landmarks', 'oni gate silhouette', 'lantern route', 'pulse hazard rule', 'red/gold/dark palette', 'animated drum glow']
      },
      builder: {
        name: 'ONI TAIKO SIGNAL',
        keywords: 'oni taiko drum gate signal mask thunder lantern',
        brief: 'A local taiko signal monument: drum body, horned oni mask, lantern posts, thunder strips, and a protected drive-around base.',
        must: ['drum body', 'horned mask', 'lantern detail', 'drive-around footprint', 'pulse animation']
      }
    },
    tlaloc: {
      family: 'AZTEC',
      vehicle: { id: 'tlaloc', name: 'JADE RAIN', keywords: 'tlaloc aztec rain jade serpent goggles maya stone' },
      world: {
        name: 'JADE RAIN CAUSEWAY',
        keywords: 'jade rain serpent canal temple causeway wet stone mask aztec',
        brief: 'A wet jade temple causeway with serpent canals, mask fountains, slick stone lanes, rain towers, and water-blue visual flow.',
        must: ['causeway route', 'serpent canal edges', 'mask fountain landmark', 'slick traction rule', 'jade/water palette', 'rain beacon animation']
      },
      builder: {
        name: 'SERPENT RAIN ALTAR',
        keywords: 'serpent altar jade rain mask cistern fountain',
        brief: 'A local jade altar with serpent-coil sides, Tlaloc mask face, small cistern basin, rain rods, and a solid stepped base.',
        must: ['serpent sides', 'mask face', 'stepped base', 'water/jade contrast', 'visual rain drops']
      }
    },
    perun: {
      family: 'SLAVIC',
      vehicle: { id: 'perun', name: 'OAK HAMMERFALL', keywords: 'perun slavic oak axe shield eagle wood war wagon' },
      world: {
        name: 'OAK WAR RIDGE',
        keywords: 'oak axe shield ridge thunder roots slavic war grove eagle',
        brief: 'A war ridge of oak-root lanes, axe-blade gates, shield stones, split-log barricades, and thunder-root landmarks.',
        must: ['oak ridge route', 'axe gate', 'shield stone markers', 'root obstacles', 'wood/iron palette', 'impact/noise rule']
      },
      builder: {
        name: 'AXE SHIELD POST',
        keywords: 'axe shield oak post barricade thunder root',
        brief: 'A local oak watch post with crossed axe blades, shield face, root footings, iron caps, and a drive-side opening.',
        must: ['crossed axe silhouette', 'shield face', 'root base', 'wood/iron contrast', 'safe side gap']
      }
    },
    shango: {
      family: 'YORUBA',
      vehicle: { id: 'shango', name: 'OSHE DRUMLINE', keywords: 'shango yoruba oshe axe drum red storm fire dance' },
      world: {
        name: 'OSHE STORM COURT',
        keywords: 'shango oshe double axe drum red storm court fire yoruba',
        brief: 'A red storm court with double-axe lane gates, drum-circle checkpoints, fire-lit boundary stones, and percussion pulse visuals.',
        must: ['double-axe route grammar', 'drum circle landmark', 'fire boundary', 'red/white/black palette', 'pulse rule', 'clear central court']
      },
      builder: {
        name: 'DOUBLE AXE DRUM GATE',
        keywords: 'double axe drum gate oshe shango fire',
        brief: 'A local double-axe gate with paired blade silhouettes, drum base, fire caps, and a readable threshold.',
        must: ['paired axe blades', 'drum base', 'threshold opening', 'fire detail', 'rhythmic animation']
      }
    },
    indra: {
      family: 'VEDIC',
      vehicle: { id: 'indra', name: 'AIRAVATA HAULER', keywords: 'indra vedic airavata elephant vajra cloud monsoon gold' },
      world: {
        name: 'VAJRA CLOUD ROAD',
        keywords: 'indra vajra elephant cloud monsoon road gold vedic pylon',
        brief: 'A monsoon cloud road with elephant-foot pylons, vajra mast gates, rain ramps, and soft cloud visual banks around hard driving lanes.',
        must: ['vajra gate sequence', 'elephant-foot pylons', 'cloud banks as visuals', 'rain traction rule', 'gold/blue palette', 'monsoon atmosphere']
      },
      builder: {
        name: 'VAJRA ELEPHANT GATE',
        keywords: 'vajra elephant gate cloud mast monsoon',
        brief: 'A local elephant gate with four pillar legs, vajra mast, cloud plinth visuals, and a central pass-through.',
        must: ['four pillar legs', 'central opening', 'vajra mast', 'cloud plinth', 'gold/blue contrast']
      }
    },
    leigong: {
      family: 'CHINESE',
      vehicle: { id: 'leigong', name: 'THUNDER DRUM RIG', keywords: 'leigong lei gong chinese drum mallet wing beak blue thunder' },
      world: {
        name: 'THUNDER DRUM RUNWAY',
        keywords: 'leigong thunder drum runway wing bridge mallet cloud chinese',
        brief: 'A cloud runway with drum beacons, wing bridges, mallet towers, blue bolt cages, and elevated visual cloud banks.',
        must: ['runway route', 'drum beacons', 'wing bridge silhouette', 'bolt cages', 'blue/gold/dark palette', 'animated drum/bolt details']
      },
      builder: {
        name: 'WING DRUM BEACON',
        keywords: 'wing drum beacon mallet thunder leigong',
        brief: 'A local winged drum beacon with side wings, mallet posts, bolt cage detail, and a solid low base.',
        must: ['drum core', 'wing side fins', 'mallet posts', 'bolt detail', 'low stable base']
      }
    },
    thunderbird: {
      family: 'PLAINS NATIONS',
      vehicle: { id: 'thunderbird', name: 'SKY PIERCER', keywords: 'thunderbird bird totem feather wing eagle sky native plains' },
      world: {
        name: 'FEATHER STORM CANYON',
        keywords: 'thunderbird feather canyon storm perch painted mesa wing sky',
        brief: 'A painted mesa canyon with feather totems, storm perches, wing-shaped ramps, and open sky lanes around rock walls.',
        must: ['canyon route', 'feather totems', 'wing ramps', 'storm perch landmark', 'painted palette', 'wind/visibility rule']
      },
      builder: {
        name: 'FEATHER TOTEM RAMP',
        keywords: 'feather totem ramp beak perch thunderbird storm',
        brief: 'A local feather totem ramp with beak gate, painted feather panels, storm perch top, and a ramp affordance.',
        must: ['ramp affordance', 'feather panels', 'beak gate', 'perch top', 'painted color bands']
      }
    },
    ursus: {
      family: 'CREATURE',
      vehicle: { id: 'ursus', name: 'IRONHIDE URSUS', keywords: 'bear animal creature beast quadruped wolf dog fox cat lion tiger paw fur claw tail ears saddle mount ursus grizzly panda' },
      world: {
        name: 'IRONHIDE DEN PASS',
        keywords: 'bear den forest claw rock saddle camp moss branch creature',
        brief: 'A forest den pass with claw-mark rocks, fallen branch arches, moss hide zones, den-road loops, and muffled soil traction.',
        must: ['den landmark', 'fallen branch arch', 'claw rocks', 'moss hide zones', 'soft traction/noise rule', 'brown/green/stone palette']
      },
      builder: {
        name: 'CLAW DEN BARRICADE',
        keywords: 'bear den claw barricade branch moss saddle camp',
        brief: 'A local den barricade with a fallen branch beam, claw-mark stones, moss pads, small camp/saddle details, and a drive-around gap.',
        must: ['fallen branch beam', 'claw stones', 'moss pads', 'drive-around gap', 'camp detail']
      }
    }
  };

  const WORLD_PROMPT_RULES = [
    'Build an authored place, not a scatter of props.',
    'Every world needs a central landmark, route grammar, secondary details, and at least one gameplay rule.',
    'Use atoms for custom silhouettes; molecules are only shortcuts.',
    'Keep solid collision legal, but do not let collision law erase visual richness.',
    'Add visual-only detail where collision would make driving worse.'
  ];

  const BUILDER_PROMPT_RULES = [
    'Build one local focal construction, not a whole world.',
    'Every builder draft needs a base, primary silhouette, secondary details, material contrast, and one affordance.',
    'Stay inside local bounds and keep the object readable from the car camera.',
    'Use visual-only details to create craft without overfilling collision solids.',
    'Never call atmosphere from a builder draft.'
  ];

  function words(text) {
    return String(text || '').toLowerCase().match(/[a-z0-9]+/g) || [];
  }

  function scoreEntry(entry, terms) {
    const hay = [
      entry.family,
      entry.vehicle && entry.vehicle.keywords,
      entry.world && entry.world.keywords,
      entry.builder && entry.builder.keywords,
      entry.world && entry.world.brief,
      entry.builder && entry.builder.brief
    ].join(' ').toLowerCase();
    let score = 0;
    terms.forEach(w => { if (w.length > 2 && hay.indexOf(w) >= 0) score++; });
    return score;
  }

  function pick(text) {
    const terms = words(text);
    let best = 'thor', bestScore = -1;
    Object.keys(TRIADS).forEach(id => {
      const s = scoreEntry(TRIADS[id], terms);
      if (s > bestScore) { best = id; bestScore = s; }
    });
    return { id: best, score: bestScore, triad: TRIADS[best] };
  }

  function worldContext(id) {
    const t = TRIADS[id] || TRIADS.thor;
    return [
      'MATCHING GOLDEN TRIAD:',
      'Vehicle family: ' + t.vehicle.name + ' / ' + t.family,
      'World golden target: ' + t.world.name,
      'World brief: ' + t.world.brief,
      'World must include: ' + t.world.must.join('; '),
      'World prompt rules: ' + WORLD_PROMPT_RULES.join(' ')
    ].join('\n');
  }

  function builderContext(id) {
    const t = TRIADS[id] || TRIADS.thor;
    return [
      'MATCHING GOLDEN TRIAD:',
      'Vehicle family: ' + t.vehicle.name + ' / ' + t.family,
      'Builder golden target: ' + t.builder.name,
      'Builder brief: ' + t.builder.brief,
      'Builder must include: ' + t.builder.must.join('; '),
      'Builder prompt rules: ' + BUILDER_PROMPT_RULES.join(' ')
    ].join('\n');
  }

  return { TRIADS, WORLD_PROMPT_RULES, BUILDER_PROMPT_RULES, pick, worldContext, builderContext };
});
