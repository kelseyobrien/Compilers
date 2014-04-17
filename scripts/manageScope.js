function ManageScope()
{
	this.currentScope = 0;
	this.previousScopeList = [];
	
	this.initializeNewScope = function(){
		this.previousScopeList.push(this.currentScope);
		var previousScope = this.currentScope;
		this.currentScope = this.getNextScope();
		putMessage("-- Opening scope " + this.currentScope + " --");
		SymbolTableList[this.currentScope] = {"parentScope": previousScope};
	}
	
	this.leaveCurrentScope = function(){
		putMessage("-- Closing scope " + this.currentScope + " --");
		this.currentScope = this.previousScopeList.pop();
	}

	this.getNextScope = function(){
		var nextScope = 0;
		
		for(var i = 0; i < SymbolTableList.length; i++){
			nextScope++;
		}
		return nextScope;
	}
}
