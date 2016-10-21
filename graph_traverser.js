/* TODO
- add a "go" button next to the textbox... actually start/stop
- layout..thinking just textbox, go, then output? or maybe output on top?
- pretty cool if could trigger transitions after a certain number of traversals
  to create, for example, a "warmup" phase
- how to have links to multiple configurations? just...links?
- add instructions
- switch 'go' to 'stop' when clicked
- should display graph! would be cool, and great for debugging. cool if updates
  as soon as user makes a change... could do with ascii if can't find good lib
  maybe https://www.graphdracula.net/?
- is it possible to input number in scientific notation? they're strings...
- 0 probability edges shouldn't be taken! just have exits of warmups
  be low probability

Traverser needs text to speech...maybe
Also in instructions recommend drawing out the graph before inputting it
See what other things had in notes
*/

class Edge {
  constructor(weight, repetitions) {
    this.weight = weight;
    this.repetitions = repetitions;  // infinite if undefined
  }
}

class Node {
  constructor(id, description, duration) {
    this.id = id;
    this.description = description;
    this.duration = duration;  // in seconds

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
        this.probability_sum += this.successors[key];
      }
    }

    var target_range = Math.random() * this.probability_sum;
    var accumulation = 0;
    for (var key in this.successors) {
      accumulation += this.successors[key];
      if (accumulation >= target_range) {
        return key;
      }
    }
  }
}

function trim(s) {
  return (s || '').replace(/^\s+|\s+$/g, '');
}

function nodeFromDescription(node_description) {
  // just assume | is the separator?
  // just make this the ctr of Node!

  var node_id = node_description.substr(0, node_description.indexOf(' '));
  var node_attrs =
      node_description.substr(node_description.indexOf(' ') + 1).split('|');

  console.assert(node_attrs.length == 2, 'Improper node descriptors?',
                 node_attrs);

  var description = trim(node_attrs[0]);
  var duration = Number(trim(node_attrs[1]));
  if (isNaN(duration)) {
    console.log('Warning: duration', node_attrs[1], 'could not be',
                'parsed into a number. Using 10 second default.');
    duration = 10;
  }

  return new Node(node_id, description, duration);
}

// Extract nodes and edges from trivial graph format description. Returns a map
// from string node names to Node object for that node.
function parseTrivialGraphFormat(graph_description) {
  var graph_description = graph_description.split('\n');
  var graph = {};

  // Parse node descriptions.
  for (var i = 0; i < graph_description.length; ++i) {
    // If we've reached the edge section, break.
    if (graph_description[i] == '#') {
      ++i;
      break;
    }

    let node = nodeFromDescription(graph_description[i]);
    graph[node.id] = node;
  }

  // Parse edge descriptions.
  // MOVE THIS INTO EDGE CTR!!
  for (; i < graph_description.length; ++i) {
    let edge = graph_description[i].split(' ');
    // console.assert(edge.length == 3, 'Malformed edge?:', edge);
    let from = trim(edge[0]);
    let to = trim(edge[1]);  // is trim ever necessary? what if many spaces?
    let weight = Number(trim(edge[2]));
    let repetition;
    if (edge[3]) {
      let repetition = Number(trim(edge[3]));
    }
    if (isNaN(weight)) {
      console.log('Warning: weight', edge[2], 'could not be',
                  'parsed into a number. Using 0 as default.');
      weight = 0;
    }

    graph[from].successors[to] = weight;
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
