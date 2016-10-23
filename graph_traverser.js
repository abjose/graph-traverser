/*
TODO
- should have pictures, great for yoga
- text to speech?
- should add beeps or something during transitions
- cool if visually displayed the graph. https://www.graphdracula.net/?
*/

class Edge {
  constructor(edge_description) {
    let edge = edge_description.split(' ');
    this.weight = Number(trim(edge[2]));
    if (isNaN(this.weight)) {
      console.log('Warning: weight', edge[2], 'could not be',
                  'parsed into a number. Using 0 as default.');
      this.weight = 0;
    }

    // undefined repetitions => infinite repetitions
    if (edge[3]) {
      this.repetitions = Number(trim(edge[3]));
    }
  }

  traverse() {
    if (this.repetitions != undefined) {
      --this.repetitions;
    }
  }
}

class Node {
  constructor(node_description) {
    this.id = node_description.substr(0, node_description.indexOf(' '));

    var node_attrs =
        node_description.substr(node_description.indexOf(' ') + 1).split('|');
    console.assert(node_attrs.length == 2, 'Improper node descriptors?',
                   node_attrs);

    this.description = trim(node_attrs[0]);
    this.duration = Number(trim(node_attrs[1]));
    if (isNaN(this.duration)) {
      console.log('Warning: duration', node_attrs[1], 'could not be',
                  'parsed into a number. Using 10 second default.');
      this.duration = 10;
    }

    // Map from successor node name to Edge object.
    this.successors = {};
  }

  // Display the node's description in the output area.
  display() {
    console.log(this.description);
    document.getElementById('display').innerHTML = this.description;
  }

  // Choose a successor based on transition probabilities. Returns undefined if
  // no possible successors.
  getSuccessorId() {
    if (this.probability_sum == undefined) {
      this.probability_sum = 0;
      for (var key in this.successors) {
        this.probability_sum += this.successors[key].weight;
      }
    }

    var target_range = Math.random() * this.probability_sum;
    var accumulation = 0;
    for (var key in this.successors) {
      accumulation += this.successors[key].weight;
      if (accumulation >= target_range) {
        if (this.successors[key].repetitions == undefined ||
            this.successors[key].repetitions > 0) {
          this.successors[key].traverse();
          return key;
        }
      }
    }
  }
}

function trim(s) {
  return (s || '').replace(/^\s+|\s+$/g, '');
}

// Extract nodes and edges from trivial graph format description. Returns a map
// from string node names to Node object for that node.
function parseTrivialGraphFormat(graph_description) {
  var graph = {};

  // Strip comments and blank newlines.
  graph_description =
      graph_description.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
  graph_description = graph_description.replace(/^\s*[\r\n]/gm, '');
  console.log(graph_description);
  // Split by newline.
  var graph_description = graph_description.split('\n');

  // Parse node descriptions.
  for (var i = 0; i < graph_description.length; ++i) {
    // If we've reached the edge section, break.
    if (graph_description[i] == '#') {
      ++i;
      break;
    }

    let node = new Node(graph_description[i]);
    graph[node.id] = node;
  }

  // Parse edge descriptions.
  for (; i < graph_description.length; ++i) {
    let edge = graph_description[i].split(' ');
    console.assert(edge.length >= 3, 'Malformed edge?:', edge);
    let from = trim(edge[0]);
    let to = trim(edge[1]);  // is trim ever necessary? what if many spaces?
    graph[from].successors[to] = new Edge(graph_description[i]);
  }

  return graph;
}

function getRandomStartingNode(graph) {
  var keys = Object.keys(graph);
  return graph[keys[Math.floor(keys.length * Math.random())]];
}

// If the graph contains a node named "start", start there. Otherwise start
// somewhere random.
function getStartingNode(graph) {
  if ('start' in graph) {
    return graph['start'];
  }
  return getRandomStartingNode(graph);
}

