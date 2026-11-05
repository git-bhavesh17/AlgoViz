let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network;
let graphData = {};
let nodeCount = 0;

function initNetwork() {
  let container = document.getElementById("network");
  network = new vis.Network(container, {nodes, edges}, {physics: true});
}
initNetwork();

function addNode() {
  nodeCount++;
  nodes.add({id: nodeCount, label: `Node ${nodeCount}`});
  graphData[nodeCount] = [];
}

function addEdge() {
  let from = prompt("Enter source node ID:");
  let to = prompt("Enter target node ID:");
  let cost = prompt("Enter edge cost:");
  edges.add({from: parseInt(from), to: parseInt(to), label: cost});
  if (!graphData[from]) graphData[from] = [];
  graphData[from].push([parseInt(to), parseInt(cost)]);
}

function resetGraph() {
  nodes.clear();
  edges.clear();
  graphData = {};
  nodeCount = 0;
  document.getElementById("explanation").innerHTML = "";
}

function generateRandomGraph() {
  resetGraph();
  let numNodes = prompt("Enter number of nodes:", 6);
  let numEdges = prompt("Enter number of edges:", 8);

  for (let i = 1; i <= numNodes; i++) {
    nodes.add({id: i, label: `Node ${i}`});
    graphData[i] = [];
  }

  for (let e = 0; e < numEdges; e++) {
    let from = Math.floor(Math.random() * numNodes) + 1;
    let to = Math.floor(Math.random() * numNodes) + 1;
    if (from !== to) {
      let cost = Math.floor(Math.random() * 9) + 1;
      edges.add({from, to, label: cost.toString()});
      graphData[from].push([to, cost]);
    }
  }
}

function getAlgorithmDescription(algo) {
  switch(algo) {
    case "bfs":
      return "Breadth-First Search explores nodes level by level using a queue. It guarantees the shortest path in an unweighted graph.";
    case "dfs":
      return "Depth-First Search dives deep into one branch before backtracking. It uses a stack and is good for exploring all paths.";
    case "astar":
      return "A* Search combines actual cost (g) and heuristic estimate (h) to find the shortest path efficiently. It uses f = g + h.";
    default:
      return "";
  }
}

async function runSimulation() {
  const algo = document.getElementById("algoSelect").value;
  const start = prompt("Enter start node ID:");
  const goal = prompt("Enter goal node ID:");

  const response = await fetch("/run_algorithm", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({algorithm: algo, graph: graphData, start, goal})
  });
  const result = await response.json();
  const path = result.path;
  const steps = result.steps;

  let explanationBox = document.getElementById("explanation");
  explanationBox.innerHTML = `<h3>${algo.toUpperCase()}</h3><p>${getAlgorithmDescription(algo)}</p>`;

  let i = 0;
  let interval = setInterval(() => {
    if (i < steps.length) {
      let step = steps[i];
      nodes.update({id: step.current, color: {background: "lightblue"}});
      explanationBox.innerHTML += `<p>Exploring Node ${step.current}</p>`;
      if (step.g !== undefined) {
        explanationBox.innerHTML += `<p>g=${step.g}, h=${step.h}, f=${step.f}</p>`;
      }
      if (step.queue) {
        explanationBox.innerHTML += `<p>Queue: [${step.queue.join(", ")}]</p>`;
      }
      if (step.stack) {
        explanationBox.innerHTML += `<p>Stack: [${step.stack.join(", ")}]</p>`;
      }
      i++;
    } else {
      clearInterval(interval);
      path.forEach(n => nodes.update({id: n, color: {background: "green"}}));
      explanationBox.innerHTML += `<p>Final Path: ${path.join(" → ")}</p>`;
    }
  }, 1000);
}
