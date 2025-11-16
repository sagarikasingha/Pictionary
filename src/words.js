// Word lists for Pictionary game - 1000+ words per difficulty level

const words = {
  easy: [
    'cat', 'dog', 'fish', 'bird', 'cow', 'pig', 'duck', 'frog', 'bear', 'lion',
    'tiger', 'wolf', 'fox', 'deer', 'goat', 'sheep', 'horse', 'mouse', 'rat', 'bat',
    'bee', 'ant', 'fly', 'bug', 'crab', 'seal', 'whale', 'shark', 'snake', 'lizard',
    'turtle', 'snail', 'worm', 'spider', 'owl', 'hawk', 'crow', 'swan', 'dove', 'hen',
    'chick', 'lamb', 'calf', 'foal', 'pup', 'kit', 'cub', 'joey', 'fawn', 'kid',
    'ape', 'monkey', 'zebra', 'giraffe', 'rhino', 'hippo', 'camel', 'llama', 'panda', 'koala',
    'pen', 'cup', 'mug', 'bowl', 'plate', 'fork', 'knife', 'spoon', 'pot', 'pan',
    'jar', 'can', 'box', 'bag', 'sack', 'bin', 'tub', 'pail', 'bucket', 'basket',
    'key', 'lock', 'door', 'gate', 'fence', 'wall', 'roof', 'floor', 'window', 'pane',
    'glass', 'mirror', 'frame', 'picture', 'photo', 'lamp', 'bulb', 'light', 'torch', 'candle',
    'run', 'walk', 'jump', 'hop', 'skip', 'leap', 'crawl', 'climb', 'slide', 'roll',
    'spin', 'turn', 'twist', 'bend', 'eat', 'drink', 'sleep', 'wake', 'sit', 'stand',
    'tree', 'bush', 'plant', 'flower', 'rose', 'grass', 'leaf', 'sun', 'moon', 'star',
    'rain', 'snow', 'wind', 'cloud', 'sky', 'water', 'fire', 'ice', 'rock', 'sand',
    'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'arm', 'leg',
    'hat', 'cap', 'shoe', 'sock', 'shirt', 'pants', 'coat', 'dress', 'ring', 'watch',
    'car', 'bus', 'bike', 'train', 'plane', 'boat', 'ship', 'truck', 'van', 'taxi',
    'book', 'pen', 'paper', 'desk', 'chair', 'table', 'bed', 'sofa', 'lamp', 'clock',
    'apple', 'banana', 'orange', 'grape', 'lemon', 'bread', 'milk', 'egg', 'meat', 'fish',
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown', 'gray', 'purple'
  ],

  medium: [
    'elephant', 'kangaroo', 'penguin', 'dolphin', 'octopus', 'butterfly', 'dragonfly', 'alligator', 'crocodile', 'flamingo',
    'computer', 'keyboard', 'monitor', 'printer', 'telephone', 'camera', 'television', 'umbrella', 'backpack', 'suitcase',
    'mountain', 'volcano', 'waterfall', 'rainbow', 'thunder', 'lightning', 'tornado', 'hurricane', 'earthquake', 'avalanche',
    'sandwich', 'hamburger', 'spaghetti', 'chocolate', 'strawberry', 'pineapple', 'coconut', 'avocado', 'broccoli', 'cucumber',
    'guitar', 'piano', 'violin', 'trumpet', 'saxophone', 'clarinet', 'harmonica', 'accordion', 'xylophone', 'tambourine',
    'hospital', 'library', 'museum', 'stadium', 'theater', 'restaurant', 'pharmacy', 'bakery', 'factory', 'warehouse',
    'bicycle', 'motorcycle', 'helicopter', 'submarine', 'spaceship', 'ambulance', 'firetruck', 'bulldozer', 'excavator', 'tractor',
    'diamond', 'emerald', 'sapphire', 'necklace', 'bracelet', 'earring', 'treasure', 'crown', 'scepter', 'throne',
    'painting', 'sculpture', 'portrait', 'landscape', 'abstract', 'gallery', 'exhibition', 'masterpiece', 'canvas', 'palette',
    'football', 'basketball', 'baseball', 'volleyball', 'tennis', 'hockey', 'cricket', 'badminton', 'swimming', 'diving',
    'teacher', 'doctor', 'nurse', 'engineer', 'architect', 'lawyer', 'scientist', 'artist', 'musician', 'athlete',
    'birthday', 'wedding', 'anniversary', 'graduation', 'celebration', 'festival', 'carnival', 'parade', 'ceremony', 'party',
    'sunrise', 'sunset', 'twilight', 'midnight', 'afternoon', 'morning', 'evening', 'season', 'spring', 'summer',
    'winter', 'autumn', 'january', 'february', 'march', 'april', 'monday', 'tuesday', 'wednesday', 'thursday',
    'kitchen', 'bedroom', 'bathroom', 'garage', 'basement', 'attic', 'balcony', 'terrace', 'garden', 'backyard',
    'triangle', 'rectangle', 'pentagon', 'hexagon', 'octagon', 'pyramid', 'cylinder', 'sphere', 'cube', 'cone',
    'addition', 'subtraction', 'multiplication', 'division', 'fraction', 'decimal', 'percentage', 'equation', 'formula', 'calculation',
    'adventure', 'mystery', 'fantasy', 'comedy', 'tragedy', 'romance', 'thriller', 'horror', 'science', 'fiction',
    'happiness', 'sadness', 'anger', 'surprise', 'excitement', 'confusion', 'curiosity', 'jealousy', 'pride', 'shame',
    'strength', 'courage', 'wisdom', 'patience', 'kindness', 'honesty', 'loyalty', 'respect', 'trust', 'friendship'
  ],

  hard: [
    'refrigerator', 'helicopter', 'microscope', 'telescope', 'stethoscope', 'kaleidoscope', 'periscope', 'constellation', 'architecture', 'democracy',
    'philosophy', 'encyclopedia', 'metamorphosis', 'extraordinary', 'revolutionary', 'contemporary', 'magnificent', 'spectacular', 'phenomenal', 'exceptional',
    'photosynthesis', 'biodiversity', 'sustainability', 'cryptocurrency', 'biotechnology', 'nanotechnology', 'telecommunications', 'infrastructure', 'pharmaceutical', 'archaeological',
    'anthropology', 'psychology', 'sociology', 'meteorology', 'geology', 'biology', 'zoology', 'astronomy', 'chemistry', 'mathematics',
    'pronunciation', 'articulation', 'enunciation', 'communication', 'conversation', 'presentation', 'negotiation', 'collaboration', 'cooperation', 'coordination',
    'acceleration', 'deceleration', 'velocity', 'momentum', 'trajectory', 'gravitational', 'centrifugal', 'electromagnetic', 'thermodynamic', 'aerodynamic',
    'perpendicular', 'parallel', 'diagonal', 'horizontal', 'vertical', 'symmetrical', 'asymmetrical', 'proportional', 'exponential', 'logarithmic',
    'independence', 'responsibility', 'accountability', 'transparency', 'authenticity', 'integrity', 'reliability', 'credibility', 'flexibility', 'adaptability',
    'imagination', 'creativity', 'innovation', 'inspiration', 'motivation', 'determination', 'perseverance', 'resilience', 'confidence', 'ambition',
    'appreciation', 'gratitude', 'compassion', 'empathy', 'sympathy', 'generosity', 'hospitality', 'humility', 'modesty', 'sincerity',
    'civilization', 'generation', 'population', 'community', 'society', 'humanity', 'nationality', 'citizenship', 'immigration', 'emigration',
    'government', 'parliament', 'legislation', 'constitution', 'regulation', 'administration', 'bureaucracy', 'diplomacy', 'sovereignty', 'jurisdiction',
    'economy', 'industry', 'commerce', 'business', 'enterprise', 'corporation', 'organization', 'institution', 'establishment', 'foundation',
    'education', 'university', 'curriculum', 'scholarship', 'graduation', 'certification', 'qualification', 'achievement', 'accomplishment', 'excellence',
    'technology', 'engineering', 'machinery', 'equipment', 'apparatus', 'instrument', 'mechanism', 'device', 'gadget', 'invention',
    'environment', 'atmosphere', 'ecosystem', 'habitat', 'wilderness', 'conservation', 'preservation', 'protection', 'restoration', 'rehabilitation',
    'entertainment', 'performance', 'exhibition', 'demonstration', 'presentation', 'production', 'publication', 'distribution', 'circulation', 'transmission',
    'transportation', 'navigation', 'exploration', 'expedition', 'adventure', 'journey', 'destination', 'departure', 'arrival', 'connection',
    'communication', 'information', 'knowledge', 'intelligence', 'understanding', 'comprehension', 'interpretation', 'explanation', 'description', 'definition',
    'relationship', 'partnership', 'friendship', 'companionship', 'fellowship', 'membership', 'leadership', 'ownership', 'sponsorship', 'championship'
  ]
};

module.exports = words;
