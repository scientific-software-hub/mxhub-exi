/**
* This is the description for routing all the puck actions. It means url= #/autoprocintegration/*
*
* @class PhasingController
* @constructor
*/
function PhasingController() {
	this.init();
}

PhasingController.prototype.setPageBackground = ExiGenericController.prototype.setPageBackground;
PhasingController.prototype.notFound = ExiGenericController.prototype.notFound;

PhasingController.prototype.getChilds = function(node, data) {
    /** Looking for children */   
    var children = _.filter(data, function(b){ return b.previousPhasingStepId == node.phasingStepId;});
    for(var i =0; i < children.length; i++){
        children[i].children = this.getChilds(children[i], data);
    }
    return children;
};

PhasingController.prototype.tableToTree = function(data, phasingStepId) {
    var parents = _.filter(data, function(b){ return b.previousPhasingStepId == null;});

        
    for(var i =0; i < parents.length; i++){    
        parents[i].children = this.getChilds(parents[i], data);    
    }
    
    if (phasingStepId){
        parents = _.filter(parents, function(b){return b.phasingStepId == phasingStepId; });
    }
    return (parents);
    
};

/**
* Inits the controller for the PhasingController related objects
* Paths accepted:
* #/phasing/autoprocintegrationId/:autoprocintegrationId/main
* @method init
*/
PhasingController.prototype.init = function() {
	var _this = this;
	this.phasingSteps = [];

    function openNav(autoprocintegrationId){
            var listView = new PhasingListView();
			

			EXI.addNavigationPanel(listView);
			var onSuccess = function(sender, data) {
				 var tree = _this.tableToTree(_.flatten(data));               
                EXI.setLoadingNavigationPanel(false);
	            listView.load(tree);
			};
			EXI.getDataAdapter({onSuccess : onSuccess}).mx.phasing.getPhasingViewByAutoProcIntegrationId(autoprocintegrationId);
            return listView;
    }
    
	Path.map("#/phasing/autoprocintegrationId/:autoprocintegrationId/main").to(function() {
        var autoprocintegrationId = this.params['autoprocintegrationId'];
        
        EXI.clearNavigationPanel();
        /** Loading Main Panel */
		var mainView = new PhasingViewerMainView();
        
        /** Attaching events from listview */
        var listView = openNav(autoprocintegrationId);
        listView.onSelect.attach(function(sender, selected) {
				if (selected.length == 0){
                    mainView.load(_this.phasingSteps);
                }
                else{                    
                 
                    mainView.load(_this.phasingSteps, selected[0].prepare.phasingStepId);
                }
	    });
        
		EXI.addMainPanel(mainView);
        EXI.setLoadingMainPanel();
        var onSuccess = function(sender, data){
            _this.phasingSteps =   _.flatten(data);             
            EXI.setLoadingMainPanel(false);            
            mainView.load( _this.phasingSteps);//, _this.tableToTree(_.flatten(_.clone(data))));
	        //mainView.load(_.clone(data), _this.tableToTree(_.flatten(_.clone(data))));
	    };
    
	    EXI.getDataAdapter({onSuccess : onSuccess}).mx.phasing.getPhasingViewByAutoProcIntegrationId(autoprocintegrationId);
	
    
    
		
	}).enter(this.setPageBackground);

    /*
    Path.map("#/phasing/autoprocintegrationId/:autoprocintegrationId/nav").to(function() {
		  OpenNav(this.params['autoprocintegrationId']);
	}).enter(this.setPageBackground);
    */
    //http://lindemaria:8082/EXI/mx/dev.html#/phasing/autoprocintegrationId/1187809/main
};
