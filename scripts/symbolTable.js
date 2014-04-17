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
