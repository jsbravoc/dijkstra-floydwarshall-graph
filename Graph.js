/**
 * @description Calculates Dijkstra Algorithm for directed or undirected weighted graphs.
 * @author Juan Sebastián Bravo <js.bravo@uniandes.edu.co>
 */

/** Class representing a log of the Dijkstra Algorithm (IIND3221 Format) */
class TableLog {
  /**
   * Create a log for an iteration.
   * @param {String} visitedNodes - The node marked as visited in the iteration.
   * @param {Number} distance - The distance (or weight) to get to the node from the starting node.
   * @param {String} connection - String representing the connection made to get to that node ({A} -> {B} format).
   * @param {String} updatedNodes - String representing the updated nodes (recursively explored) separated by commas.
   * @param {String} updatedDistanceNodes - String representing the updated distances of the nodes (recursively explored) separated by commas.
   */
  constructor(
    visitedNodes,
    distance,
    connection,
    updatedNodes,
    updatedDistanceNodes
  ) {
    this["Visited Nodes"] = visitedNodes;
    this.Distance = distance;
    this.Connection = connection;
    this["Updated Nodes"] = updatedNodes;
    this["Distance Updated Nodes"] = updatedDistanceNodes;
  }

  /**
   * Prints the current log in console using console.table()
   */
  print() {
    console.table(this);
  }
}

/** Class representing a Weighted (Un)directed Graph */
class Graph {
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
   * @param {boolean} ignoreErrors - If nodes will be autocreated.
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
   * @param {Object} - tableLog, made of TableLog objects.
   */
  set tableLog(tableLog) {
    this._tableLog = tableLog;
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
   * @param {String} [name] - The name of the graph. By default, its name will be its instantiation date-time.
   * @param {Number} [loggingLevel = 0] - The level of the logger used. By default, the logger level will be 0 (minimal logs, mostly errors).
   * @param {boolean} [ignoreErrors = true] - If true, errors will be thrown at execution in case of failure.
   * @param {boolean} [autoCreateNodes = false] - If true, nodes will be created when creating routes for them in case they don't exist.
   */
  constructor(
    name = null,
    loggingLevel = 0,
    ignoreErrors = true,
    autoCreateNodes = false
  ) {
    const now = new Date();
    const date =
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    const time =
      now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    if (name !== null) {
      this.name = name;
    } else {
      this.name = `Graph [${date} ${time}]`;
    }
    this.graph = {};
    this.loggingLevels = {
      NONE: 0,
      MIN: 1,
      STEPS: 2,
      ALL: 3,
    };
    if (typeof ignoreErrors === "boolean") this.ignoreErrors = ignoreErrors;
    if (typeof autoCreateNodes === "boolean")
      this.autoCreateNodes = autoCreateNodes;
    switch (loggingLevel) {
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
   * @param {String} message - The message of the log.
   * @param {boolean} [isError = false] - If true and ignoreErrors is false, an error will be thrown.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown.
   */
  logProcess = (level, message, isError = false) => {
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

      console.log(`[${date} ${time}]: ${message}`);
    }
    if (isError && !this.ignoreErrors) {
      throw new Error(message);
    }
  };

  /**
   * Adds a node to the graph.
   * @param {String} node - The name of the node.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown if node already exists.
   */
  addNode = (node, ...args) => {
    if (this.graph.hasOwnProperty(node)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node already exists ${node}: ${JSON.stringify(this.graph[node])}`,
        true
      );
      return this;
    }
    this.logProcess(this.loggingLevels.ALL, `Created node ${node}`);
    this.graph[String(node)] = {};

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
   * Deletes a route/path between two nodes.
   * @param {String} startingNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endingNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {boolean} [bidirectionalDelete = false] - If true, both directions will be deleted.
   * @param {boolean} [deleteRoute = true] - If true, the route will be deleted. If false, its weight will be set to Infinity.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the starting node or the ending node is null.
   *   * If the starting node or the ending node doesn't exist in graph and this.autoCreateNodes is false.
   *   * If the starting node and the ending node are the same.
   *   * If the weight isn't a positive number.
   *   * If the route already exists and changeCreated is false.
   */
  deleteRoute = (
    startingNode,
    endingNode,
    bidirectionalDelete = false,
    deleteRoute = true
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
        `Node doesn't exists (${startingNode})}`,
        true
      );
      return this;
    }
    if (!this.graph[startingNode].hasOwnProperty(endingNode)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Path to node doesn't exists (${startingNode} -> ${endingNode})`,
        true
      );
      return this;
    }
    if (deleteRoute) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Deleted route (${startingNode} -> ${endingNode})`,
        true
      );
      delete this.graph[startingNode][endingNode];
    } else {
      this.logProcess(
        this.loggingLevels.MIN,
        `Changed route (${startingNode} -> ${endingNode}) weight to Infinity`,
        true
      );
      this.graph[startingNode][endingNode] = Infinity;
    }
    if (bidirectionalDelete) {
      if (!this.graph[endingNode].hasOwnProperty(startingNode)) {
        this.logProcess(
          this.loggingLevels.MIN,
          `Path to node doesn't exists (${endingNode} -> ${startingNode})`,
          true
        );
        return this;
      } else if (deleteRoute) {
        this.logProcess(
          this.loggingLevels.MIN,
          `Deleted route (${startingNode} -> ${endingNode})`,
          true
        );
        delete this.graph[endingNode][startingNode];
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Changed route (${startingNode} -> ${endingNode}) weight to Infinity`,
          true
        );
        this.graph[endingNode][startingNode] = Infinity;
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
      let isClosest = closest === null || nodes[node] < nodes[closest];
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
    }

    let visited = [];

    let node = this.findClosestNode(nodes, visited);

    let updatedNodes = "";
    let updatedDistances = "";
    for (const key in this.graph[startNode]) {
      if (this.graph[startNode].hasOwnProperty(key)) {
        updatedNodes += `${key}, `;
        updatedDistances += `${this.graph[startNode][key]}, `;
      }
    }
    resultTableLog[0] = new TableLog(
      startNode,
      0,
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
        )}, Distance: ${distance}, Connection ${
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
          let newdistance = distance + children[child];

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
        distance,
        `${parents[String(node)]} -> ${String(node)}`,
        updatedNodes.slice(0, -2),
        updatedDistances.slice(0, -2)
      );
      visited.push(node);

      node = this.findClosestNode(nodes, visited);
    }

    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
      shortestPath.push(parent);
      parent = parents[parent];
    }
    shortestPath.reverse();

    let results = {
      distance: nodes[endNode],
      path: shortestPath,
    };

    this.tableLog = resultTableLog;

    return results;
  };
}
