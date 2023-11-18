function SAXSExiController() {    
    this.init();
    this.timers = [];
    this.timeout = 60000;
}

SAXSExiController.prototype.loadNavigationPanel = ExiController.prototype.loadNavigationPanel;

SAXSExiController.prototype.cleanTimers = function(){
    for (var i = 0; i < this.timers.length; i++) {
        clearTimeout(this.timers[i]);         
    }
    
};
SAXSExiController.prototype.routeNavigation = function() {
	var _this = this;
	function loadNavigationPanel(listView) {
		return _this.loadNavigationPanel(listView);
	}

   
	/**
	 * Loading navigation panel
	 * 
	 * #/session/nav #/experiment/nav #/macromolecule/nav
	 * 
	 */
	Path.map("#/saxs/:navigation/nav").to(function() {
		var listView = null;
		
		if (this.params['navigation'] == "buffer") {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new BufferListView();
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/buffer/" + selected[0].bufferId + "/main";
			});
			EXI.addNavigationPanel(listView);
			listView.load(EXI.proposalManager.getBuffers());
			EXI.setLoadingNavigationPanel(false);
			
			/** Loading welcome page **/
			EXI.addMainPanel(new BufferWelcomeMainView());
			
		}
		
		if (this.params['navigation'] == "stocksolution") {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new StockSolutionListView();
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/stocksolution/" + selected[0].stockSolutionId + "/main";
			});
			EXI.addNavigationPanel(listView);
			listView.load(EXI.proposalManager.getStockSolutions());
			EXI.setLoadingNavigationPanel(false);
			
			/** Loading welcome page **/
			EXI.addMainPanel(new StockSolutionWelcomeMainView());
			
		}
		
		if (this.params['navigation'] == "macromolecule") {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			listView = new MacromoleculeListView();
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/macromolecule/" + selected[0].macromoleculeId + "/main";
			});
			EXI.addNavigationPanel(listView);
			listView.load(EXI.proposalManager.getMacromolecules());
			EXI.setLoadingNavigationPanel(false);
			
			/** Loading welcome page **/
			EXI.addMainPanel(new MacromoleculeWelcomeMainView());
			
		}
		
		if (this.params['navigation'] == "template") {
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);
			
			listView = new TemplateListView();
			/** When selected move to hash * */
			listView.onSelect.attach(function(sender, selected) {
				location.hash = "/experiment/templateId/" + selected[0].experimentId + "/main";
			});
			var adapter = loadNavigationPanel(listView);
			adapter.saxs.experiment.getByExperimentByKey("experimentType", "TEMPLATE");
			
			/** Loading welcome page **/
			EXI.addMainPanel(new ExperimentWelcomeMainView());
		}


	}).enter(this.setPageBackground);

	
};

SAXSExiController.prototype.setPageBackground = function() {
   
};

SAXSExiController.prototype.notFound = function() {

};

SAXSExiController.prototype.routeExperiment = function() {
    
    var _this = this;
    
	Path.map("#/experiment/experimentId/:experimentId/main").to(function() {
		
        var _thisRoute = this;
        var mainView = new ExperimentMainView();
        EXI.addMainPanelWithTimer(mainView);	                    
        function loadMainExperimentView(experimentId){
        	mainView.panel.setLoading();	
            var onSuccess = function(sender, dataCollections){							
                mainView.load(dataCollections, _thisRoute.params['experimentId']);
                mainView.panel.setLoading(false);				
            };
            EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsByExperiment(_thisRoute.params['experimentId']);
          
            $.notify("Experiment results will be refreshed in 60 seconds", "info");                                    
        }
        loadMainExperimentView();
        
        
       EXI.addTimer(setInterval(loadMainExperimentView, _this.timeout));
		

	}).enter(this.setPageBackground);
    
    Path.map("#/experiment/session/:sessionId/main").to(function() {
		var mainView = new ExperimentMainView();
		EXI.addMainPanel(mainView);	
		mainView.panel.setLoading();		
		var onSuccess = function(sender, dataCollections){			
			mainView.load(dataCollections);
			mainView.panel.setLoading(false);				
		};
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsBySessionId(this.params['sessionId']);

	}).enter(this.setPageBackground);
    
	
	Path.map("#/experiment/hplc/:experimentId/main").to(function() {
		var mainView = new HPLCMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['experimentId']);
		/** Selecting data collections from experiment * */
		mainView.onSelect.attach(function(sender, element) {
			EXI.localExtorage.selectedSubtractionsManager.append(element);
		});
		mainView.onDeselect.attach(function(sender, element) {
			EXI.localExtorage.selectedSubtractionsManager.remove(element);
		});

	}).enter(this.setPageBackground);
	

	/** Loading Experiments * */
	Path.map("#/experiment/:key/:value/main").to(function() {	
			
		EXI.setLoadingMainPanel();
		var onSuccess = function(sender, data) {
			EXI.setLoadingMainPanel(false);
			if (data != null) {
				if (data.length > 0) {
					var mainView = null;
					if (data[0].experimentType == "STATIC") {
						
						mainView = new ExperimentMainView();

					}
					if (data[0].experimentType == "HPLC") {
						mainView = new HPLCMainView();
					}

					if (data[0].experimentType == "TEMPLATE") {
						mainView = new TemplateMainView();
					}

					EXI.addMainPanel(mainView);
					mainView.load(data);
					/** Selecting data collections from experiment * */
					mainView.onSelect.attach(function(sender, element) {
						EXI.localExtorage.selectedSubtractionsManager.append(element);
					});
					mainView.onDeselect.attach(function(sender, element) {
						EXI.localExtorage.selectedSubtractionsManager.remove(element);
					});

				}
			}
		};
		if ((this.params['key'] == "experimentId") || (this.params['key'] == "templateId")) {
			EXI.getDataAdapter({onSuccess : onSuccess}).saxs.experiment.getByExperimentId([ this.params['value'] ]);
		} else {
			EXI.getDataAdapter({onSuccess : onSuccess}).saxs.experiment.getByExperimentByKey(this.params['key'], this.params['value']);
		}

	}).enter(this.setPageBackground);
};





