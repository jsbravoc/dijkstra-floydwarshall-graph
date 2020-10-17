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
  //Private attributes
  #tableLog = null;
  #distanceMatrix = null;
  #precedenceMatrix = null;

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
   * Get the current format of the cost/weight of a path.
   * @return {Object} The current format of the cost/weight of a path.
   */
  get costFormat() {
    return this._costFormat;
  }

  /**
   * Set the format of the cost/weight of a path.
   * @param {Object} costFormat - The format of the cost/weight of a path.
   */
  set costFormat(costFormat) {
    this._costFormat = costFormat;
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
    return this.#tableLog;
  }

  /**
   * Get the precedence matrix of the graph.
   * @return {Object} The precedence matrix.
   */
  get precedenceMatrix() {
    return this.#precedenceMatrix;
  }

  /**
   * Get the distance matrix of the graph.
   * @return {Object} The distance matrix.
   */
  get distanceMatrix() {
    return this.#distanceMatrix;
  }

  /**
   * Get optional parameter constantNodesCost.
   * @return {Object} optional parameter constantNodesCost.
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
   * Returns the cost of a path/weight formatted.
   * @param {number} cost- The cost to be formatted.
   * @returns {string} Formatted cost based on this.costFormat.
   */
  formatCost(cost) {
    if (typeof this.costFormat === "object" && this.costFormat != null) {
      if (typeof this.costFormat.format === "string") {
        if (this.costFormat.prefix == true) {
          return `${this.costFormat.format} ${cost.toLocaleString("en")}`;
        } else if (this.costFormat.suffix == true) {
          return `${cost.toLocaleString("en")} ${this.costFormat.format}`;
        }
      } else if (this.costFormat.format) {
        try {
          return this.costFormat.format(cost);
        } catch (error) {
          this.logProcess(
            this.loggingLevels.MIN,
            `Unable to format cost: ${error}`,
            true
          );
          return cost;
        }
      }
    } else return cost;
  }

  /**
   * Create a Weighted (Un)directed Graph.
   * @param {String} [name] - The name of the graph (used in logs).
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
  }) {
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
    this.costsNodes = {};
    this.costFormat = costFormat;
    this.loggingLevels = {
      NONE: 0,
      MIN: 1,
      STEPS: 2,
      ALL: 3,
    };
    if (typeof ignoreErrors === "boolean") this.ignoreErrors = ignoreErrors;
    else
      this.logProcess(
        this.loggingLevels.MIN,
        `Ignored constructor parameter ignoreErrors, expected boolean, received ${typeof ignoreErrors}`
      );
    if (typeof autoCreateNodes === "boolean")
      this.autoCreateNodes = autoCreateNodes;
    this.logProcess(
      this.loggingLevels.MIN,
      `Ignored constructor parameter autoCreateNodes, expected boolean, received ${typeof autoCreateNodes}`
    );
    if (typeof constantNodesCost === "number" && constantNodesCost >= 0) {
      this.constantNodesCost = constantNodesCost;
    } else {
      this.constantNodesCost = 0;
      this.logProcess(
        this.loggingLevels.MIN,
        `Ignored constructor parameter constantNodesCost, expected number > 0, received ${typeof constantNodesCost} : ${constantNodesCost}`
      );
    }
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
    this.logProcess(
      this.loggingLevels.ALL,
      `Logging level set to: ${this.loggingLevel}`
    );
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
            (this.name != null ? this.name + " - " : "") +
            (changeDate != null ? changeDate : date + " " + time)
          }] ---------------------`
        );
        console.table(message);
        console.log(
          `-----------------[END: ${
            (this.name != null ? this.name + " - " : "") +
            (changeDate != null ? changeDate : date + " " + time)
          }] ---------------------`
        );
      } else
        console.log(
          `[${
            (this.name != null ? this.name + " - " : "") +
            (changeDate != null ? changeDate : date + " " + time)
          }]: ${message}`
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
    if (node.cost != null && (isNaN(node.cost) || Number(node.cost) < 0)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Constant node cost must be a positive number`,
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
   * Edits a node of the graph.
   * @param {string} nodeName - The name of the existing node.
   * @param {string} newNodeName - The new name name of the existing node.
   * @param {number} newCost - The cost (positive number) of passing through that node.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown if node doesn't exist.
   */
  editNode = (nodeName, newNodeName = null, newConstantCost = null) => {
    if (typeof nodeName !== "string" || nodeName === "") {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node name is a required string`,
        true
      );
      return this;
    } else if (
      (newNodeName != null && typeof newNodeName !== "string") ||
      newNodeName === ""
    ) {
      this.logProcess(
        this.loggingLevels.MIN,
        `New node name must a non-empty string`,
        true
      );
      return this;
    } else if (!this.graph.hasOwnProperty(nodeName)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node doesn't exists: ${nodeName}`,
        true
      );
      return this;
    } else if (this.graph.hasOwnProperty(newNodeName)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node already exists: ${newNodeName}`,
        true
      );
      return this;
    } else if (isNaN(newConstantCost) || Number(newConstantCost) < 0) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Constant node cost must a positive number`,
        true
      );
      return this;
    } else {
      const [copyNode, copyCost] = [
        this.graph[nodeName],
        this.costsNodes[nodeName],
      ];
      let deletedNode,
        deletedCost = false;
      if (newNodeName != null) {
        delete this.graph[nodeName];
        deletedNode = true;
        for (const node in this.graph) {
          if (this.graph.hasOwnProperty(node)) {
            if (this.graph[node][nodeName] != null) {
              let weight = this.graph[node][nodeName];
              this.graph[node][newNodeName] = weight;
              delete this.graph[node][nodeName];
            }
          }
        }
        this.graph[newNodeName] = copyNode;
        delete this.costsNodes[nodeName];
        this.costsNodes[newNodeName] = copyCost;
      } else newNodeName = nodeName;
      if (newConstantCost != null) {
        deletedCost = true;
        this.costsNodes[newNodeName] = newConstantCost;
      }
      this.logProcess(
        this.loggingLevels.ALL,
        `Changed node ${
          deletedNode ? nodeName + " -> " + newNodeName : nodeName
        }, with cost ${
          deletedCost
            ? copyCost + " -> " + (newConstantCost || copyCost)
            : copyCost
        }`
      );
      return this;
    }
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
    delete this.costsNodes[String(node)];
    for (const n in this.graph) {
      if (this.graph.hasOwnProperty(n)) {
        if (this.graph[n][node] != null) {
          delete this.graph[n][node];
        }
      }
    }
    if (args.length > 0) {
      args.forEach((nodeInArgs) => {
        return this.deleteNode(nodeInArgs);
      });
    }
    return this;
  };

  /**
   * Avoids a node from the graph.
   * @param {String} node - The name of the node.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown if node doesn't exists.
   */
  avoidNode = (node, ...args) => {
    if (!this.graph.hasOwnProperty(node)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Node doesn't exists (${node})}`,
        true
      );
      return this;
    }
    this.logProcess(this.loggingLevels.ALL, `Avoiding node ${node}`);
    this.costsNodes[node] = Infinity;
    return this;
  };

  /**
   * Adds a route/path between two nodes.
   * @param {String} startNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endNode - The ending node of the path. If bidirectional, is the other node of the path.
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
    startNode,
    endNode,
    weight,
    bidirectional = false,
    changeCreated = false
  ) => {
    if (
      startNode == null ||
      endNode == null ||
      isNaN(weight) ||
      Number(weight) <= 0
    ) {
      let errorMessage = "";
      let countErrors = 0;
      if (!startNode) {
        countErrors++;
        errorMessage += `Error [${countErrors}]: Starting node can't be null or undefined.\n`;
      }
      if (!endNode) {
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

    if (!this.graph.hasOwnProperty(startNode)) {
      if (this.autoCreateNodes) {
        this.addNode(startNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Starting node ${startNode} doesn't exist in graph. Use autoCreateNodes variable to create them automatically`,
          true
        );
        return this;
      }
    }

    if (!this.graph.hasOwnProperty(endNode)) {
      if (this.autoCreateNodes) {
        this.addNode(endNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Ending node ${endNode} doesn't exist in graph. Use autoCreateNodes variable to create them automatically`,
          true
        );
        return this;
      }
    }

    if (startNode == endNode) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Can't create a route to itself (${startNode} - ${endNode})`,
        true
      );
      return this;
    }

    if (this.graph[startNode].hasOwnProperty(endNode)) {
      if (!changeCreated) {
        this.logProcess(
          this.loggingLevels.MIN,
          `Route already exists [${startNode} - ${endNode}] with weight ${weight}`,
          true
        );
        return this;
      }
      this.logProcess(
        this.loggingLevels.ALL,
        `Route already exists [${startNode} - ${endNode}] with weight ${
          this.graph[startNode][endNode]
        }, changing weight to ${Number(weight)}`
      );
    }
    this.graph[startNode][endNode] = Number(weight);
    this.logProcess(
      this.loggingLevels.ALL,
      `Created route ${startNode} - ${endNode} with weight: ${this.graph[startNode][endNode]}`
    );

    if (bidirectional) {
      this.graph[endNode][startNode] = Number(weight);
      this.logProcess(
        this.loggingLevels.ALL,
        `Created route ${endNode} - ${startNode} with weight: ${this.graph[endNode][startNode]}`
      );
    }
    return this;
  };

  /**
   * Edits a route/path between two nodes.
   * @param {String} startNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {Number} weight - The weight of the path.
   * @param {boolean} [bidirectionalEdit = false] - If true, bidirectional path will be created/edited.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the starting node or the ending node is null.
   *   * If the starting node or the ending node doesn't exist in graph and this.autoCreateNodes is false.
   *   * If the starting node and the ending node are the same.
   *   * If the weight isn't a positive number.
   */
  editRoute = (startNode, endNode, weight, bidirectionalEdit = false) => {
    return this.addRoute(startNode, endNode, weight, bidirectionalEdit, true);
  };

  /**
   *  Deletes a route from the graph.
   * @param {String} startNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {boolean} [bidirectionalDelete = false] - If true, deletes route from start to end and from end to start nodes.
   * @param {boolean} [deleteFromGraph = true] - If true, the route is deleted completely. Otherwise, its weight becomes Infinity.
   */
  deleteRoute = (
    startNode,
    endNode,
    bidirectionalDelete = false,
    deleteFromGraph = true
  ) => {
    let errorMessage = "";
    let countErrors = 0;
    if (!startNode) {
      countErrors++;
      errorMessage += `Error [${countErrors}]: Starting node can't be null or undefined.\n`;
    }
    if (!endNode) {
      countErrors++;
      errorMessage += `Error [${countErrors}]: Ending node can't be null or undefined.\n`;
    }
    if (countErrors > 0) {
      this.logProcess(this.loggingLevels.MIN, errorMessage, true);
      return this;
    }

    if (!this.graph.hasOwnProperty(startNode)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Starting node ${startNode} doesn't exist in graph.`,
        true
      );
      return this;
    }

    if (!this.graph.hasOwnProperty(endNode)) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Ending node ${endNode} doesn't exist in graph.`,
        true
      );
      return this;
    }

    if (this.graph[startNode][endNode] == undefined) {
      this.logProcess(
        this.loggingLevels.MIN,
        `Path from ${startNode} to ${endNode} doesn't exist.`,
        true
      );
      return this;
    }

    if (deleteFromGraph) {
      this.logProcess(
        this.loggingLevels.ALL,
        `Deleted route ${startNode} - ${endNode} with previous weight: ${this.graph[startNode][endNode]}.`,
        true
      );
      delete this.graph[startNode][endNode];
      if (bidirectionalDelete) {
        return this.deleteRoute(endNode, startNode, false, deleteFromGraph);
      }
    } else {
      return this.editRoute(startNode, endNode, Infinity, bidirectionalDelete);
    }
  };

  /**
   *  Avoid a route from the graph.
   * @param {String} startNode - The starting node of the path. If bidirectional, is a node of the path.
   * @param {String} endNode - The ending node of the path. If bidirectional, is the other node of the path.
   * @param {boolean} [bidirectionalAvoid = false] - If true, avoids both routhes from start to end and from end to start nodes.
   */
  avoidRoute = (startNode, endNode, bidirectionalAvoid = false) => {
    return this.deleteRoute(startNode, endNode, bidirectionalAvoid, false);
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
  findCheapestNode = (nodes, visitedNodes) => {
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

    let node = this.findCheapestNode(nodes, visited);

    let updatedNodes = "";
    let updatedDistances = "";
    for (const adjNode in this.graph[startNode]) {
      if (this.graph[startNode].hasOwnProperty(adjNode)) {
        updatedNodes += `${adjNode}, `;
        updatedDistances += `${
          this.costsNodes[startNode] +
          this.graph[startNode][adjNode] +
          this.costsNodes[adjNode]
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

      let actual_cost = nodes[node];

      this.logProcess(
        this.loggingLevels.STEPS,
        `Visited: ${String(node)}, Distance/Cost: ${actual_cost}, Connection ${
          parents[String(node)] === undefined
            ? "None"
            : parents[String(node)] + " -> " + String(node)
        }`,
        false,
        `Iteration ${iteration}`
      );
      let updatedNodes = "";
      let updatedCosts = "";

      let adjNodes = this.graph[node];
      for (let adjNode in adjNodes) {
        //Skip route to beginning
        if (String(adjNode) === String(startNode)) {
          continue;
        } else {
          let new_cost =
            actual_cost + adjNodes[adjNode] + this.costsNodes[adjNode];

          if (!nodes[adjNode] || new_cost < nodes[adjNode]) {
            updatedNodes += `${String(adjNode)}, `;
            updatedCosts += `${new_cost}, `;
            nodes[adjNode] = new_cost;
            parents[adjNode] = node;
          }
        }
      }

      if (updatedNodes != "") {
        this.logProcess(
          this.loggingLevels.STEPS,
          `Updated Nodes: ${updatedNodes.slice(
            0,
            -2
          )}, Updated Cost Nodes: ${updatedCosts.slice(0, -2)}`,
          false,
          `Iteration ${iteration}`
        );
      }
      resultTableLog[iteration] = new TableLog(
        String(node),
        nodes[node],
        parents[String(node)] === undefined
          ? "None"
          : `${parents[String(node)]} -> ${String(node)}`,
        updatedNodes.slice(0, -2),
        updatedCosts.slice(0, -2)
      );
      visited.push(node);

      node = this.findCheapestNode(nodes, visited);
    }

    let cheapestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
      cheapestPath.unshift(parent);
      parent = parents[parent];
    }

    let results = {
      cost: this.formatCost(nodes[endNode]),
      path: cheapestPath,
    };

    this.#tableLog = resultTableLog;
    this.logProcess(this.loggingLevels.STEPS, resultTableLog);
    return results;
  };

  /**
   * Finds the distance and precedence matrix using the Floyd Warshall Algorithm
   * @returns {Array} [distanceMatrix, precedenceMatrix] for the graph.
   */
  findMatricesFloydWarshall = () => {
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
        if (middleNode === startNode) return;
        arrayOfNodes.forEach((endNode) => {
          if (middleNode === endNode) return;
          else if (startNode === endNode) return;

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

    if (this.costFormat != null) {
      arrayOfNodes.forEach((row) => {
        arrayOfNodes.forEach((col) => {
          dist[row][col] = this.formatCost(dist[row][col]);
        });
      });
    }

    this.#tableLog = dist;
    this.#distanceMatrix = dist;
    this.#precedenceMatrix = precedenceMatrix;
    return [dist, precedenceMatrix];
  };

  /**
   * Find the cheapest path between two nodes using FloydWarshall Matrices.
   * @param {string} startNode - The starting node of the path.
   * @param {string} endNode - The ending node of the path.
   * @throws {Error} If isError is true and ignoreErrors is false, an error will be thrown in the following cases:
   *   * If the Floyd Warshall Algorithm hasn't been executed previously.
   */
  findPathFloydWarshall = (startNode, endNode) => {
    const end = endNode;
    if (this.precedenceMatrix == null || this.distanceMatrix == null) {
      this.logProcess(
        this.loggingLevels.ALL,
        "Precedence Matrix and Distance Matrix are required to find the path. Firstly run findMatricesFloydWarshall",
        true
      );
    }
    let predecesor = this.precedenceMatrix[startNode][endNode];
    let route = [];
    while (predecesor !== endNode) {
      route.push(String(endNode));
      endNode = this.precedenceMatrix[predecesor][endNode];
    }
    route.push(String(predecesor));
    route.push(String(startNode));
    route = route.reverse();
    return {
      cost: this.distanceMatrix[startNode][end],
      path: route,
    };
  };
};
