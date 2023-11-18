function OfflineExiController() {
	this.init();
}

OfflineExiController.prototype.setPageBackground = function() {

};

OfflineExiController.prototype.notFound = function() {

};

OfflineExiController.prototype.init = function() {
	var _this = this;

		function setPageBackground() {
			_this.setPageBackground();
		}
		function notFound() {
			_this.notFound();
		}


		Path.map("#/tool/dimple/main").to(function() {
			var mainView = new DimpleMainView();
			EXI.addMainPanel(mainView);
			mainView.load();
		}).enter(this.setPageBackground);
        
          Path.map("#/tool/dimple/datacollection/:dataCollectionId/main").to(function() {
			var mainView = new DimpleDCMainView();
			EXI.addMainPanel(mainView);
			mainView.load(this.params['dataCollectionId']);
		}).enter(this.setPageBackground);
        
        Path.map("#/tool/reprocess/datacollection/:dataCollectionId/:startImage/:endImage/main").to(function() {
			var mainView = new ReprocessMainView();
			EXI.addMainPanel(mainView);
			mainView.load(this.params['dataCollectionId'],this.params['startImage'],this.params['endImage']);
		}).enter(this.setPageBackground);
        
		
		
		Path.map("#/tool/crysol/main").to(function() {
			var mainView = new CrysolMainView();
			EXI.addMainPanel(mainView);
			mainView.load();
		}).enter(this.setPageBackground);

		Path.map("#/tool/subtraction/main").to(function() {
			var mainView = new SubtractionMainView();
			EXI.addMainPanel(mainView);
			mainView.load();
		}).enter(this.setPageBackground);
		
		Path.map("#/tool/list").to(function() {
			var project = null;
			var listView = new RunListView();
			/** When selected move to hash * */
			listView.onSelect.attach(function(sender, selected) {
				var runId = selected[0].internalId;
				var projectId = project.internalId;
				if (selected[0].tool == "Dimple"){
					location.hash = "/project/" +projectId + "/dimple/" + runId + "/main";
				}
				else{
					location.hash = "/project/" +projectId + "/run/" + runId + "/main";
				}
			});

			/** Cleaning up navigation panel * */
			EXI.clearNavigationPanel();
			EXI.setLoadingNavigationPanel(true);

			
			var onSuccess = function(sender, data) {
				project = data[0];
				/** Load panel * */
				EXI.addNavigationPanel(listView);
				/** Load data * */
				listView.load(data[0].runs.reverse());
				EXI.setLoadingNavigationPanel(false);
			};
			
			/** Handle error * */
			var onError = function(sender, data) {
				EXI.setLoadingNavigationPanel(false);
			};
			
			EXI.getDataAdapter({onSuccess : onSuccess, onError :onError}).exi.offline.getProject();
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
		var onError = function(sender) {
			BUI.showError("There was an error");
		};
		
		EXI.getDataAdapter({onSuccess : onSuccess, onError :onError}).exi.offline.getRuns(projectId);
	}).enter(this.setPageBackground);


	Path.map("#/project/:projectId/dimple/:runId/main").to(function() {
		var projectId = this.params['projectId'];
		var runId = this.params['runId'];

		var onSuccess = function(sender, runs) {
			for (var i = 0; i < runs.length; i++) {
				if (runs[i].internalId == runId) {
					var main = new DimpleRunMainView();
					EXI.addMainPanel(main);
					main.load(runs[i]);
				}
			}
		};
		var onError = function(sender) {
			BUI.showError("There was an error");
		};
		
		EXI.getDataAdapter({onSuccess : onSuccess, onError :onError}).exi.offline.getRuns(projectId);
	}).enter(this.setPageBackground);
	
	Path.rescue(notFound);

};
