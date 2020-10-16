const Graph = require("../Graph/Graph");

const graph = new Graph();

graph.addNode("A")
graph.addNode("B")
graph.addNode("C")
graph.addNode("D");

graph.addRoute("A", "B", 2);
graph.addRoute("A", "C", 1);
graph.addRoute("B", "C", 2);
graph.addRoute("C", "D", 1);

const dijkstra = graph.findPathDijkstra("A", "D"); // output: => { distance: 2, path: ['A', 'C', 'D']}
console.log(dijkstra);
const floyd_warshall = graph.findMatrixFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]
console.table(floyd_warshall[0]);
console.table(floyd_warshall[1]);