SAXSExiController.prototype.routeDataCollection = function() {
	Path.map("#/datacollection/macromoleculeAcronym/:value/main").to(function() {
		/** Loading navidation menu **/
		    EXI.setLoadingMainPanel("Searching " + this.params['value']+  "...");

			var mainView = new ExperimentMainView();
            EXI.addMainPanel(mainView);	
           		
            var onSuccess = function(sender, dataCollections){			                
                mainView.load(dataCollections);
               
                EXI.setLoadingMainPanel(false);				
            };            
            if (EXI.proposalManager.getMacromoleculeByAcronym(this.params['value']) != null){
                EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsByMacromoleculeId(EXI.proposalManager.getMacromoleculeByAcronym(this.params['value']).macromoleculeId);
            }
            else{
                BUI.showError("No Macromolecule Found");
                 EXI.setLoadingMainPanel(false);	
            }


	}).enter(this.setPageBackground);
	
	
	Path.map("#/saxs/datacollection/:key/:value/main").to(function() {
		EXI.setLoadingMainPanel();
		var onSuccess = function(sender, data) {
			var mainView = new DataCollectionMainView();
			EXI.addMainPanel(mainView);
			mainView.load(data);
			EXI.setLoadingMainPanel(false);
			/** Selecting data collections from experiment * */
			mainView.onSelect.attach(function(sender, element) {
				EXI.localExtorage.selectedSubtractionsManager.append(element);
			});
			mainView.onDeselect.attach(function(sender, element) {
				EXI.localExtorage.selectedSubtractionsManager.remove(element);
			});
		};
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsByKey(this.params['key'], this.params['value']);
	}).enter(this.setPageBackground);

	Path.map("#/saxs/datacollection/dataCollectionId/:dataCollectionId/primaryviewer").to(function() {		
			var primaryMainView = new PrimaryDataMainView();    
            EXI.addMainPanel(primaryMainView);        		            
			primaryMainView.load(this.params['dataCollectionId']);		
		
	}).enter(this.setPageBackground);
    
    Path.map("#/saxs/datacollection/dataCollectionId/:dataCollectionId/abinitio").to(function() {		
			var primaryMainView = new AbinitioMainView();    
            EXI.addMainPanel(primaryMainView);        		            
			primaryMainView.load(this.params['dataCollectionId']);		
		
	}).enter(this.setPageBackground);
	
	Path.map("#/saxs/datacollection/:key/:value/merge").to(function() {
		var onSuccess = function(sender, data) {
			var primaryMainView = new MergeMainView();
			EXI.addMainPanel(primaryMainView);
			primaryMainView.load(data);

		};
		EXI.getDataAdapter({onSuccess : onSuccess}).saxs.dataCollection.getDataCollectionsByKey(this.params['key'], this.params['value']);
	}).enter(this.setPageBackground);
};

