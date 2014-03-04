//Class to represent a single symbol to be used in the symbol table

function Symbol(tokenID, tokenType){
	this.used = false;
	this.initialized = false;
	
	 Object.defineProperty(this, 'id', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return idToken.value;
        }
    });
    
    Object.defineProperty(this, 'type', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return typeToken.type;
        }
    });
    
    Object.defineProperty(this, 'line', {
        writeable       : false,
        enumerable      : false,
        get             : function() {
            return idToken.line;
        }
	}
	}};
}