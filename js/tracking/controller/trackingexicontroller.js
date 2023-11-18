function TrackingExiController() {  
	this.init();
}

TrackingExiController.prototype.loadNavigationPanel = ExiController.prototype.loadNavigationPanel;

TrackingExiController.prototype.init = function() {
	var _this = this;

	function setPageBackground() {
		_this.setPageBackground();
	}
	function notFound() {
		_this.notFound();
	}
	
    /** Loading a single session on the navigation panel * */
	Path.map("#/test").to(function() {
       alert("test");
	}).enter(this.setPageBackground);    
	
	Path.rescue(notFound);

};
