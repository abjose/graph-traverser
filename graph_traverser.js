/*
TODO
- should display graph! would be cool, and great for debugging. cool if updates
  as soon as user makes a change... could do with ascii if can't find good lib
  maybe https://www.graphdracula.net/?
- add links to multiple configurations
- switch 'start' to 'stop' when clicked
- text to speech?
- See what other things had in notes

BUGS
- if press go multiple times, then starts running multiple times
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

  // Strip comments.
  graph_description =
      graph_description.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
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
    return graph[start];
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
  } else {
    // cancel?
    // display 'done' or 'end'?
  }
}

function cancel() {
  node = undefined;
  graph = undefined;
  // ???
}

tutorial_example =
    '';

yoga_example =
    'something';

meditation_example =
    'something';

bodyweigth_exercise_example =
    'something';
