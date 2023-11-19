     Ext.define('Ext.Extended.RequiredTextField', {
	          extend: 'Ext.form.field.Text',
	          alias: 'widget.requiredtextfield',
	          alternateClassName: ['Ext.Extended.RequiredTextField'],
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