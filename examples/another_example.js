const Graph = require("../Graph/Graph");

const graph = new Graph({
  autoCreateNodes: true,
  loggingLevel: 0,
  constantNodesCost: 100,
  ignoreErrors: false,
});

//Say C has a toll of 500.
graph.addNode({ name: "C", cost: 500 });

//Since autoCreateNodes is true, A,B,D nodes will be autoCreated with cost = constantNodesCost (100).
graph
  .addRoute("A", "B", 2)
  .addRoute("A", "C", 1)
  .addRoute("B", "C", 2)
  .addRoute("C", "D", 1)
  .addRoute("B", "D", 200);

let dijkstra = graph.findPathDijkstra("A", "D"); // output: => { cost: 502, path: ['A', 'B', 'D']}
console.log(dijkstra);
let floyd_warshall = graph.findMatricesFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]
console.table(floyd_warshall[0]);
console.table(floyd_warshall[1]);

graph.editNode("C", null, 1);

dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 203, path: ['A', 'C', 'D']}

graph.editNode("C", "F", 100);

dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 302, path: ['A', 'F', 'D']}

graph.editNode("F", "H", null); //Change node name F -> H

dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 302, path: ['A', 'H', 'D']}

graph.editRoute("A", "H", 1000);

dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 405, path: ['A', 'B', 'H', 'D']}

graph.deleteNode("B");
dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 1301, path: ['A', 'H', 'D']}

graph.addRoute("A", "B", 1);
graph.addRoute("B", "D", 1);
dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost: 302, path: ['A', 'B', 'D']}

graph.avoidRoute("A", "B");
dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost:1301, path: ['A', 'H', 'D']}

graph.addRoute("A", "D", 1000);
graph.avoidNode("H");
dijkstra = graph.findPathDijkstra("A", "D");
console.log(dijkstra); // output: => { cost:1200, path: ['A', 'D']}