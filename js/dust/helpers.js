dust.helpers.decimal = function(chunk, context, bodies, params) {   
    if (params.key){
        var value = context.current()[params.key];
        if (params.key.split(".").length > 1) {
            var keys = params.key.split(".");
            value = context.current()[keys[0]][keys[1]];
        }
        
        if (value != null){
            if (params.decimals != null){
                try{
                        if (params.intIfPossible){
                            if (parseInt(Number(value)) == Number(value)) {
                                chunk.write(parseInt(Number(value)));
                            } else {
                                chunk.write(Number(value).toFixed(params.decimals));
                            }
                        } else {
                            chunk.write(Number(value).toFixed(params.decimals));
                        }
                }
                catch(e){
                    
                    /** There was an error, we leave same value */
                    chunk.write(context.current()[params.key]);    
                }
            }
            else{
                /** No decimals then same value */
                chunk.write(context.current()[params.key]);
            }
        }
    }
    else{
        chunk.write('WARN: NO KEY SET');
    }
    return chunk;
};

dust.helpers.multiply = function(chunk, context, bodies, params) {
    if (params.key){
        
        var value = context.current()[params.key];
        if (params.key.split(".").length > 1) {
            var keys = params.key.split(".");
            value = context.current()[keys[0]][keys[1]];
        }
        if (value){
            if (params.parameter != null){
                try{
                        if (params.intIfPossible){
                            if (parseInt(Number(value)) == Number(value)) {
                                chunk.write(parseInt(Number(value)*params.parameter));
                            } else {
                                chunk.write(Number(value)*params.parameter);
                            }
                        } else {
                            chunk.write(Number(value)*params.parameter);
                        }
                }
                catch(e){
                    
                    /** There was an error, we leave same value */
                    chunk.write(context.current()[params.key]);    
                }
            }
            else{
                /** No decimals then same value */
                chunk.write(context.current()[params.key]);
            }
        }
    }
    else{
        chunk.write('WARN: NO KEY SET');
    }
    return chunk;
};


dust.helpers.trim = function (chunk, context, bodies, params) {
    if (params.key) {
        var value = context.current()[params.key];
        if (value){
            if (value.trim() != "") {
                chunk.write(value);
            }
        }
    }
    else{
        chunk.write('WARN: NO KEY SET');
    }
    return chunk;
}

dust.helpers.sizeOf = function(chunk, context, bodies, params) {
  var value = this.size(chunk, context, bodies, params);
  return (bodies && bodies.block) ? chunk.render(bodies.block, context.push({ isSelect: true, isResolved: false, selectKey: value })) : value;
};

dust.helpers.exponential = function(chunk, context, bodies, params) {
    if (params.key){            
        var value = context.current()[params.key];
        if (value){
            if (params.decimals != null){
                try{
                        chunk.write(Number(Number(value).toFixed(params.decimals)).toExponential());
                }
                catch(e){
                    
                    /** There was an error, we leave same value */
                    chunk.write(context.current()[params.key]);    
                }
            }
            else{
                /** No decimals then same value */
                chunk.write(context.current()[params.key]);
            }
        }
        
    }
    else{
        chunk.write('WARN: NO KEY SET');
    }
        return chunk;
    
};

dust.helpers.mmVolTest = function(chunk, context, bodies, params) {      
    var value = context.current()["Subtraction_volume"];
    if (value){
        try{
                chunk.write(Number(value / 2).toFixed(1) + " - " + Number(value / 1.5).toFixed(1));
        }
        catch(e){
            
            /** There was an error, we leave same value */
            chunk.write(context.current()[params.key]);    
        }
    }
    return chunk;
    
};


