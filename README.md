# Node.js implementation of Dikjstra & Floyd-Warshall Algorithms.

## Usage
To use this library, you must only create the graph, set nodes/routes & weights and execute the desired algorithm.

### Simple Example
```js
const Graph = require('dijkstra-floydwarshall-algorithms')

const graph = new Graph()

graph.addNode("A") 
     .addNode("B")
     .addNode("C")

graph.addRoute("A","B", 2)
graph.addRoute("A","C", 1)
graph.addRoute("B","C", 2)
graph.addRoute("C","D", 1)


graph.findPathDijkstra('A', 'D') // output: => { distance: 2, path: ['A', 'C', 'D']}
graph.findMatrixFloydWarshall() // output: => [<distance_matrix>, <precedence_matrix>]
```

### Another Example
```js
const Graph = require('dijkstra-floydwarshall-algorithms')

const graph = new Graph({autoCreateNodes: true, loggingLevel: 3, constantNodesCost: 100})

//Say A is a toll = 500.
graph.addNode({name: "C", cost: 500});

//Since autoCreateNodes is true, A,B,D nodes will be autoCreated with cost = constantNodesCost (100).
graph.addRoute("A","B", 2)
graph.addRoute("A","C", 1)
graph.addRoute("B","C", 2)
graph.addRoute("C","D", 1)
graph.addRoute("B","D", 200)


graph.findPathDijkstra('A', 'D') // output: => { distance: 502, path: ['A', 'B', 'D']}
graph.findMatrixFloydWarshall() // output: => [<distance_matrix>, <precedence_matrix>]
```

For more examples, see [Examples](./examples)

## Documentation

```js
/** Class representing a Weighted (Un)directed Graph */
class Graph {
/**
   * Create a Weighted (Un)directed Graph.
   * @param {String} [options.name] - The name of the graph. By default, its name will be its instantiation date-time.
   * @param {Number} [options.loggingLevel = 0] - The level of the logger used. By default, the logger level will be 0 (minimal logs, mostly errors).
   * @param {boolean} [options.ignoreErrors = true] - If true, errors will be thrown at execution in case of failure.
   * @param {boolean} [options.autoCreateNodes = false] - If true, nodes will be created when creating routes for them in case they don't exist.
   * @param {Number} [options.constantNodesCost = 0] - Constant "toll" cost of the nodes, must be greater than zero.
   */
  constructor(
    options = {
      name: null,
      loggingLevel: 0,
      ignoreErrors: true,
      autoCreateNodes: false,
      constantNodesCost: 0,
    }
  ) 
```

### Parameters
~~~~~~~~~~
Graph class includes as parameter an Object which includes these attributes:

* name  : string, optional  
    Custom name of the Graph, used in logs.
    Leave blank to use the datetime of its creation.
    
* loggingLevel  : integer [0-3], optional  
    Logging level of the graph functions & algorithms. By default, it will not show any logs.

* ignoreErrors  : boolean, optional  
    Basically, throws or catches any error ocurred during execution.

* autoCreateNodes  : boolean, optional  
    Allows to create nodes based on routes creation.

* constantNodesCost  : number, optional  
    Constant cost of passing through a node, as a "toll" cost.
