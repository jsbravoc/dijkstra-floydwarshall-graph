const should = require("chai").should();
const { expect } = require("chai");
const Graph = require("../Graph/Graph");
describe("Graph manipulation", function () {
  describe("Node manipulation", function () {
    describe("addNode()", function () {
      it("should return the graph with the node added", function () {
        const graph = new Graph({});
        const addedNode = graph.addNode("A");
        addedNode.should.be.a("Object");
        graph.graph.should.have.property("A");
        graph.costsNodes.should.have.property("A");
      });
    });

    describe("deleteNode()", function () {
      it("should delete node from all references", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.deleteNode("A");
        graph.graph.should.not.have.property("A");
        graph.graph.should.have.property("B").with.not.property("A");
        graph.costsNodes.should.not.have.property("A");
      });
    });
    describe("editNode()", function () {
      it("should edit node from all references", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.editNode("A", "C", 100);
        graph.editNode("B", "D");
        graph.graph.should.not.have.property("A");
        graph.graph.should.have.property("C");
        graph.graph.should.not.have.property("B");
        graph.graph.should.have.property("D");
        graph.costsNodes.should.have.property("C").equal(100);
        graph.costsNodes.should.have.property("D").equal(0);
      });
    });
    describe("avoidNode()", function () {
      it("should change node toll cost to Infinity, keeping routes cost", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.avoidNode("A");
        graph.graph.should.have.property("A");
        graph.costsNodes.should.have.property("A").equal(Infinity);
        graph.graph.should.have.property("B").with.property("A").equal(1);
      });
    });
    describe("Edit constant node costs", function () {
      it("should change node toll cost only to non protected nodes with previous constant node cost", function () {
        const graph = new Graph({ constantNodesCost: 10 });
        graph
          .addNode({ name: "A", cost: 100, protectNodeCost: true })
          .addNode({ name: "B", cost: 100, protectNodeCost: false })
          .addNode("C");
        graph.graph.should.have.property("A");
        graph.graph.should.have.property("B");
        graph.graph.should.have.property("C");
        graph.costsNodes.should.have.property("A").equal(100);
        graph.costsNodes.should.have.property("B").equal(100);
        graph.costsNodes.should.have.property("C").equal(10);
        graph.constantNodesCost = 0;
        graph.costsNodes.should.have.property("A").equal(100);
        graph.costsNodes.should.have.property("B").equal(100);
        graph.costsNodes.should.have.property("C").equal(0);
        graph.constantNodesCost = 100;
        graph.costsNodes.should.have.property("A").equal(100);
        graph.costsNodes.should.have.property("B").equal(100);
        graph.costsNodes.should.have.property("C").equal(100);
        graph.constantNodesCost = 0;
        graph.costsNodes.should.have.property("A").equal(100);
        graph.costsNodes.should.have.property("B").equal(0);
        graph.costsNodes.should.have.property("C").equal(0);
      });
    });
  });

  describe("Routes manipulation", function () {
    describe("addRoute()", function () {
      it("should add a route between two nodes", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1);
        graph.graph.should.have.property("A").with.property("B");
        graph.graph["A"]["B"].should.equal(1);
        graph.graph.should.have.property("B").with.not.property("A");
      });
    });
    describe("addRoute() (bidirectional)", function () {
      it("should add directional route between two nodes", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.graph.should.have.property("A").with.property("B");
        graph.graph["A"]["B"].should.equal(1);
        graph.graph.should.have.property("B").with.property("A");
        graph.graph["B"]["A"].should.equal(1);
      });
    });
    describe("deleteRoute()", function () {
      it("should delete the route between two the start node to the endnode", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.deleteRoute("A", "B");
        graph.graph.should.have.property("A").with.not.property("B");
        graph.graph.should.have.property("B").with.property("A").equal(1);
      });
    });
    describe("deleteRoute() (bidirectional)", function () {
      it("should delete the routes between both nodes", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.deleteRoute("A", "B", true);
        graph.graph.should.have.property("A").with.not.property("B");
        graph.graph.should.have.property("B").with.not.property("A");
      });
    });
    describe("editRoute()", function () {
      it("should edit route between the start node and the end node", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.editRoute("A", "B", 10);
        graph.graph.should.have.property("A").with.property("B").equal(10);
        graph.graph.should.have.property("B").with.property("A").equal(1);
      });
    });
    describe("editRoute() (bidirectional)", function () {
      it("should edit the routes between both nodes", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.editRoute("A", "B", 10, true);
        graph.graph.should.have.property("A").with.property("B").equal(10);
        graph.graph.should.have.property("B").with.property("A").equal(10);
      });
    });
    describe("avoidRoute()", function () {
      it("should change route weight to Infinity, keeping nodes cost", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.avoidRoute("A", "B");
        graph.graph.should.have.property("A");
        graph.graph.should.have
          .property("A")
          .with.property("B")
          .equal(Infinity);
        graph.costsNodes.should.have.property("A").equal(0);
        graph.costsNodes.should.have.property("B").equal(0);
      });
    });
    describe("avoidRoute() (bidirectional)", function () {
      it("should change route weight to Infinity to both routes", function () {
        const graph = new Graph({});
        graph.addNode("A").addNode("B");
        graph.addRoute("A", "B", 1, true);
        graph.avoidRoute("A", "B", true);
        graph.graph.should.have.property("A");
        graph.graph.should.have
          .property("A")
          .with.property("B")
          .equal(Infinity);
        graph.graph.should.have
          .property("B")
          .with.property("A")
          .equal(Infinity);
        graph.costsNodes.should.have.property("A").equal(0);
        graph.costsNodes.should.have.property("B").equal(0);
      });
    });
  });
});
describe("Algorithms", function () {
  describe("Dijkstra Algorithm", function () {
    describe("findDijkstraPath()", function () {
      it("should find the cheapest path possible", function () {
        const graph = new Graph({});
        graph
          .addNode("A")
          .addNode("B")
          .addNode("C")
          .addNode("D")
          .addRoute("A", "B", 2)
          .addRoute("A", "C", 1)
          .addRoute("B", "C", 2)
          .addRoute("C", "D", 1);

        const dijkstra = graph.findPathDijkstra("A", "D");
        dijkstra.cost.should.equal(2);
        expect(dijkstra.path).to.eql(["A", "C", "D"]);
      });
    });
    describe("findDijkstraPath() with node costs", function () {
      it("should find the cheapest path possible, including toll costs", function () {
        const graph = new Graph({
          constantNodesCost: 100,
          autoCreateNodes: true,
        });
        graph
          .addNode({ name: "C", cost: 500 })
          .addRoute("A", "B", 2)
          .addRoute("A", "C", 1)
          .addRoute("B", "C", 2)
          .addRoute("C", "D", 1)
          .addRoute("B", "D", 200);

        const dijkstra = graph.findPathDijkstra("A", "D");
        dijkstra.cost.should.equal(502);
        expect(dijkstra.path).to.eql(["A", "B", "D"]);
      });
    });
    describe("findDijkstraPath() with node & route avoiding", function () {
      it("should find the cheapest path possible, including toll costs", function () {
        const graph = new Graph({
          constantNodesCost: 100,
          autoCreateNodes: true,
        });
        graph.addNode({ name: "C", cost: 500 });

        graph.addRoute("A", "B", 2);
        graph.addRoute("A", "C", 1);
        graph.addRoute("B", "C", 2);
        graph.addRoute("C", "D", 1);
        graph.addRoute("B", "D", 200);

        graph.avoidRoute("A", "B");

        let dijkstra = graph.findPathDijkstra("A", "D");
        dijkstra.cost.should.equal(702);
        expect(dijkstra.path).to.eql(["A", "C", "D"]);

        graph.editRoute("A", "B", 2);

        graph.avoidNode("C");

        dijkstra = graph.findPathDijkstra("A", "D");
        dijkstra.cost.should.equal(502);
        expect(dijkstra.path).to.eql(["A", "B", "D"]);
      });
    });

    describe("Floyd-Warshall Algorithm", function () {
      describe("findMatricesFloydWarshall() - Distance Matrix", function () {
        it("should find the matrix of minimum distances between any pair of nodes", function () {
          const graph = new Graph({
            autoCreateNodes: true,
          });
          graph
            .addNode({ name: "C" })
            .addRoute("A", "B", 2)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 2)
            .addRoute("C", "D", 1)
            .addRoute("B", "D", 200);

          const [
            distanceMatrix,
            precedenceMatrix,
          ] = graph.findMatricesFloydWarshall();
          expect(distanceMatrix).to.eql({
            A: { A: 0, B: 2, C: Infinity, D: 202 },
            B: { A: Infinity, B: 0, C: Infinity, D: 200 },
            C: { A: Infinity, B: Infinity, C: 0, D: 1 },
            D: { A: Infinity, B: Infinity, C: Infinity, D: 0 },
          });
        });
      });
      describe("findMatricesFloydWarshall() - Precedence Matrix", function () {
        it("should find the precedence matrix between any pair of nodes", function () {
          const graph = new Graph({
            autoCreateNodes: true,
          });
          graph
            .addNode({ name: "C" })
            .addRoute("A", "B", 2)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 2)
            .addRoute("C", "D", 1)
            .addRoute("B", "D", 200);

          const [
            distanceMatrix,
            precedenceMatrix,
          ] = graph.findMatricesFloydWarshall();
          expect(precedenceMatrix).to.eql({
            A: { A: "A", B: "A", C: "A", D: "B" },
            B: { A: "B", B: "B", C: "B", D: "B" },
            C: { A: "C", B: "C", C: "C", D: "C" },
            D: { A: "D", B: "D", C: "D", D: "D" },
          });
        });
      });
      describe("findPathFloydWarshall()", function () {
        it("Using the precedence matrix, should find the cheapest path between two nodes", function () {
          const graph = new Graph({
            autoCreateNodes: true,
          });
          graph
            .addNode("A")
            .addNode("B")
            .addNode("C")
            .addNode("D")
            .addRoute("A", "B", 2)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 2)
            .addRoute("C", "D", 1);

          graph.findMatricesFloydWarshall();
          const floydWarshall = graph.findPathFloydWarshall("A", "D");

          floydWarshall.cost.should.equal(2);
          expect(floydWarshall.path).to.eql(["A", "C", "D"]);
        });
      });
    });
  });
  describe("Algorithm solution checking", function () {
    describe("Same cheapest route Dijkstra & Floyd-Warshall", function () {
      it("should be the same route with the same cost", function () {
        const graph = new Graph({ autoCreateNodes: true });
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

        const endNode = 11;
        const startNode = "0";

        graph.findMatricesFloydWarshall();
        const floydWarshall = graph.findPathFloydWarshall(startNode, endNode);
        const dijkstra = graph.findPathDijkstra(startNode, endNode);

        floydWarshall.cost.should.equal(dijkstra.cost);
        expect(floydWarshall.path).to.eql(dijkstra.path);
      });
    });
    describe("Same cheapest route Dijkstra & Floyd-Warshall with node costs", function () {
      it("should be the same route with the same cost", function () {
        const graph = new Graph({ autoCreateNodes: true });
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

        graph
          .addRoute(7, 16, 18)
          .addRoute(13, 16, 10, true)
          .addRoute(15, 16, 8);
        graph.deleteRoute("0", "5", true);
        graph.deleteRoute("0", "9", true);
        graph.constantNodesCost = 55000;
        graph.MultiplyByFactorRoutes(10000);

        const endNode = 3;
        const startNode = "0";

        graph.findMatricesFloydWarshall();
        const floydWarshall = graph.findPathFloydWarshall(startNode, endNode);
        const dijkstra = graph.findPathDijkstra(startNode, endNode);

        floydWarshall.cost.should.equal(dijkstra.cost);
        expect(floydWarshall.path).to.eql(dijkstra.path);
      });
    });
  });
  describe("Expected execution error", function () {
    describe("Graph Manipulation", function () {
      describe("Node manipulation", function () {
        describe("Empty required parameters", function () {
          it("should throw an error due to empty parameters", function () {
            const graph = new Graph({ ignoreErrors: false });
            should.Throw(() => graph.addNode(), Error);
            should.Throw(() => graph.addNode(""), Error);
            should.Throw(() => graph.editNode(), Error);
            should.Throw(() => graph.editNode(""), Error);
            should.Throw(() => graph.deleteNode(), Error);
            should.Throw(() => graph.deleteNode(""), Error);
          });
        });
        describe("Nonexistent nodes", function () {
          it("should throw an error due to nonexistent nodes", function () {
            const graph = new Graph({ ignoreErrors: false });
            graph.addNode("A", "B", "C");
            should.Throw(() => graph.editNode("D"), Error);
            should.Throw(() => graph.deleteNode("E"), Error);
          });
        });
        describe("Existing nodes", function () {
          it("should throw an error due to existing nodes", function () {
            const graph = new Graph({ ignoreErrors: false });
            graph.addNode("A", "B", "C");
            should.Throw(() => graph.addNode("A"), Error);
          });
        });
      });
      describe("Routes manipulation", function () {
        describe("Empty required parameters", function () {
          it("should throw an error due to empty parameters", function () {
            const graph = new Graph({ ignoreErrors: false });
            graph.addNode("A", "B");
            should.Throw(() => graph.addRoute(), Error);
            should.Throw(() => graph.addRoute("A"), Error);
            should.Throw(() => graph.addRoute(null, "B"), Error);
            should.Throw(() => graph.editRoute(), Error);
            should.Throw(() => graph.editRoute("A"), Error);
            should.Throw(() => graph.editRoute(null, "B"), Error);
            should.Throw(() => graph.editRoute("A", "B"), Error);
          });
        });
        describe("Nonexistent nodes/routes", function () {
          it("should throw an error due to nonexistent nodes/routes", function () {
            const graph = new Graph({ ignoreErrors: false });
            graph.addNode("A", "B", "C");
            should.Throw(() => graph.addRoute("A", "D"), Error);
            should.Throw(() => graph.editRoute("A", "B", 3, true, true), Error);
          });
        });
      });
    });
  describe("Algorithms", function () {
    describe("Dijkstra Algorithm", function () {
      describe("Empty required parameters", function () {
        it("should throw an error due to empty parameters", function () {
          const graph = new Graph({
            ignoreErrors: false,
            autoCreateNodes: true,
          });
          graph
            .addRoute("A", "B", 100)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 1);
          should.Throw(() => graph.findPathDijkstra("A"), Error);
          should.Throw(() => graph.findPathDijkstra("A", ""), Error);
          should.Throw(() => graph.findPathDijkstra("", "B"), Error);
          should.Throw(() => graph.findPathDijkstra(null, "B"), Error);
        });
      });
    });
    describe("Nonexistent nodes as parameters", function () {
      it("should throw an error due to nonexistent nodes", function () {
        const graph = new Graph({
          ignoreErrors: false,
          autoCreateNodes: true,
        });
        graph
          .addRoute("A", "B", 100)
          .addRoute("A", "C", 1)
          .addRoute("B", "C", 1);
        should.Throw(() => graph.findPathDijkstra("A", "D"), Error);
        should.Throw(() => graph.findPathDijkstra("D", "A"), Error);
      });
    });
    describe("Floyd-Warshall Algorithm", function () {
      describe("Empty required parameters", function () {
        it("should throw an error due to empty parameters", function () {
          const graph = new Graph({
            ignoreErrors: false,
            autoCreateNodes: true,
          });
          graph
            .addRoute("A", "B", 100)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 1);
          graph.findMatricesFloydWarshall();
          should.Throw(() => graph.findPathFloydWarshall());
          should.Throw(() => graph.findPathFloydWarshall("A"));
          should.Throw(() => graph.findPathFloydWarshall("", "B"));
          should.Throw(() => graph.findPathFloydWarshall(null, "B"));
        });
      });
      describe("Find a path without finding matrices first", function () {
        it("should throw an error due to missing matrices from Floyd-Warshall Algorithm", function () {
          const graph = new Graph({
            ignoreErrors: false,
            autoCreateNodes: true,
          });
          graph
            .addRoute("A", "B", 100)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 1);
          should.Throw(() => graph.findPathFloydWarshall("A", "C"));
        });
      });
      describe("Nonexistent nodes as parameters", function () {
        it("should throw an error due to nonexistent nodes as parameters", function () {
          const graph = new Graph({
            ignoreErrors: false,
            autoCreateNodes: true,
          });
          graph
            .addRoute("A", "B", 100)
            .addRoute("A", "C", 1)
            .addRoute("B", "C", 1);
          graph.findMatricesFloydWarshall();
          should.Throw(() => graph.findPathFloydWarshall("A", "D"));
          should.Throw(() => graph.findPathFloydWarshall("D", "A"));
        });
      });
    });
  });

  });
  });
