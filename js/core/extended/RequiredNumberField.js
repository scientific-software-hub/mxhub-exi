     Ext.define('Ext.Extended.RequiredNumberField', {
	          extend: 'Ext.form.field.Number',
	          alias: 'widget.requirednumberfield',
	          alternateClassName: ['Ext.Extended.RequiredNumberField'],
	          config : {
	      		cls : 'custom-field-text-required'
	      	},
	      	checkChange : function() {
	      		if ((this.getValue() == null) || String(this.getValue()).length == 0) {
	      			this.addCls('custom-field-text-required');
	      		} else {
	      			this.removeCls('custom-field-text-required');
	      		}
	      	}
	      });