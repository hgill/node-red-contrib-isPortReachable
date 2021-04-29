module.exports = function(RED) {
    const iprLib=require("is-port-reachable");
    const _=require("lodash");

    function isPortReachable(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.intervals= [];
        var configUpInterval=config.upInterval || 20000; // check every 20 seconds when node is up
        var configDownInterval=config.downInterval || 3000; //check every 3 seconds when node is down
        node.lastStatus=false;

        function checkStatus(){
            console.log("Checkstatus: "+1);
            console.log(config.port+" "+config.host);
            console.log("config: "+JSON.stringify(config))
            return iprLib(config.port, {host: config.host})
            .then((statusNow)=>{
                console.log("Checkstatus: "+2);
                intervalMgr(statusNow); //if status has changed, toggle interval
                console.log("Checkstatus: "+3);
                if(statusNow){
                    console.log("Checkstatus: "+4);
                    node.status({fill:"green",shape:"ring",text:"status: "+statusNow});
                    console.log("Checkstatus: "+5);
                    node.send(Object.assign({},{host: config.host, port: config.port},{alive:true}));
                }else{
                    node.status({fill:"red",shape:"ring",text:"status: "+statusNow});
                    node.send(Object.assign({},{host: config.host, port: config.port},{alive:false}));
                }

            })
            .catch((err)=>{
                console.log("isPortReachable.js - Catch block" + err);
                console.log(err.stack);
                node.status({fill:"red",shape:"ring",text:"err: "+err});
            })
            .finally(()=>{
                console.log("Ping app - Finally block")
            });
        }
        
        function intervalMgr(newStatus){
            //if node is new, set interval for first time
            //if status has changed, clear intervals and set a new one
            //if status hasn't changed, do nothing
            console.log("IntervalMgr: "+1);
            switch(true){
                case newStatus==null: 
                    console.log("IntervalMgr: case 1"); // for both, clear intervals and set new one
                case newStatus!=node.lastStatus: 
                    console.log("IntervalMgr: case 2.1"); 
                    node.intervals.forEach(clearInterval);
                    console.log("IntervalMgr: case 2.2"); 
                    console.log("Node.intervals instanceof Array?: "+(node.intervals instanceof Array));
                    console.log(newStatus?configUpInterval:configDownInterval);
                    console.log("IntervalMgr: case 2.3"); 
                    node.intervals.push(
                        setInterval(
                            checkStatus(),
                            newStatus?configUpInterval:configDownInterval
                    ));        
                    console.log("IntervalMgr: case 2.4");
                    break;
                case newStatus==node.lastStatus: //do nothing
                    break;
                
            }
        }
        intervalMgr();//initiate interval
    }
    RED.nodes.registerType("isPortReachable",isPortReachable);
}