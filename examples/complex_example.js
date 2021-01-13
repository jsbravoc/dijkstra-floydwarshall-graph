let Graph = null;
if (typeof window === "undefined") {
  Graph = require("../Graph/Graph.js");
} else {
  if (!Graph) {
    throw new Error("Graph class isn't defined yet");
  }
}

const Constants = require("../Graph/Constants")

const graph = new Graph({
  name: "Graph Example",
  loggingLevel: Constants.LoggingLevels.ALL,
  autoCreateNodes: true,
  ignoreErrors: true,
  costFormat: {
    suffix: true,
    format: "KM",
  },
});
  ;
graph
  .addRoute(7, 3, 15)
  .addRoute(3, 1, 14, true)
  .addRoute(1, 2, 12)
  .addRoute(2, 6, 22, true)
  .addRoute(6, 12, 27, true)
  .addRoute(12, 14, 10)
  .addRoute(15, 14, 11)
  .addRoute(15, 13, 10, true)
  .addRoute(13, 8, 20, true)
  .addRoute(7, 8, 11, true)
  .addRoute(7, 5, 12, true)
  .addRoute(5, 3, 4)
  .addRoute(1, 5, 9)
  .addRoute(1, 4, 8, true)
  .addRoute(2, 4, 15)
  .addRoute(4, "0", 13, true)
  .addRoute("0", 5, 6, true)
  .addRoute(5, 8, 17, true)
  .addRoute(5, 9, 13, true)
  .addRoute("0", 9, 12, true)
  .addRoute(9, 10, 10)
  .addRoute("0", 10, 23, true)
  .addRoute(10, 4, 17)
  .addRoute(6, 10, 14)
  .addRoute(10, 12, 8)
  .addRoute(10, 15, 24, true)
  .addRoute(9, 13, 14, true)
  .addRoute(9, 8, 5)
  .addRoute(9, 11, 17, true)
  .addRoute(13, 11, 16)
  .addRoute(11, 15, 9)
  .addRoute(11, 14, 17, true);

//a) Find distance & precedence matrix using Floyd Warshall Algorithm.
const [dist, precedenceMatrix] = graph.findMatricesFloydWarshall();
console.log("literal_a:");
console.table(dist);
console.table(precedenceMatrix);

//b) Find path using precedence matrix for clients 3, 6, 14
const clients = [3, 6, 14];
const origin = "0";
const literal_b = { Costs: {}, Path: {} };
clients.forEach((client) => {
  const response = graph.findPathFloydWarshall(origin, client);
  literal_b["Path"][`Client ${client}`] = response.path;
  literal_b["Costs"][`Client ${client}`] = response.cost;
});
console.log("literal_b", literal_b);
clients.forEach((client) =>
  console.log(`\t Client ${client}: `, graph.findPathDijkstra(origin, client))
);

//C) New client, new routes, find best path using Dijkstra.
graph
  .addRoute(7, 16, 18)
  .addRoute(13, 16, 10, true)
  .addRoute(15, 16, 8);
const literal_c = graph.findPathDijkstra("0", "16");
console.log("literal_c", literal_c);

//d) Delete/avoid routes. Added tolls for every node, changed distance (Km)  to cost per Km ($).
graph.deleteRoute("0", "5", true);
graph.deleteRoute("0", "9", true);
graph.constantNodesCost = 55000;
graph.MultiplyByFactorRoutes(10000);
graph.costFormat = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 5,
});

let literal_d = graph.findPathDijkstra("0", "3");
console.log("literal_d", literal_d);

//Same solution using Floyd Warshall Algorithm
console.table(graph.findMatricesFloydWarshall()[0]);

//Verify that route is different if the conditions didn't change.
graph.constantNodesCost = 0;
graph.costFormat = {
    suffix: true,
    format: "KM",
  }
graph.MultiplyByFactorRoutes(1 / 10000);
literal_d = graph.findPathDijkstra("0", "3");
console.log("literal_d", literal_d);