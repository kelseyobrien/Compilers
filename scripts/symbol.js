//Class to represent a single symbol to be used in the symbol table

var Symbol = function(tokenID, tokenType){
	this.used = false;
	this.initialized = false;
	
	 Object.defineProperty(this, 'id', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return tokenID.value;
        }
    });
    
    Object.defineProperty(this, 'type', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return tokenType.type;
        }
    });
    
    Object.defineProperty(this, 'line', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return tokenID.line;
        }
	});
}