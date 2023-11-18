function ProgressBar(){}

ProgressBar.prototype.getPanel = function(done, total){
	var percentage = (parseFloat(done)/parseFloat(total))*100;
	
	var color = '#337ab7';
	
	if (percentage == 100){
		color = 'green';
	}
	
	if (percentage < 50){
		color = 'orange';
	}
	return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='10' aria-valuemin='0' aria-valuemax='100' style='background-color:"+ color + ";width:" + percentage + "%'></div></div>";
	
};