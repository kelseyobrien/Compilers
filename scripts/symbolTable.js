/*function SymbolTable(){
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
}*/

function getSymbolTableEntry(id, scope){
	var entry = SymbolTableList[scope][id];
	
	if(entry == undefined && scope != 0){
		entry = getSymbolTableEntry(id, SymbolTableList[scope].parentScope);
	}
	return entry;
}

function setIdentifierAsUsed(id, scope){
	var entry = SymbolTableList[scope][id];
	
	if(!SymbolTableList[scope].hasOwnProperty(id)){
		entry = getSymbolTableEntry(id, scope);
	}
	
	if(entry !== undefined){
		entry.isUsed = true;
	}
}

function checkForUninitializedVariables(){
	for(var i = 0; i < SymbolTableList.length; i++){
		for (symbol in SymbolTableList[i]){
			if(SymbolTableList[i][symbol].value == undefined 
				&& symbol !== "parent scope"){
					var symbolTableEntry = SymbolTableList[i][symbol];
					putMessage("Warning : variable " + symbol + " on line " +
						symbolTableEntry.line + " is uninitialized");
				}
		}
	}
}

function checkforUnusedVariables(){
	for(var i = 0; i < SymbolTableList.length; i++){
		for(symbol in SymbolTableList[i]){
			if(SymbolTableList[i][symbol].isUsed == false){
				var symbolTableEntry = SymbolTableList[i][symbol];
				putMessage("Warning : variable " + symbol + " on line " +
					symbolTableEntry.line + " is unused");
			}
		}
	}
}