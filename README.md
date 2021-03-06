# Node.js implementation of Dijkstra & Floyd-Warshall Algorithms.

## Features
* Find cheapest path between two nodes using Dijkstra or Floyd-Warshall Algorithms (not only the distance matrix).
* Directed and undirected paths between nodes.
* Fixed node costs (As a toll cost).
* Edit/delete/avoid nodes and routes after their creation.
* Multiply by a factor the cost of the routes or toll costs (i.e, when changing its unit of measure).
* Costs formatting.
* Algorithm iteration logging.

## Usage
To use this library, you must only create the graph, set nodes/routes & weights and execute the desired algorithm.

### Simple Example
```js
const {Graph} = require('dijkstra-floydwarshall-graph')

const graph = new Graph()

graph.addNode("A") 
     .addNode("B")
     .addNode("C")
     .addNode("D")

graph.addRoute("A","B", 2)
graph.addRoute("A","C", 1)
graph.addRoute("B","C", 2)
graph.addRoute("C","D", 1)


graph.findPathDijkstra('A', 'D') // output: => { distance: 2, path: ['A', 'C', 'D']}
graph.findMatricesFloydWarshall() // output: => [<distance_matrix>, <precedence_matrix>]
```

### Another Example
```js
const {Graph} = require('dijkstra-floydwarshall-graph')

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
let floyd_warshall = graph.findMatricesFloydWarshall(); // output: => [<distance_matrix>, <precedence_matrix>]
graph.findPathFloydWarshall("A", "D"); // output: => { cost: 502, path: ['A', 'B', 'D']}
```

For more examples, see [Examples](./examples)

## Documentation

### Graph

```js
/** Class representing a Weighted (Un)directed Graph */
 /**
   * Create a Weighted (Un)directed Graph.
   * @param {string} [name] - The name of the graph (used in logs).
   * @param {Number} [loggingLevel = 0] - The level of the logger used. By default, the logger level will be 0 (minimal logs, mostly errors).
   * @param {boolean} [ignoreErrors = true] - If true, errors will be thrown at execution in case of failure.
   * @param {boolean} [autoCreateNodes = false] - If true, nodes will be created when creating routes for them in case they don't exist.
   * @param {Number} [constantNodesCost = 0] - Constant "toll" cost of the nodes, must be greater than zero.
   * @param {Object} [costFormat] - Object to format of the cost/weight of a path.
   */
  constructor({
    name = null,
    loggingLevel = 0,
    ignoreErrors = true,
    autoCreateNodes = false,
    constantNodesCost = 0,
    costFormat = null,
  }) 
```

#### Parameters

Graph class includes as parameter an Object which includes these attributes:

* **name  : string, optional**<br>
    Custom name of the Graph, used in logs.<br>
    Leave blank to use the datetime of its creation.
    
* **loggingLevel  : integer [0-3], optional**<br>
    Logging level of the graph functions & algorithms. By default, it will not show any logs.

* **ignoreErrors  : boolean, optional**<br>
    Basically, throws or catches any error ocurred during execution.

* **autoCreateNodes  : boolean, optional**<br>
    Allows to create nodes based on routes creation.

* **constantNodesCost  : number, optional**<br>
    Constant cost of passing through a node, as a "toll" cost.

* **costFormat  : object, optional**<br>
    Object to format of the cost/weight of a path. Must have _format()_ defined or include {suffix?: boolean, prefix?: boolean, format: string}


### Node

Nodes are objects that contains its adjacent nodes and their cost to get there.

```js
graph: {
  Node A: {Node B: 10, Node C: 15}
  Node B: {Node C: 15}
}
```

Also, there is costsNodes as an Dictionary that contains the toll cost of a node:
```js
costsNodes: {
  Node A: 10,
  Node B: 15,
  ...
}
```

To create nodes, simply use graph.createNodes(), which can receive a name: string or object and other args are processed the same way. Sample usage:
```js
const {Graph} = require('dijkstra-floydwarshall-graph')

const graph = new Graph({
  autoCreateNodes: true,
  loggingLevel: 0,
  constantNodesCost: 100,
  ignoreErrors: false,
});
graph.addNode("A");
graph.addNode("B", "C");
graph.addNode("D")
     .addNode("E");
graph.addNode({ name: "F", cost: 500 });
```

#### Parameters

* **name  : string**<br>
    Name of the node.<br>
    
* **cost  : number, optional**<br>
    Constant toll cost of the node. If null, the cost will be the constantNodesCost of the Graph.<br>

* **protectNodeCost: boolean, optional** <br>
    Avoid changing the cost of a node when changing the constantNodesCost (See _Edit constant node costs_ test). <br>

### Routes

To create routes, simply use graph.createRoutes(), which receive as parameters the startingNode, endingNode, its weight and other optional arguments.
```js
const {Graph} = require('dijkstra-floydwarshall-graph')

const graph = new Graph({
  autoCreateNodes: true,
  loggingLevel: 0,
  constantNodesCost: 100,
  ignoreErrors: false,
});
graph.addNode("A");
graph.addNode("B", "C");
//Create route with cost (or weight) of 100
graph.addRoute("A","B",100);
//Creates two routes (A-C, C-A) with cost (or weight) of 1000
graph.addRoute("A","C",1000, true)
     .addRoute("B","A",10)
```

#### Parameters

* **startNode  : string**<br>
    Name of the starting node.<br>
    
* **endNode  : string**<br>
    Name of the ending node.<br>

* **weight  : number**<br>
    Weight of the path.<br>

* **bidirectional: boolean, optional** <br>
    If true, creates both (startNode-endNode) route and (endNode-startNode) with the same weight. <br>

* **changeCreated: boolean, optional** <br>
    If true, it will try to change the existing cost of the route of (startNode-endNode). (Used as parameter in editRoutes()) <br>

