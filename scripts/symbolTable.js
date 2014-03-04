function SymbolTable(){
	this.root = new Scope(null);
	this.workingScope = this.root;
	
	this.openScope = function(){
		var newScope = new Scope(this.workingScope);
		this.workingScope.subScopes.push(newScope);
		this.workingScope = newScope;
	}
	
	this.closeScope = function(){
		this.workingScope.parent;
	}
}