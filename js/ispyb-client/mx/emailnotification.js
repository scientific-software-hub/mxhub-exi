/**
 *
 * @class EmailNotification
 * @constructor
 */
function EmailNotification(args){
    DataAdapter.call(this, Exi.prototype.appendDataAdapterParameters(args));//same as 'class EmailNotification extends DataAdapter'
}

// EmailNotification.prototype.appendDataAdapterParameters = Exi.prototype.appendDataAdapterParameters;
EmailNotification.prototype.get = DataAdapter.prototype.get;
EmailNotification.prototype.post = DataAdapter.prototype.post;
EmailNotification.prototype.getUrl = DataAdapter.prototype.getUrl;



/**
 * @method sendEmailNotification
 */
EmailNotification.prototype.sendEmailNotification = function({recipientEmail, subject, msgBody}){
    const url = '/{token}/send';
    this.post(url, {recipientEmail, subject, msgBody});
};
