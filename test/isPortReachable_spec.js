var helper = require("node-red-node-test-helper");
var IPRNode = require("../isPortReachable.js");

describe('isPortReachable Node', function () {

  afterEach(function () {
    helper.unload();
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "is-Port-Reachable", name: "test name" }];
    helper.load(IPRNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'test name');
      done();
    });
  });

  it('should get status true for google:80 payload', function (done) {
    var flow = [{ id: "n1", type: "isPortReachable", name: "test name",wires:[["n2"]], host:"google.com", port:80 },
    { id: "n2", type: "helper" }];
    helper.load(IPRNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        console.log("Mocha"+JSON.stringify(msg));
        msg.should.have.property('payload', {host: "google.com", port: 80, alive: true});
        done();
      });
      n1.receive({ payload: {host: "google.com", port: 80} });
    });
  });
});