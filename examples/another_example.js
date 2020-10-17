const Graph = require("../Graph/Graph");

const graph = new Graph({
  autoCreateNodes: true,
  loggingLevel: 0,
  constantNodesCost: 100,
});

//Say A is a toll = 500.
graph.addNode({ name: "C", cost: 500 });

//Since autoCreateNodes is true, A,B,D nodes will be autoCreated with cost = constantNodesCost (100).
graph.addRoute("A", "B", 2);
graph.addRoute("A", "C", 1);
graph.addRoute("B", "C", 2);
graph.addRoute("C", "D", 1);
graph.addRoute("B", "D", 200);

graph.findPathDijkstra("A", "D"); // output: => { distance: 502, path: ['A', 'B', 'D']}
graph.findMatrixFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]

const dijkstra = graph.findPathDijkstra("A", "D"); // output: => { distance: 2, path: ['A', 'C', 'D']}
console.log(dijkstra);
const floyd_warshall = graph.findMatrixFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]
console.table(floyd_warshall[0]);
console.table(floyd_warshall[1]);
