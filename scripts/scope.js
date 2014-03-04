//Class to represent a level of scope

function Scope(parent){
	this.parent = parent;
	this.symbols = new Array();
	this.subScopes = new Array();
	
	//Add a symbol to current level of scope
	this.addSymbol = function(symbol){
		if(this.hasId(symbol.id) == false){
			this.symbols.push(symbol)
			return true;
		}
		else{
			return false;
		}
	}
	
	//Check to see if current level of scope has specified id
	this.hasId = function(id, findAll){
		if(this.getSymbol(id, false) != false){
			return true
		}
		else{
			return false;
		}
	}
	
	//Get symbol specified by id
	//If findAll == true search entire symbol table
	//	not just current leve of scope
	this.getSymbol = function(id, findAll){
		if(findAll == undefined){
			findAll = false;
		}
		//Current scope
		var current = this;
		while(current != null){
			for (index in current.symbols){
				if(current.symbols[index].id == id){
					return current.symbols[index]
				}
			}
			if(findAll){
				current = current.parent;
			}
			else{
				worker = null;
			}
		}
		return false;
	}
	
	//Check to see if specified id has already been used
	//Search entire symbol table
	this.usedSymbol = function(id){
		var symbol = getSymbol(id, true);
		if(symbol != false){
			symbol.used = true;
		}
	}
	
	//Check to see if object has been initialized
	this.isInitialized = function(id){
		var symbol = this.getSymbol(id, true);
		if(symbol != false){
			symbol.initialized = true;
		}
	}
}