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
				putWarnings("Warning : variable " + symbol + " on line " +
					symbolTableEntry.line + " is unused");
			}
		}
	}
}