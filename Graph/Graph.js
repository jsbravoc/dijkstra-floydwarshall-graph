/**
 * @description Calculates Dijkstra & Floyd Warshall Algorithm for directed or undirected weighted graphs.
 * @author Juan Sebastián Bravo <js.bravo@uniandes.edu.co>
 */

let TableLog = null;
if (typeof window === "undefined") {
  TableLog = require("./TableLog.js");
} else {
  if (!TableLog) {
    throw new Error("TableLog class isn't defined yet");
  }
}

/** Class representing a Weighted (Un)directed Graph */
module.exports = class Graph {
  /**
   * Get the logging levels.
   * @return {Object} The logging levels.
   */
  get loggingLevels() {
    return this._loggingLevels;
  }

  /**
   * Set the logging levels.
   * @param {Object} loggingLevels - The logging levels.
   */
  set loggingLevels(loggingLevels) {
    this._loggingLevels = loggingLevels;
  }

  /**
   * Get the name of the Graph.
   * @return {String} The name of the Graph.
   */
  get name() {
    return this._name;
  }

  /**
   * Set the name of the Graph.
   * @param {String} name - The name of the Graph.
   */
  set name(name) {
    this._name = name;
  }

  /**
   * Get the graph object representation {{Node}: {AdjacentNode}:{weight}}
   * @return {Object} The graph object representation.
   */
  get graph() {
    return this._graph;
  }

  /**
   * Set the graph object representation {{Node}: {AdjacentNode}:{weight}}
   * @param {Object} graph - The graph object representation.
   */
  set graph(graph) {
    this._graph = graph;
  }

  /**
   * Get optional parameter ignoreErrors. If true, errors will be thrown at execution in case of failure.
   * @return {boolean} If errors will be ignored.
   */
  get ignoreErrors() {
    return this._ignoreErrors;
  }

  /**
   * Set optional parameter ignoreErrors. If true, errors will be thrown at execution in case of failure.
   * @param {boolean} ignoreErrors - If errors will be ignored.
   */
  set ignoreErrors(ignoreErrors) {
    this._ignoreErrors = ignoreErrors;
  }

  /**
   * Get optional parameter autoCreateNodes. If true, nodes will be created if they don't exist whilst creating a route including them.
   * @return {boolean} If nodes will be autocreated.
   */
  get autoCreateNodes() {
    return this._autoCreateNodes;
  }

  /**
   * Set optional parameter autoCreateNodes. If true, nodes will be created if they don't exist whilst creating a route including them.
   * @param {boolean} autoCreateNodes - If nodes will be autocreated.
   */
  set autoCreateNodes(autoCreateNodes) {
    this._autoCreateNodes = autoCreateNodes;
  }

  /**
   * Get table log with iterations of algorithm ( @see TableLog ).
   * @return {Object} table log.
   */
  get tableLog() {
    return this._tableLog;
  }

  /**
   * Set table log with iterations of algorithm ( @see TableLog ).
   * @param {Object} tableLog - tableLog, made of TableLog objects.
   */
  set tableLog(tableLog) {
    this._tableLog = tableLog;
  }

  /**
   * Get optional parameter constantNodesCost.
   * @return {Object} table log.
   */
  get constantNodesCost() {
    return this._constantNodesCost;
  }

  /**
   * Set optional parameter constantNodesCost.
   * @param {Number} constantNodesCost - Constant cost of passing through any node.
   */
  set constantNodesCost(constantNodesCost) {
    this._constantNodesCost = constantNodesCost;
    for (const node in this.costsNodes) {
      if (this.costsNodes.hasOwnProperty(node)) {
        this.costsNodes[node] = constantNodesCost;
      }
    }
  }

  /**
   * Print the graph object representation {{Node}: {AdjacentNode}:{weight}} as a table (adjacency matrix)
   */
  print() {
    return console.table(this.graph);
  }

  /**
   * Print the table log.
   */
  printTableLog() {
    return console.table(this.tableLog);
  }

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
  ) {
    const now = new Date();
    const date =
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    const time =
      now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    if (options.name !== null) {
      this.name = options.name;
    } else {
      this.name = `Graph [${date} ${time}]`;
    }
    this.graph = {};
    this.costsNodes = {};
    this.loggingLevels = {
      NONE: 0,
      MIN: 1,
      STEPS: 2,
      ALL: 3,
    };
    if (typeof options.ignoreErrors === "boolean")
      this.ignoreErrors = options.ignoreErrors;
    if (typeof options.autoCreateNodes === "boolean")
      this.autoCreateNodes = options.autoCreateNodes;
    if (
      typeof options.constantNodesCost === "number" &&
      options.constantNodesCost >= 0
    ) {
      this.constantNodesCost = options.constantNodesCost;
    } else {
      this.constantNodesCost = 0;
    }
    switch (options.loggingLevel) {
      case this.loggingLevels.MIN:
        this.loggingLevel = this.loggingLevels.MIN;
        break;
      case this.loggingLevels.STEPS:
        this.loggingLevel = this.loggingLevels.STEPS;
        break;
      case this.loggingLevels.ALL:
        this.loggingLevel = this.loggingLevels.ALL;
        break;
      case this.loggingLevels.NONE:
      default:
        this.loggingLevel = this.loggingLevels.NONE;
        break;
    }
  }

  /**
   * Print a log in console based on the logging level.
   * @param {Number} level - The level of the log, compared to this.loggingLevels.
   * @param {Object} message - The message of the log (String or Object).
   * @param {boolean} [isError = false] - If true and ignoreErrors is false, an error will be thrown.
   * @param {String} [changeDate = null] - String to change logging format.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown.
   */
  logProcess = (level, message, isError = false, changeDate = null) => {
    if (level > this.loggingLevels.NONE && level <= this.loggingLevel) {
      const now = new Date();
      const date =
        now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
      const time =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");

      if (typeof message === "object" && message != null) {
        console.log(
          `-----------------[START: ${
            changeDate != null ? changeDate : date + " " + time
          }] ---------------------`
        );
        console.table(message);
        console.log(
          `-----------------[END: ${
            changeDate != null ? changeDate : date + " " + time
          }] ---------------------`
        );
      } else
        console.log(
          `[${changeDate != null ? changeDate : date + " " + time}]: ${message}`
        );
    }
    if (isError && !this.ignoreErrors) {
      throw new Error(message);
    }
  };

  /**
   * Adds a node to the graph.
   * @param {Object} node - The name of the node (String) or object {name, cost}
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown if node already exists.
   */
  addNode = (node, ...args) => {
    if (
      node == null ||
      (typeof node === "object" && node !== null && node.name == null)
    ) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node name is required (node.name)`,
        true
      );
      return this;
    }
    if (typeof node === "String" && this.graph.hasOwnProperty(node)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node already exists ${node}: ${JSON.stringify(this.graph[node])}`,
        true
      );
      return this;
    } else if (node.name && this.graph.hasOwnProperty(node.name)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node already exists ${node.name}: ${JSON.stringify(
          this.graph[node.name]
        )}`,
        true
      );
      return this;
    }
    if (node.name == null) {
      const temp = node;
      node = { name: temp, cost: this.constantNodesCost };
    }
    this.logProcess(
      this.loggingLevels.ALL,
      `Created node ${node.name}, with cost ${node.cost}`
    );
    this.graph[String(node.name)] = {};
    this.costsNodes[String(node.name)] = node.cost;

    if (args.length > 0) {
      args.forEach((nodeInArgs) => {
        return this.addNode(nodeInArgs);
      });
    }
    return this;
  };

  /**
   * Deletes a node from the graph.
   * @param {String} node - The name of the node.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown if node doesn't exists.
   */
  deleteNode = (node, ...args) => {
    if (!this.graph.hasOwnProperty(node)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node doesn't exists (${node})}`,
        true
      );
      return this;
    }
    this.logProcess(this.loggingLevels.ALL, `Deleted node ${node}`);
    delete this.graph[String(node)];
    if (args.length > 0) {
      args.forEach((nodeInArgs) => {
        return this.deleteNode(nodeInArgs);
      });
    }
    return this;
  };

  /**
   * Adds a route/path between two nodes.
   * @param {String} startingNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endingNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {Number} weight - The weight of the path.
   * @param {boolean} [bidirectional = false] - If true, a bidirectional path will be created.
   * @param {boolean} [changeCreated = false] - If true, an already existing route will be changed (its weight).
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the starting node or the ending node is null.
   *   * If the starting node or the ending node doesn't exist in graph and this.autoCreateNodes is false.
   *   * If the starting node and the ending node are the same.
   *   * If the weight isn't a positive number.
   *   * If the route already exists and changeCreated is false.
   */
  addRoute = (
    startingNode,
    endingNode,
    weight,
    bidirectional = false,
    changeCreated = false
  ) => {
    if (
      startingNode == null ||
      endingNode == null ||
      isNaN(weight) ||
      Number(weight) <= 0
    ) {
      let errorMessage = "";
      let countErrors = 0;
      if (!startingNode) {
        countErrors++;
        errorMessage += `Error [${countErrors}]: Starting node can't be null or undefined.\n`;
      }
      if (!endingNode) {
        countErrors++;
        errorMessage += `Error [${countErrors}]: Ending node can't be null or undefined.\n`;
      }
      if (isNaN(weight) || Number(weight) <= 0) {
        countErrors++;
        errorMessage += `Error [${countErrors}]: Weight in route must be a positive number.\n`;
      }
      this.logProcess(this.loggingLevels.MIN, errorMessage, true);
      return this;
    }

    if (!this.graph.hasOwnProperty(startingNode)) {
      if (this.autoCreateNodes) {
        this.addNode(startingNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Starting node ${startingNode} doesn't exist in graph. Use autoCreateNodes variable to create them automatically`,
          true
        );
        return this;
      }
    }

    if (!this.graph.hasOwnProperty(endingNode)) {
      if (this.autoCreateNodes) {
        this.addNode(endingNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Ending node ${endingNode} doesn't exist in graph. Use autoCreateNodes variable to create them automatically`,
          true
        );
        return this;
      }
    }

    if (startingNode == endingNode) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Can't create a route to itself (${startingNode} - ${endingNode})`,
        true
      );
      return this;
    }

    if (this.graph[startingNode].hasOwnProperty(endingNode)) {
      if (!changeCreated) {
        this.logProcess(
          this.loggingLevels.MIN,
          `Route already exists [${startingNode} - ${endingNode}] with weight ${weight}`,
          true
        );
        return this;
      }
      this.logProcess(
        this.loggingLevels.ALL,
        `Route already exists [${startingNode} - ${endingNode}] with weight ${
          this.graph[startingNode][endingNode]
        }, changing weight to ${Number(weight)}`
      );
    }
    this.graph[startingNode][endingNode] = Number(weight);
    this.logProcess(
      this.loggingLevels.ALL,
      `Created route ${startingNode} - ${endingNode} with weight: ${this.graph[startingNode][endingNode]}`
    );

    if (bidirectional) {
      this.graph[endingNode][startingNode] = Number(weight);
      this.logProcess(
        this.loggingLevels.ALL,
        `Created route ${endingNode} - ${startingNode} with weight: ${this.graph[endingNode][startingNode]}`
      );
    }
    return this;
  };

  /**
   *  Deletes a route from the graph.
   * @param {String} startingNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endingNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {boolean} [bidirectionalDelete = false] - If true, deletes route from start to end and from end to start nodes.
   * @param {boolean} [deleteFromGraph = true] - If true, the route is deleted completely. Otherwise, its weight becomes Infinity.
   */
  deleteRoute = (
    startingNode,
    endingNode,
    bidirectionalDelete = false,
    deleteFromGraph = true
  ) => {
    let errorMessage = "";
    let countErrors = 0;
    if (!startingNode) {
      countErrors++;
      errorMessage += `Error [${countErrors}]: Starting node can't be null or undefined.\n`;
    }
    if (!endingNode) {
      countErrors++;
      errorMessage += `Error [${countErrors}]: Ending node can't be null or undefined.\n`;
    }
    if (countErrors > 0) {
      this.logProcess(this.loggingLevels.MIN, errorMessage, true);
      return this;
    }

    if (!this.graph.hasOwnProperty(startingNode)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Starting node ${startingNode} doesn't exist in graph.`,
        true
      );
      return this;
    }

    if (!this.graph.hasOwnProperty(endingNode)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Ending node ${endingNode} doesn't exist in graph.`,
        true
      );
      return this;
    }

    if (this.graph[startingNode][endingNode] == undefined) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Path from ${startingNode} to ${endingNode} doesn't exist.`,
        true
      );
      return this;
    }

    if (deleteFromGraph) {
      this.logProcess(
        this.loggingLevels.ALL,
        `Deleted route ${startingNode} - ${endingNode} with previous weight: ${this.graph[startingNode][endingNode]}.`,
        true
      );
      delete this.graph[startingNode][endingNode];
      if (bidirectionalDelete) {
        return this.deleteRoute(
          endingNode,
          startingNode,
          false,
          deleteFromGraph
        );
      }
    } else {
      return this.addRoute(
        startingNode,
        endingNode,
        Infinity,
        bidirectionalDelete,
        true
      );
    }
  };

  /**
   * Multiply by positive factor the routes.
   * @param {Number} factor - Positive factor to multiply to all routes weights.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the factor is null, zero or negative
   */
  MultiplyByFactorRoutes = (factor) => {
    if (isNaN(factor) || Number(factor) <= 0) {
      this.logProcess(
        this.loggingLevels.MIN,
        "The factor must be a positive number",
        true
      );
      return this;
    } else {
      for (const node in this.graph) {
        if (this.graph.hasOwnProperty(node)) {
          for (const adjNode in this.graph[node]) {
            if (this.graph[node].hasOwnProperty(adjNode)) {
              this.graph[node][adjNode] *= factor;
              this.logProcess(
                this.loggingLevels.ALL,
                `Changed route ${node} - ${adjNode} with new weight: ${this.graph[node][adjNode]}`
              );
            }
          }
        }
      }
    }

    return this;
  };

  /**
   * Multiply by positive factor the cost of the nodes.
   * @param {Number} factor - Positive factor to multiply to all nodes weights.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the factor is null or negative
   */
  MultiplyByFactorNodesCosts = (factor) => {
    if (isNaN(factor) || Number(factor) < 0) {
      this.logProcess(
        this.loggingLevels.MIN,
        "The factor must be a positive number",
        true
      );
      return this;
    } else {
      for (const node in this.costsNodes) {
        if (this.costsNodes.hasOwnProperty[node]) {
          this.costsNodes[node] *= factor;
          this.logProcess(
            this.loggingLevels.ALL,
            `Changed node ${node} with new cost: ${this.costsNodes[node]}`
          );
        }
      }
    }

    return this;
  };
  /**
   * Finds the closest adjacent node
   * @param {Object} nodes - The adjacent nodes of the node.
   * @param {Array} visitedNodes - The nodes already visited.
   * @returns {Object} The closest node.
   */
  findClosestNode = (nodes, visitedNodes) => {
    let closest = null;

    //Explore every adjacent node.
    for (let node in nodes) {
      let isClosest =
        closest === null ||
        nodes[node] + this.costsNodes[node] < nodes[closest];
      //If the node is the closest and hasn't been visited, then it's the closest node.
      if (isClosest && !visitedNodes.includes(node)) {
        closest = node;
      }
    }
    return closest;
  };

  /**
   * Finds the best (min weight) path.
   * @param {String} startNode - The starting node of the path.
   * @param {String} endNode - The ending node of the path.
   * @returns {Object} Object with path and calculated weight (distance).
   */
  findPathDijkstra = (startNode, endNode) => {
    const resultTableLog = {};
    this.logProcess(this.loggingLevels.STEPS, "Starting Dijkstra Algorithm");

    if (
      startNode == null ||
      endNode == null ||
      !this.graph.hasOwnProperty(startNode) ||
      !this.graph.hasOwnProperty(endNode)
    ) {
      this.logProcess(
        this.loggingLevels.MIN,
        "The starting/ending nodes specified doesn't exist in the graph yet.",
        true
      );
      return this;
    }

    startNode = String(startNode);
    endNode = String(endNode);

    if (Object.keys(this.graph[startNode]).length == 0) {
      this.logProcess(
        this.loggingLevels.MIN,
        "The starting node doesn't have any connections to another node.",
        true
      );
      return this;
    }

    let iteration = 0;
    let nodes = {};
    nodes[endNode] = Infinity;
    nodes = Object.assign(nodes, this.graph[startNode]);

    let parents = { endNode: null };

    //Assign the parent of each child node of the startNode.
    for (let child in this.graph[startNode]) {
      parents[child] = startNode;
      nodes[child] += this.costsNodes[startNode] + this.costsNodes[child];
    }

    let visited = [];

    let node = this.findClosestNode(nodes, visited);

    let updatedNodes = "";
    let updatedDistances = "";
    for (const key in this.graph[startNode]) {
      if (this.graph[startNode].hasOwnProperty(key)) {
        updatedNodes += `${key}, `;
        updatedDistances += `${
          this.costsNodes[startNode] +
          this.graph[startNode][key] +
          this.costsNodes[key]
        }, `;
      }
    }
    resultTableLog[0] = new TableLog(
      startNode,
      this.costsNodes[startNode],
      "-",
      updatedNodes.slice(0, -2),
      updatedDistances.slice(0, -2)
    );

    while (node) {
      iteration++;

      let distance = nodes[node];

      this.logProcess(
        this.loggingLevels.STEPS,
        `[Iteration ${iteration}]: Visited: ${String(
          node
        )}, Distance/Cost: ${distance}, Connection ${
          parents[String(node)] === undefined
            ? "None"
            : parents[String(node)] + " -> " + String(node)
        }`
      );
      let updatedNodes = "";
      let updatedDistances = "";

      let children = this.graph[node];
      for (let child in children) {
        if (String(child) === String(startNode)) {
          continue;
        } else {
          let newdistance = distance + children[child] + this.costsNodes[child];

          if (!nodes[child] || newdistance < nodes[child]) {
            updatedNodes += `${String(child)}, `;
            updatedDistances += `${newdistance}, `;
            nodes[child] = newdistance;
            parents[child] = node;
          }
        }
      }

      if (updatedNodes != "") {
        this.logProcess(
          this.loggingLevels.STEPS,
          `[Iteration ${iteration}]: Updated Nodes: ${updatedNodes.slice(
            0,
            -2
          )}, Distance Updated Nodes: ${updatedDistances.slice(0, -2)}`
        );
      }
      resultTableLog[iteration] = new TableLog(
        String(node),
        nodes[node],
        parents[String(node)] === undefined
          ? "None"
          : `${parents[String(node)]} -> ${String(node)}`,
        updatedNodes.slice(0, -2),
        updatedDistances.slice(0, -2)
      );
      visited.push(node);

      node = this.findClosestNode(nodes, visited);
    }

    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
      shortestPath.unshift(parent);
      parent = parents[parent];
    }

    let results = {
      distance: nodes[endNode],
      path: shortestPath,
    };

    this.tableLog = resultTableLog;
    this.logProcess(this.loggingLevels.STEPS, resultTableLog);
    return results;
  };

  findMatrixFloydWarshall() {
    let arrayOfNodes = [];
    let dist = {};
    let precedenceMatrix = {};
    for (const node in this.graph) {
      arrayOfNodes.push(node);
    }
    arrayOfNodes = arrayOfNodes.sort();
    arrayOfNodes.forEach((i) => {
      dist[i] = {};
      precedenceMatrix[i] = {};
    });
    arrayOfNodes.forEach((i) =>
      arrayOfNodes.forEach((j) => {
        precedenceMatrix[i][j] = i;
        if (i === j) dist[i][j] = 0;
        else dist[i][j] = this.graph[i][j] + this.costsNodes[j] || Infinity;
      })
    );

    let iteration = 0;

    this.logProcess(
      this.loggingLevels.STEPS,
      dist,
      false,
      `Iteration ${iteration}`
    );

    arrayOfNodes.forEach((middleNode) => {
      arrayOfNodes.forEach((startNode) => {
        arrayOfNodes.forEach((endNode) => {
          const throughMiddle =
            dist[startNode][middleNode] +
            dist[middleNode][endNode] +
            (middleNode != startNode && middleNode != endNode
              ? 0
              : this.costsNodes[middleNode]);
          if (dist[startNode][endNode] > throughMiddle) {
            dist[startNode][endNode] = throughMiddle;
            precedenceMatrix[startNode][endNode] = middleNode;
          }
        });
      });

      iteration++;
      this.logProcess(
        this.loggingLevels.STEPS,
        dist,
        false,
        `Iteration ${iteration}`
      );
      this.logProcess(
        this.loggingLevels.STEPS,
        precedenceMatrix,
        false,
        `Iteration ${iteration}`
      );
    });

    arrayOfNodes.forEach((row) => {
      if (this.costsNodes[row] > 0) {
        arrayOfNodes.forEach((col) => {
          if (dist[row][col] > 0 && dist[row][col] < Infinity) {
            dist[row][col] += this.costsNodes[row];
          }
        });
      }
    });
    this.tableLog = dist;
    return [dist, precedenceMatrix];
  }
};
