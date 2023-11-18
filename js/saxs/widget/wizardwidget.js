/**
 * It contains a set of form that we will communicate each other up to status finish is reached
 * 
 */
function WizardWidget(args) {
	this.targetId = null;
	this.width = 910;
	this.height = 400;
	this.windowMode = true;

	if (args != null) {
		if (args.windowMode != null) {
			this.windowMode = args.windowMode;
		}
		if (args.width != null) {
			this.width = args.width;
		}

	}

	this.step = 0;
	this.forms = [];

	this.onFinished = new Event(this);
}

WizardWidget.prototype.draw = function(targetId, form) {
	this.targetId = targetId;
	this.forms.push(form);
	this.renderMasterContainer();
};

WizardWidget.prototype.getButtons = function(step, onNext, onBack) {
	var _this = this;

	/** For the last step **/
	if (_this.forms[_this.step].onWizardFinished != null) {
		return [ {
			text : 'Back',
			handler : function() {
				_this.step = _this.step - 1;
				_this.renderMasterContainer();
				onBack();
				_this.forms[_this.step].reload();
			}
		}, "->", {
			text : 'Next',
			handler : function() {
				_this.forms[_this.step].onWizardFinished.attach(function(sender, result) {
					_this.onFinished.notify(result);
				});
//				_this.step = _this.step + 1;
				onNext();
			}
		} ];
	}

	/** First **/
	if (step == 0) {
		return [ "->", {
			text : 'Next',
			handler : function() {
				_this.forms.push(_this.forms[_this.step].getNextForm());
				_this.step = _this.step + 1;
				_this.renderMasterContainer();
				onNext(_this.forms[_this.step - 1].data);
			}
		} ];
	}

	if ((this.step > 0) && (this.forms[_this.step].onWizardFinished == null)) {
		return [ {
			text : 'Back',
			handler : function() {
				_this.step = _this.step - 1;
				_this.renderMasterContainer();
				onBack();
				_this.forms[_this.step].reload();
			}
		}, "->", {
			text : 'Next',
			handler : function() {
				if (_this.forms[_this.step].onWizardFinished == null) {
					_this.forms.push(_this.forms[_this.step].getNextForm());
					_this.step = _this.step + 1;
					onNext(_this.forms[_this.step - 1].data);
					_this.renderMasterContainer();
				} else {
					_this.forms[_this.step].onWizardFinished.attach(function(sender, result) {
						_this.window.close();
						_this.onFinished.notify(result);
					});
					_this.step = _this.step + 1;
					onNext(_this.forms[_this.step - 1].data);
				}
			}
		} ];
	}

};


WizardWidget.prototype.getPanel = function(form) {
	this.forms.push(form);
	
	return Ext.create('Ext.form.Panel', {
		width : this.width,
		height : 800,
		items : [  this.forms[this.step].getForm() ],
		buttons : this.getButtons(this.step, this.forms[this.step].onNext, this.forms[this.step].onBack)
	});
};

WizardWidget.prototype.renderMasterContainer = function() {
	var _this = this;

	if (this.current != null) {
		this.current.destroy();
	}
	if (this.window != null) {
		this.window.destroy();
	}
	this.current = this.getPanel();

	if (this.windowMode == false) {
		this.current.render(this.targetId);
	} else {

		this.window = Ext.create('Ext.Window', {
			id : this.id,
			resizable : true,
			constrain : true,
			modal : true,
			frame : false,
			draggable : true,
			autoscroll : true,
			layout : {
				type : 'vbox',
				align : 'stretch'
			},
			items : this.current,
			width : this.width,
			title : "BIOSAXS Experiment Designer",
			listeners : {
				scope : this,
				minimize : function() {
					this.panel.hide();
				},
				destroy : function() {
					delete this.panel;
				}
			}
		});

		this.window.show();
	}
};
