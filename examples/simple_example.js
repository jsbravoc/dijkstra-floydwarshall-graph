const { Graph, Constants } = require("../Graph");
const graph = new Graph({
  name: "Graph Example",
  loggingLevel: Constants.LoggingLevels.ALL,
  autoCreateNodes: false,
});

graph.addNode("A");
graph.addNode("B");
graph.addNode("C");
graph.addNode("D");
graph.addNode("E");
graph.addNode("F");
graph.addNode("G");
graph.addNode("H");
graph.addNode("K");

graph.addRoute("A", "B", 30, true);
graph.addRoute("A", "D", 30, true);
graph.addRoute("D", "C", 30, true);
graph.addRoute("C", "B", 30, true);
graph.addRoute("G", "H", 26, true);
graph.addRoute("E", "H", 5, true);
graph.addRoute("E", "K", 15, true);
graph.addRoute("E", "F", 24, true);
graph.addRoute("F", "G", 6, true);
graph.addRoute("F", "K", 9, true);
graph.addRoute("K", "G", 16, true);
graph.addRoute("G", "C", 13, true);
graph.addRoute("K", "H", 8, true);
graph.addRoute("A", "E", 10, true);
graph.addRoute("H", "D", 9, true);
graph.addRoute("B", "F", 12, true);



const dijkstra = graph.findPathDijkstra("A", "F"); 
console.log(dijkstra);
const floyd_warshall = graph.findMatricesFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]
console.table(floyd_warshall[0]);
console.table(floyd_warshall[1]);
