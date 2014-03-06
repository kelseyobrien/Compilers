function SymbolTable(){
	this.root = new Scope(null);
	this.workingScope = this.root;
	
	this.openScope = function(){
		var newScope = new Scope(this.workingScope);
		this.workingScope.subScopes.push(newScope);
		this.workingScope = newScope;
		putMessage("------------");
		putMessage("Opened Scope");
		putMessage("------------");
	}
	
	this.closeScope = function(){
		this.workingScope.parent;
		putMessage("------------");
		putMessage("Closed Scope");
		putMessage("------------");
	}
	
	this.addIdentifier = function(id, type){
		var symbol = new Symbol(id, type);
		var symToAdd = this.workingScope.addSymbol(symbol);
		
		if(symToAdd){
			putMessage("Identifier: " + symbol.id + " | " + symbol.type + ' on line ' + symbol.line);
		}
		return symToAdd;
	}
}