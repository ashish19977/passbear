/**
 * PassBear word list.
 *
 * These words feed the Friendly, Memorable and Passphrase generators. They are
 * short, common, easy to read and type, and deliberately free of offensive
 * terms, brand names, and predictable/"famous password" strings.
 *
 * ── How the list size affects entropy ────────────────────────────────────────
 * Each word chosen uniformly at random contributes log2(N) bits of entropy,
 * where N is the number of words in this list. For the current list:
 *
 *     bits per word = log2(WORDS.length)
 *
 * Example: with ~400 words, each word ≈ log2(400) ≈ 8.6 bits. A 5-word
 * passphrase therefore has ≈ 43 bits from the words alone. Growing the list
 * increases entropy only logarithmically — doubling the list adds just 1 bit
 * per word — so ADDING WORDS to a passphrase is far more effective than
 * enlarging the dictionary.
 *
 * The entropy estimator reads WORDS.length directly, so the reported strength
 * always tracks the real list size.
 */
const RAW_WORDS: readonly string[] = [
  'able', 'acorn', 'active', 'adobe', 'aged', 'agile', 'air', 'alcove', 'alder',
  'almond', 'alpine', 'amber', 'amble', 'anchor', 'angle', 'apple', 'apricot',
  'april', 'apron', 'arbor', 'arch', 'arctic', 'arrow', 'ash', 'aspen', 'aster',
  'attic', 'autumn', 'awake', 'azure', 'badge', 'bagel', 'bamboo', 'banjo',
  'barley', 'basil', 'basin', 'batch', 'bay', 'beach', 'beacon', 'bean', 'bear',
  'beaver', 'bee', 'beech', 'berry', 'birch', 'bird', 'bison', 'blaze', 'bloom',
  'blossom', 'blue', 'bluff', 'boat', 'bold', 'bolt', 'bonsai', 'boulder',
  'brave', 'breeze', 'brick', 'bridge', 'bright', 'brisk', 'bronze', 'brook',
  'brush', 'bubble', 'buckle', 'bud', 'buffalo', 'bulb', 'bunny', 'burrow',
  'butter', 'cabin', 'cactus', 'calm', 'camel', 'candle', 'cane', 'canoe',
  'canyon', 'cape', 'carbon', 'cardinal', 'carrot', 'cascade', 'cedar', 'cello',
  'chalk', 'charm', 'cherry', 'chess', 'chestnut', 'chime', 'cinder', 'citrus',
  'clay', 'clever', 'cliff', 'clover', 'cloud', 'clover', 'coast', 'cobalt',
  'cocoa', 'coffee', 'comet', 'compass', 'copper', 'coral', 'cork', 'cosmic',
  'cotton', 'cove', 'coyote', 'crane', 'crater', 'cream', 'creek', 'crest',
  'crisp', 'crystal', 'cub', 'cove', 'curl', 'cyan', 'cypress', 'daisy', 'dandy',
  'dawn', 'deer', 'delta', 'denim', 'desert', 'dew', 'diamond', 'dingo', 'dive',
  'dock', 'dolphin', 'dove', 'draft', 'dragon', 'dune', 'dusk', 'eagle', 'earth',
  'east', 'echo', 'eddy', 'elder', 'elk', 'ember', 'emerald', 'engine', 'ever',
  'fable', 'falcon', 'fancy', 'fawn', 'feather', 'fern', 'ferry', 'fig', 'finch',
  'fir', 'fjord', 'flame', 'flax', 'flint', 'float', 'flora', 'flower', 'flute',
  'foam', 'foggy', 'forest', 'fossil', 'fox', 'frost', 'fruit', 'fudge', 'galaxy',
  'garden', 'garnet', 'gem', 'ginger', 'glacier', 'glade', 'glass', 'gleam',
  'glide', 'globe', 'glow', 'gold', 'grain', 'granite', 'grape', 'grass', 'gravel',
  'green', 'grove', 'guava', 'gulf', 'gull', 'halo', 'hammock', 'harbor', 'hare',
  'harvest', 'hawk', 'hazel', 'heather', 'hedge', 'heron', 'hickory', 'hill',
  'hollow', 'honey', 'horizon', 'hummus', 'husky', 'ice', 'igloo', 'indigo',
  'iris', 'island', 'ivory', 'ivy', 'jade', 'jasmine', 'jay', 'jelly', 'jet',
  'jewel', 'jolly', 'juniper', 'kayak', 'kelp', 'kettle', 'kite', 'kiwi', 'koala',
  'lagoon', 'lake', 'lamb', 'lantern', 'larch', 'lark', 'lava', 'lavender',
  'leaf', 'ledge', 'lemon', 'lentil', 'lily', 'lime', 'linen', 'lion', 'llama',
  'lobster', 'locket', 'lotus', 'lucky', 'lumber', 'lunar', 'lynx', 'magnet',
  'mango', 'maple', 'marble', 'marigold', 'marsh', 'meadow', 'melody', 'melon',
  'meteor', 'mild', 'millet', 'mint', 'mist', 'moccasin', 'mocha', 'moon', 'moor',
  'moose', 'moss', 'mountain', 'mulberry', 'mushroom', 'music', 'nectar', 'needle',
  'nest', 'nettle', 'nimbus', 'noble', 'north', 'nova', 'nugget', 'nutmeg', 'oak',
  'oasis', 'oat', 'ocean', 'olive', 'onyx', 'opal', 'orange', 'orbit', 'orca',
  'orchid', 'otter', 'owl', 'oyster', 'paddle', 'palm', 'panda', 'pansy', 'papaya',
  'parsley', 'pasta', 'peach', 'peak', 'pear', 'pearl', 'pebble', 'pecan',
  'pelican', 'pepper', 'petal', 'pewter', 'pier', 'pigeon', 'pine', 'pinto',
  'pixel', 'plain', 'plum', 'pod', 'pollen', 'pond', 'poplar', 'poppy', 'porch',
  'prairie', 'pretzel', 'primrose', 'puffin', 'pumpkin', 'quail', 'quartz',
  'quiet', 'quill', 'quince', 'rabbit', 'raccoon', 'radish', 'rain', 'rapid',
  'raven', 'reed', 'reef', 'ridge', 'ripple', 'river', 'robin', 'rock', 'rose',
  'rowan', 'ruby', 'rune', 'saffron', 'sage', 'sail', 'salmon', 'sand', 'sapling',
  'sapphire', 'satin', 'sea', 'seal', 'season', 'sedge', 'seed', 'shade', 'shale',
  'shell', 'shore', 'shrimp', 'silk', 'silver', 'sky', 'slate', 'sleet', 'slope',
  'smoke', 'snail', 'snow', 'soft', 'solar', 'sonic', 'sorrel', 'south', 'spark',
  'sparrow', 'spice', 'spinach', 'spring', 'spruce', 'sprout', 'squash', 'stable',
  'star', 'starling', 'steam', 'steel', 'steppe', 'stone', 'stork', 'storm',
  'straw', 'stream', 'summer', 'summit', 'sun', 'sunny', 'swan', 'sweet', 'swift',
  'sycamore', 'table', 'tangelo', 'tangerine', 'teak', 'teal', 'tempo', 'thistle',
  'thyme', 'tidal', 'tide', 'tiger', 'timber', 'toast', 'tomato', 'topaz',
  'torch', 'tortoise', 'trail', 'tranquil', 'trout', 'truffle', 'tulip', 'tundra',
  'turtle', 'twig', 'ultra', 'umber', 'unity', 'urban', 'valley', 'vanilla',
  'velvet', 'verbena', 'vine', 'violet', 'vista', 'volcano', 'vortex', 'walnut',
  'walrus', 'warm', 'water', 'wave', 'wheat', 'whisker', 'willow', 'wind',
  'window', 'winter', 'wisp', 'wolf', 'wombat', 'wood', 'wren', 'yam', 'yarn',
  'yeast', 'yellow', 'yew', 'yonder', 'zebra', 'zenith', 'zephyr', 'zest', 'zinc',
  'zinnia',
]

/** Deduplicated, frozen word list (guards entropy against accidental repeats). */
export const WORDS: readonly string[] = Object.freeze([...new Set(RAW_WORDS)])

/** Number of unique words available. */
export const WORD_COUNT = WORDS.length