dust.helpers.framesColor = function(chunk, context, bodies, params) {          
    var merge = context.current()["Merge_framesMerge"];
    var count = context.current()["Merge_framesCount"];
    var color = "undefined";
    if (merge == null || count == null) {
        color = "orange";
    } else {
        if (merge/count >= 0.3) {
            color = "orange";
        }
        if (merge/count >= 0.7) {
            color = "undefined";
        }
        if (merge/count < 0.3) {
            color = "red"
        }
    }
    try{
            chunk.write(color);
    }
    catch(e){
        
        /** There was an error, we leave same value */
        chunk.write(context.current()[params.key]);    
    }
    return chunk;
    
};

dust.helpers.fileName = function (chunk, context, bodies, params) {    
    debugger
    var filePath = context.current()[params.key];
    if (filePath) {
        try{
            var withExtension = filePath.substring(filePath.lastIndexOf('/')+1);
            chunk.write(withExtension.substring(0,withExtension.indexOf(".")));
        }
        catch(e){
            /** There was an error, we leave same value */
            chunk.write(context.current()[params.key]);    
        }
    }
    return chunk;
}

dust.helpers.formatDate = function (chunk, context, bodies, params) {    
    if (params.date) {       
            if (params.format != null) {
                try {
                    formatted = moment(new Date(params.date)).format(params.format);
                    chunk.write(formatted);
                } catch (e) {
                    chunk.write(params.date);
                }
            } else {
                chunk.write(params.date);
            }
        
    }
    return chunk;
}

dust.helpers.formatDateTime = function (chunk, context, bodies, params) {
    var raw = params.value;
    if (!raw) return chunk.write('');

    var d = new Date(raw);
    if (isNaN(d)) return chunk.write('');

    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    var yyyy = d.getFullYear();

    var hh = ("0" + d.getHours()).slice(-2);
    var min = ("0" + d.getMinutes()).slice(-2);
    var ss = ("0" + d.getSeconds()).slice(-2);

    var formatted = mm + "/" + dd + "/" + yyyy +
        " " + hh + ":" + min + ":" + ss;

    return chunk.write(formatted);
};

dust.helpers.calculateDuration = function (chunk, context, bodies, params) {

    var startRaw = params.start;
    var endRaw = params.end;

    if (!startRaw || !endRaw) {
        return chunk.write('');
    }

    var start = new Date(startRaw);
    var end = new Date(endRaw);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return chunk.write('');
    }

    var diffMs = end - start;

    if (diffMs < 0) {
        return chunk.write('');
    }

    var totalSeconds = Math.floor(diffMs / 1000);

    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    var result = hours + "h " + minutes + "m " + seconds + "s";

    return chunk.write(result);
};

dust.helpers.uppercase = function (chunk, context, bodies, params) {
    if (params.key) {
        var value = context.current()[params.key];
        if (value){
            chunk.write(value.toUpperCase());
        }
    }
    else{
        chunk.write('WARN: NO KEY SET');
    }
    return chunk;
}

dust.helpers.wavelengthToEnergy = function (chunk, context, bodies, params) {
    if (params.key) {        
        var value = context.current()[params.key];
        if (value){
            chunk.write((Number(12.398/value).toFixed(3))); 
        }
        else{
            chunk.write('NA');    
        }
    }
    else{
        chunk.write('NA');
    }
    return chunk;
}


dust.helpers.getIndexByCommaSeparator = function (chunk, context, bodies, params) {
    if (params.key) {        
        var value = context.current()[params.key];
        if (value){
            if (params.decimals){
                chunk.write(Number(value.split(",")[params.index]).toFixed(params.decimals));
            }
            else{
                chunk.write(value.split(",")[params.index]); 
            }
        }
        else{
            chunk.write('NA');    
        }
    }
    else{
        chunk.write('NA');
    }
    return chunk;
}


dust.helpers.getFileName = function (chunk, context, bodies, params) {
    
    if (params.key) {        
        var value = context.current()[params.key];
        if (value){           
           chunk.write(value.replace(/^.*[\\\/]/, ''));            
        }
       
    }
    else{
        chunk.write('NA');
    }
    return chunk;
}