/** Class representing a log of the Dijkstra (IIND3221 Format) */
module.exports = class TableLog {
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
