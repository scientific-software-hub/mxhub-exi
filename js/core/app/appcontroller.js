//
//function ExiController(){
//	this.init();
//};
//
//ExiController.prototype.init = function(){
//	function setPageBackground() {
//
//	}
//	function notFound() {
//
//	}
//
//	function loadNavigationPanel(listView){
//		/** Cleaning up navigation panel **/
//		EXI.clearNavigationPanel();
//		EXI.setLoadingNavigationPanel(true);
//		
//		/** Load data data **/
//		var adapter = new DataAdapter();
//		adapter.onSuccess.attach(function(sender, data) {
//			/** Load panel **/
//			EXI.addNavigationPanel(listView);
//			/** Load data **/
//			listView.store.loadData(data);
//			EXI.setLoadingNavigationPanel(false);
//		});
//		
//		/** Handle error **/
//		adapter.onError.attach(function(sender, data) {
//			EXI.setLoadingNavigationPanel(false);
//		});
//		return adapter;
//	}
//	
//	
//	/** Welcome Page **/
//	Path.map("#/").to(function() {}).enter(setPageBackground);
//	
//	
//	/** 
//	 * Loading navigation panel
//	 *  
//	 * #/session/nav
//	 * #/experiment/nav
//	 * #/macromolecule/nav
//	 * 
//	 * */
//	Path.map("#/:navigation/nav").to(function() {
//		/** Session navigation **/
//		if (this.params['navigation'] == "session") {
//			var listView = new SessionListView();
//			/** When selected move to hash **/
//			listView.onSelect.attach(function(sender, selected) {
//				location.hash = "/session/nav/" + selected[0].sessionId + "/session";
//			});
//			var adapter = loadNavigationPanel(listView);
//			adapter.getSessions();
//		}
//
//		if (this.params['navigation'] == "shipping") {
//			var listView = new ShippingListView();
//			/** When selected move to hash **/
//			listView.onSelect.attach(function(sender, selected) {
//				location.hash = "/shipping/" + selected[0].shippingId + "/main";
//			});
//			var adapter = loadNavigationPanel(listView);
//			adapter.getShippings();
//		}
//		
//		if (this.params['navigation'] == "experiment") {
//			var listView = new ExperimentListView();
//			/** When selected move to hash **/
//			listView.onSelect.attach(function(sender, selected) {
//				location.hash = "/experiment/experimentId/" + selected[0].experimentId + "/main";
//			});
//			var adapter = loadNavigationPanel(listView);
//			adapter.getExperiments();
//		}
//		
//		if (this.params['navigation'] == "template") {
//			var listView = new TemplateListView();
//			/** When selected move to hash **/
//			listView.onSelect.attach(function(sender, selected) {
//				location.hash = "/experiment/templateId/" + selected[0].experimentId + "/main";
//			});
//			var adapter = loadNavigationPanel(listView);
//			adapter.getByExperimentByKey("experimentType", "TEMPLATE");
//		}
//		
//
//		if (this.params['navigation'] == "macromolecule") {
//			alert("not implemented yet");
//		}
//		
//	}).enter(setPageBackground);
//
//	/** Loading a single session on the navigation panel **/
//	Path.map("#/session/nav/:sessionId/session").to(function() {
//		var listView = new ExperimentListView();
//		/** When selected move to hash **/
//		listView.onSelect.attach(function(sender, selected) {
//			location.hash = "/experiment/experimentId/" + selected[0].experimentId + "/main";
//		});
//		var adapter = loadNavigationPanel(listView);
//		adapter.getExperimentsBySessionId(this.params['sessionId']);
//		
//	}).enter(setPageBackground);
//
//	Path.map("#/experiment/experimentId/:experimentId/main").to(function() {
//			var mainView = new ExperimentMainView();
//			EXI.addMainPanel(mainView);
//			mainView.load(this.params['experimentId']);
//					/** Selecting data collections from experiment **/
//			mainView.onSelect.attach(function(sender, element) {
//					EXI.localExtorage.selectedSubtractionsManager.append(element);
//			});
//			mainView.onDeselect.attach(function(sender, element) {
//					EXI.localExtorage.selectedSubtractionsManager.remove(element);
//			});
//
//	}).enter(setPageBackground);
//	
//	
//	/** Loading Experiments **/
//	Path.map("#/experiment/:key/:value/main").to(function() {
//		var adapter = new DataAdapter();
//		EXI.setLoadingMainPanel();
//		adapter.onSuccess.attach(function(sender, data) {
//			EXI.setLoadingMainPanel(false);
//			if (data != null) {
//				if (data.length > 0) {
//					var mainView = null;
//					if (data[0].experimentType == "STATIC") {
//						mainView = new ExperimentMainView();
//						
//					}
//					if (data[0].experimentType == "HPLC") {
//						mainView = new HPLCMainView();
//					}
//					
//					if (data[0].experimentType == "TEMPLATE") {
//						mainView = new TemplateMainView();
//					}
//					
//					EXI.addMainPanel(mainView);
//					mainView.load(data);
//					/** Selecting data collections from experiment **/
//					mainView.onSelect.attach(function(sender, element) {
//						EXI.localExtorage.selectedSubtractionsManager.append(element);
//					});
//					mainView.onDeselect.attach(function(sender, element) {
//						EXI.localExtorage.selectedSubtractionsManager.remove(element);
//					});
//					
//				}
//			}
//		});
//		if ((this.params['key'] == "experimentId")||(this.params['key'] == "templateId")){
//			adapter.getByExperimentId([this.params['value']]);
//		}
//		else{
//			adapter.getByExperimentByKey(this.params['key'], this.params['value']);
//		}
//		
//
//	}).enter(setPageBackground);
//
//	Path.map("#/tool/crysol/main").to(function() {
//		var mainView = new CrysolMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//
//	
//	Path.map("#/tool/subtraction/main").to(function() {
//		var mainView = new SubtractionMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	Path.map("#/datacollection/:key/:value/main").to(function() {
//		EXI.setLoadingMainPanel();
//		var adapter = new DataAdapter();
//		adapter.onSuccess.attach(function(sender, data) {
//			var mainView = new DataCollectionMainView();
//			EXI.addMainPanel(mainView);
//			mainView.load(data);
//			EXI.setLoadingMainPanel(false);
//			/** Selecting data collections from experiment **/
//			mainView.onSelect.attach(function(sender, element) {
//				EXI.localExtorage.selectedSubtractionsManager.append(element);
//			});
//			mainView.onDeselect.attach(function(sender, element) {
//				EXI.localExtorage.selectedSubtractionsManager.remove(element);
//			});
//		});
//		adapter.getDataCollectionsByKey(this.params['key'], this.params['value']);
//
//	}).enter(setPageBackground);
//
//	
//	Path.map("#/datacollection/:key/:value/primaryviewer").to(function() {
//		var adapter = new DataAdapter();
//		adapter.onSuccess.attach(function(sender, data) {
//			var primaryMainView = new PrimaryDataMainView();
//			EXI.addMainPanel(primaryMainView);
//			primaryMainView.load(data);
//
//		});
//		adapter.getDataCollectionsByKey(this.params['key'], this.params['value']);
//	}).enter(setPageBackground);
//
//	Path.map("#/datacollection/:key/:value/merge").to(function() {
//		var adapter = new DataAdapter();
//		adapter.onSuccess.attach(function(sender, data) {
//			var primaryMainView = new MergeMainView();
//			EXI.addMainPanel(primaryMainView);
//			primaryMainView.load(data);
//
//		});
//		adapter.getDataCollectionsByKey(this.params['key'], this.params['value']);
//	}).enter(setPageBackground);
//
//	Path.map("#/project/:projectId/run/:runId/main").to(function() {
//		var projectId = this.params['projectId'];
//		var runId = this.params['runId'];
//		var exidataAdapter = new ExiDataAdapter();
//		exidataAdapter.onSuccess.attach(function(sender, runs) {
//			for (var i = 0; i < runs.length; i++) {
//				if (runs[i].internalId == runId) {
//					var main = new RunMainView();
//					EXI.addMainPanel(main);
//					main.load(runs[i]);
//				}
//			}
//		});
//		exidataAdapter.getRuns(projectId);
//	}).enter(setPageBackground);
//
//	
//	Path.map("#/prepare/designer/main").to(function() {
//		var mainView = new ExperimentDesignerMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/prepare/buffer/main").to(function() {
//		var mainView = new BufferMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/shipping/:shippingId/main").to(function() {
//		var mainView = new ShippingMainView();
//		var shippindId = this.params['shippingId'];
//		EXI.addMainPanel(mainView);
//		mainView.load(shippindId);
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/prepare/stocksolution/main").to(function() {
//		var mainView = new StockSolutionMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/prepare/macromolecule/main").to(function() {
//		var mainView = new MacromoleculeMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	Path.map("#/prepare/templates/main").to(function() {
//		var mainView = new ExperimentDesignerMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load();
//	}).enter(setPageBackground);
//	
//	Path.map("#/prepare/designer").to(function() {
//		var wizardWidget = new WizardWidget({
//			windowMode : true,
//			width : 1200
//		});
//
//		wizardWidget.onFinished.attach(function(sender, result) {
//			var adapter = new DataAdapter();
//			wizardWidget.window.close();
//			EXI.setLoading();
//			adapter.onSuccess.attach(function(sender, experiment) {
//				location.hash = "/experiment/experimentId/" + experiment.experimentId + "/main";
//			});
//			wizardWidget.current.setLoading("ISPyB: Creating experiment");
//			
//			adapter.saveTemplate(result.name, "comments", result.data);
//		});
//
//		var manager = new ProposalUpdater(); 
//		manager.onSuccess.attach(function(sender, proposals){
//			wizardWidget.draw(this.targetId, new MeasurementCreatorStepWizardForm(ProposalManager.getMacromolecules(), ProposalManager.getBuffers()));
//		});
//		manager.get();
//		
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/welcome/:user/main").to(function() {
//		var user = this.params['shippingId'];
//		var mainView = new WelcomeMainView();
//		EXI.addMainPanel(mainView);
//		mainView.load(user);
//	}).enter(setPageBackground);
//	
//	
//	
//	Path.map("#/login").to(function() {
//		var _this = this;
//		
//		
//		EXI.authenticationForm.show();
//		return;
//		var authenticationForm = new AuthenticationForm();
//		authenticationForm.onAuthenticate.attach(function(sender, args){
//			var authenticationManager = new AuthenticationManager();
//			authenticationManager.onSuccess.attach(function(sender, args){
//				/** This user has been authenticated **/
////				EXI.localExtorage.tokenManager.addToken(args.user, args.token, args.url);
////				debugger
//				EXI.credentialManager.addCredential(args.user, args.roles, args.token, args.url);
////				EXI.mainMenu.addLoggin(args.user,  args.url);
//				authenticationForm.window.close();
//				
//				/** load proposals **/
//				location.hash = "/welcome/" + args.user + "/main";
//				
//				/** Loading projects **/
////				var exidataAdapter = new ExiDataAdapter();
////				exidataAdapter.onSuccess.attach(function(sender, projects){
////					EXI.localExtorage.userManager.setProjects(projects);
////				});
////				exidataAdapter.getUser();
//				
//				/** Loading proposal **/
////				new ProposalUpdater().get(true);
//				
////				window.location.href = 'main.html';
//				
//			});
//			
//			authenticationManager.login(args.user, args.password, args.site);
//			
//		});
//		authenticationForm.show();
//		
//	}).enter(setPageBackground);
//	
//	
//	Path.map("#/logout").to(function() {
//		EXI.credentialManager.logout();
////		if (EXI.localExtorage){
////			EXI.localExtorage.clear();
////		}
////		if (EXI.mainMenu){
////			EXI.mainMenu.setCredentials();
////		}
//		
////		window.location.href = 'main.html';
//		
//	}).enter(setPageBackground);
//	
//	// Here we set a "root route".  You may have noticed that when you landed on this
//	// page you were automatically "redirected" to the "#/users" route.  The definition
//	// below tells PathJS to load this route automatically if one isn't provided.
//	Path.root("#/");
//
//	// The `Path.rescue()` method takes a function as an argument, and will be called when
//	// a route is activated that you have no yet defined an action for.  On this example
//	// page, you'll notice there is no defined route for the "Unicorns!?" link.  Since no
//	// route is defined, it calls this method instead.
//	Path.rescue(notFound);
//	
//	
//};