// Returns a possible next Node given the graph and current node. Respects
// transition probabilities.
function getNextNode(current_node_name, graph) {
  // For now, object consists of state name and time to spend in that state.
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Track node state globally to simplify sleeping.
var node, graph;
var running = false;

function startIfNotRunning() {
  if (running) {
    console.log('Already running.');
  } else {
    running = true;
    stepGraph();
  }
}

function stepGraph() {
  if (!node || !graph) {
    // Initialize graph and node if necessary.
    let graph_description = document.getElementById('graph_description');
    graph = parseTrivialGraphFormat(graph_description.value);
    node = getStartingNode(graph);
  } else {
    // Otherwise, step to next reasonable node.
    node = graph[node.getSuccessorId()];
  }

  if (node) {
    // If there's a node to show, Display and sleep.
    node.display();
    sleep(node.duration * 1000).then(() => { stepGraph(); });
  }
}

function setText(description) {
  document.getElementById('graph_description').value = description;
}
window.onload = function() { setText(tutorial_example); }

tutorial_example =
    '// First, the nodes:\n' +
    '// node_id node description | duration_in_seconds\n' +
    '1 first node, 5 second duration | 5\n' +
    '2 another node with a shorter duration | 1\n' +
    '// Optionally, add a node with node_id "start";\n' +
    '// it\'ll be the starting node.\n' +
    'start This will be the starting node | 3\n' +
    '#\n' +
    '// Now, the edges:\n' +
    '// from_node_id to_node_id weight repetitions\n' +
    'start 1 1\n' +
    '1 2 1\n' +
    '2 start 0.5 1 // will be taken at most once\n' +
    '2 1 0.5 // if repetitions unspecified, no limit\n' +
    '// Edge weights don\'t need to sum to 1;\n' +
    '// the code normalizes them for you.';

yoga_example =
    '// Right now this just guides you through a sun salutation\n' +
    '// But check out this cool repo:\n' +
    '// https://github.com/bhpayne/yoga_graph\n\n' +
    'start Mountain (stand straight) | 10\n' +
    'extended_mountain Hands overhead, bending back | 10\n' +
    'standing_bend Bend at the waist | 10\n' +
    'left_lunge Lunge with left foot forward | 10\n' +
    'plank Plank | 10\n' +
    'chaturanga Chaturanga | 10\n' +
    'up_dog Upward dog | 10\n' +
    'down_dog Downward dog | 10\n' +
    'right_lunge Lunge with right foot forward | 10\n\n' +
    'standing_bend2 Bend at the waist | 10\n' +
    'extended_mountain2 Hands overhead, bending back | 10\n' +
    '#\n\n' +
    '// No branching, just a sun salutation.\n' +
    'start extended_mountain 1\n' +
    'extended_mountain standing_bend 1\n' +
    'standing_bend left_lunge 1\n' +
    'left_lunge plank 1\n' +
    'plank chaturanga 1\n' +
    'chaturanga up_dog 1\n' +
    'up_dog down_dog 1\n' +
    'down_dog right_lunge 1\n' +
    'right_lunge standing_bend2 1\n' +
    'standing_bend2 extended_mountain2 1\n' +
    'extended_mountain2 start 1';

meditation_example =
    'todo';

exercise_example =
    '// This is a "stochastic tabata" workout, which cycles\n' +
    '// through various 20-seconds-on, 10-seconds-off movements.\n' +
    '// It includes a minute-long warmup at the beginning.\n\n' +
    '// Warmup\n' +
    '// Ok, I\'m being lazy here...\n' +
    'start Warm up for a minute! | 60\n\n' +
    '// Nodes for tabata:\n' +
    'rest Rest 10 seconds | 10\n' +
    'mtn_climbers Mountain climbers! | 20\n' +
    'v_ups V-ups! | 20\n' +
    'plank Plank! | 20\n' +
    'push_up Push-ups! | 20\n' +
    'burpess Burpees! | 20\n' +
    'air_squats Air squats! | 20\n' +
    'jump_lunges Jumping lunges! | 20\n' +
    'superman Superman! | 20\n\n' +
    '#\n\n' +
    '// Transition out of warmup.\n' +
    '// Could use "repetitions" to make a real one-time warmup.\n' +
    'start rest 1\n\n' +
    '// Edges for tabata:\n' +
    '// Transitions from exercise to rest.\n' +
    'mtn_climbers rest 1\n' +
    'v_ups rest 1\n' +
    'plank rest 1 \n' +
    'push_up rest 1\n' +
    'burpess rest 1\n' +
    'air_squats rest 1\n' +
    'jump_lunges rest 1\n' +
    'superman rest 1\n' +
    '// Transitions from rest to exercise.\n' +
    '// Remember that edges don\'t have to sum to 1...\n' +
    'rest mtn_climbers 1\n' +
    'rest v_ups 1\n' +
    'rest plank 1 \n' +
    'rest push_up 1\n' +
    'rest burpess 1\n' +
    'rest air_squats 1\n' +
    'rest jump_lunges 1\n' +
    'rest superman 1';
