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
            return iprLib(config.port, {host: config.host})
            .then((statusNow)=>{
                intervalMgr(statusNow); //if status has changed, toggle interval
                if(statusNow){
                    node.status({fill:"green",shape:"ring",text:"status: "+statusNow});
                    node.send(Object.assign({},{host: config.host, port: config.port},{alive:true}));
                }else{
                    node.status({fill:"red",shape:"ring",text:"status: "+statusNow});
                    node.send(Object.assign({},{host: config.host, port: config.port},{alive:false}));
                }
            })
            .catch((err)=>{
                // console.log("isPortReachable.js - Catch block" + err);
                // console.log(err.stack);
                node.status({fill:"red",shape:"ring",text:"err: "+err});
            })
            .finally(()=>{
                // console.log("Ping app - Finally block")
            });
        }
        
        function intervalMgr(newStatus){
            //if node is new, set interval for first time
            //if status has changed, clear intervals and set a new one
            //if status hasn't changed, do nothing

            switch(true){
                case newStatus==null: // for both, clear intervals and set new one
                case newStatus!=node.lastStatus: 
                    node.intervals.forEach(clearInterval);
                    node.intervals.push(
                        setInterval(
                            checkStatus,
                            newStatus?configUpInterval:configDownInterval
                    ));        
                    break;
                case newStatus==node.lastStatus: //do nothing
                    break;
                
            }
            console.log("node.intervals.length: "+node.intervals.length)
        }
        intervalMgr();//initiate interval -- important to keep this null, else node won't do anything
    }
    RED.nodes.registerType("isPortReachable",isPortReachable);
}