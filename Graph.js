loggingLevels = {
  NONE: 0,
  MIN: 1,
  STEPS: 2,
  ALL: 3,
};

class Graph {
  get loggingLevels() {
    return this._loggingLevels;
  }

  set loggingLevels(loggingLevels) {
    this._loggingLevels = loggingLevels;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get graph() {
    return this._graph;
  }

  print() {
    return console.table(this.graph);
  }

  set graph(graph) {
    this._graph = graph;
  }
  get ignoreErrors() {
    return this._ignoreErrors;
  }

  set ignoreErrors(ignoreErrors) {
    this._ignoreErrors = ignoreErrors;
  }

  printTableLog() {
    return console.table(this.tableLog);
  }
  get tableLog() {
    return this._tableLog;
  }

  set tableLog(tableLog) {
    this._tableLog = tableLog;
  }

  constructor(name, loggingLevel = 0, ignoreErrors = true) {
    const now = new Date();
    const date =
      now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
    const time =
      now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    if (name) {
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
    this.ignoreErrors = ignoreErrors;
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

  logProcess = (level, message, isError = false) => {
    if (level > this.loggingLevels.NONE && level <= this.loggingLevel) {
      const now = new Date();
      const date =
        now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
      let time =
        now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      time = String(time).padStart(2, "0");
      console.log(`[${date} ${time}]: ${message}`);
    }
    if (isError && !this.ignoreErrors) {
      throw new Error(message);
    }
  };

  addNode = (node) => {
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
    return this;
  };

  addRoute = (
    startingNode,
    endingNode,
    weight,
    bidirectional = false,
    createNodes = false
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
      if (createNodes) {
        this.addNode(startingNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Starting node ${startingNode} doesn't exist in graph. Use createNodes parameter to auto create them`,
          true
        );
        return this;
      }
    }

    if (!this.graph.hasOwnProperty(endingNode)) {
      if (createNodes) {
        this.addNode(endingNode);
      } else {
        this.logProcess(
          this.loggingLevels.MIN,
          `Ending node ${endingNode} doesn't exist in graph. Use createNodes parameter to auto create them`,
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
      this.logProcess(
        this.loggingLevels.MIN,
        `Route already exists [${startingNode} - ${endingNode}] with weight ${weight}`,
        true
      );
      return this;
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

  shortestDistanceNode = (adjNodes, visitedNodes) => {
    let shortest = null;

    for (let node in adjNodes) {
      let currentIsShortest =
        shortest === null || adjNodes[node] < adjNodes[shortest];
      if (currentIsShortest && !visitedNodes.includes(node)) {
        shortest = node;
      }
    }
    return shortest;
  };

  findShortestPath = (startNode, endNode) => {
    const tableLog = {
      Iterations: [],
      "Visited Nodes": [],
      Distance: [],
      Connection: [],
      "Updated Nodes": [],
      "Distance Updated Nodes": [],
    };
    this.logProcess(this.loggingLevels.STEPS, "Starting Dijkstra Algorithm");
    let iteration = 0;

    let distances = {};
    distances[endNode] = Infinity;
    distances = Object.assign(distances, this.graph[startNode]);

    let parents = { endNode: null };

    for (let child in this.graph[startNode]) {
      parents[child] = startNode;
    }

    let visited = [];

    let node = this.shortestDistanceNode(distances, visited);

    tableLog.Iterations.push(0);
    tableLog["Visited Nodes"].push(startNode);
    tableLog.Connection.push(`-`);
    tableLog.Distance.push(0);
      let updatedNodes = "";
      let updatedDistanceNodes = "";
    for (const key in this.graph[startNode]) {
        if (this.graph[startNode].hasOwnProperty(key)) {
          updatedNodes += `${key}, `;
          updatedDistanceNodes += `${this.graph[startNode][key]}, `;
        }
    }
    tableLog["Updated Nodes"].push(updatedNodes.slice(0, -2));
    tableLog["Distance Updated Nodes"].push(updatedDistanceNodes.slice(0, -2));

    while (node) {
      iteration++;
      let distance = distances[node];
      this.logProcess(
        this.loggingLevels.STEPS,
        `[Iteration ${iteration}]: Visited: ${String(
          node
        )}, Distance: ${distance}, Connection ${
          parents[String(node)]
        } -> ${String(node)}`
      );
      tableLog.Iterations.push(iteration);
      tableLog["Visited Nodes"].push(String(node));
      tableLog.Distance.push(distance);
      tableLog.Connection.push(`${parents[String(node)]} -> ${String(node)}`);
      let updatedNodes = "";
      let updatedDistances = "";

      let children = this.graph[node];
      // for each of those child nodes
      for (let child in children) {
        // make sure each child node is not the start node
        if (String(child) === String(startNode)) {
          continue;
        } else {
          // save the distance from the start node to the child node
          let newdistance = distance + children[child];

          if (!distances[child] || newdistance < distances[child]) {
            updatedNodes += `${String(child)}, `;
            updatedDistances += `${newdistance}, `;
            distances[child] = newdistance;
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
      tableLog["Updated Nodes"].push(updatedNodes.slice(0, -2));
      tableLog["Distance Updated Nodes"].push(updatedDistances.slice(0, -2));
      visited.push(node);
      // move to the nearest neighbor node
      node = this.shortestDistanceNode(distances, visited);
    }

    // using the stored paths from start node to end node
    // record the shortest path
    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
      shortestPath.push(parent);
      parent = parents[parent];
    }
    shortestPath.reverse();

    // return the shortest path from start node to end node & its distance
    let results = {
      distance: distances[endNode],
      path: shortestPath,
    };

    this.tableLog = tableLog;

    return results;
  };
}