SAXSExiController.prototype.routePrepare = function() {
	Path.map("#/buffer/:bufferId/main").to(function() {
		var mainView = new BufferMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['bufferId']);
	}).enter(this.setPageBackground);
	
	Path.map("#/buffer/add").to(function() {
		var mainView = new BufferMainView();
		EXI.addMainPanel(mainView);
	}).enter(this.setPageBackground);
	
	Path.map("#/macromolecule/:macromoleculeId/main").to(function() {
		var mainView = new MacromoleculeMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['macromoleculeId']);
	}).enter(this.setPageBackground);
	
	Path.map("#/macromolecule/add").to(function() {
		var mainView = new MacromoleculeMainView();
		EXI.addMainPanel(mainView);
	}).enter(this.setPageBackground);
	
	Path.map("#/stocksolution/:stocksolutionId/main").to(function() {
		var mainView = new StockSolutionMainView();
		EXI.addMainPanel(mainView);
		mainView.load(this.params['stocksolutionId']);
	}).enter(this.setPageBackground);
	
	Path.map("#/stocksolution/add").to(function() {
		var mainView = new StockSolutionMainView();
		EXI.addMainPanel(mainView);
		mainView.load();
	}).enter(this.setPageBackground);
	
	
	Path.map("#/prepare/stocksolution/main").to(function() {
		var mainView = new StockSolutionMainView();
		EXI.addMainPanel(mainView);
		mainView.load();
	}).enter(this.setPageBackground);


	Path.map("#/prepare/templates/main").to(function() {
		var mainView = new ExperimentDesignerMainView();
		EXI.addMainPanel(mainView);
		mainView.load();
	}).enter(this.setPageBackground);
	
	Path.map("#/prepare/shipmentpreparation").to(function() {
		var mainView = new ShipmentPreparationMainView();
		EXI.addMainPanel(mainView);
		mainView.load();
	}).enter(this.setPageBackground);
	
	
	
	

	Path.map("#/prepare/designer").to(function() {
			var mainView = new DesignerMainView();
			EXI.addMainPanel(mainView);
			mainView.load();
			}).enter(this.setPageBackground);
};

SAXSExiController.prototype.init = function() {
	var _this = this;

	function setPageBackground() {
		_this.setPageBackground();
	}
	function notFound() {
		_this.notFound();
	}

	this.routeNavigation();
	this.routeExperiment();
	this.routeDataCollection();
	this.routePrepare();

	Path.map("#/saxs/proposal/:proposal/session/nav/:sessionId/session").to(function() {					
		var redirection = "#/session/nav/" + this.params['sessionId'] +"/session";				
		/** Are we logged in yet? */
		if (EXI.credentialManager.getConnections().length > 0){			
			ExiGenericController.prototype.redirect( this.params['proposal'], redirection);
		}
		else{			
			ExiGenericController.prototype.authenticateAndRedirect(this.params['proposal'], redirection);
		}

	}).enter(this.setPageBackground);

    /** Loading a single session on the navigation panel * */
	Path.map("#/session/nav/:sessionId/session").to(function() { 
		          
        EXI.clearNavigationPanel();
        EXI.setLoadingMainPanel(true);    
		var listView = new SessionSaxsListView();		
		/** When selected move to hash * */
		listView.onSelect.attach(function(sender, selected) {
            if (selected[0]){
                if (selected[0].experimentType == "HPLC"){
                    location.hash = "/experiment/hplc/" + selected[0].experimentId + "/main";
                }
                if ((selected[0].experimentType == "STATIC")||(selected[0].experimentType == "CALIBRATION")){					
                    location.hash = "/experiment/experimentId/" + selected[0].experimentId + "/main";
                }
                if (selected[0].experimentType == "TEMPLATE"){
                    location.hash = "/experiment/templateId/" + selected[0].experimentId + "/main";
                }
            }
		});
        
		EXI.addNavigationPanelWithTimer(listView);
        var _thisRoute = this;
        function loadNavigationSession(){
            var onSuccess = function(sender, data){            
                listView.load(data);            
                EXI.setLoadingMainPanel(false);    
            };            
            EXI.getDataAdapter({onSuccess : onSuccess}).saxs.experiment.getExperimentsBySessionId(_thisRoute.params['sessionId']);
            $.notify("Session results will be refreshed in 60 seconds", "info");                              
        } 
        
        loadNavigationSession();  
        
        EXI.addTimer(setInterval(loadNavigationSession,_this.timeout));
	}).enter(this.setPageBackground);
    
    
	Path.map("#/project/:projectId/run/:runId/main").to(function() {
		var projectId = this.params['projectId'];
		var runId = this.params['runId'];

		var onSuccess = function(sender, runs) {
			for (var i = 0; i < runs.length; i++) {
				if (runs[i].internalId == runId) {
					var main = new RunMainView();
					EXI.addMainPanel(main);
					main.load(runs[i]);
				}
			}
		};
		
		var onError = function(sender, runs) {
			
		};
		
		EXI.getDataAdapter({onSuccess : onSuccess, onError :onError}).exi.offline.getRuns(projectId);

	}).enter(this.setPageBackground);
	

	Path.rescue(notFound);

};
