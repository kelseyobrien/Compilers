function semanticAnalysis(){
	putMessage("Creating symbol table");
	putMessage("...and some type checking");
	putMessage("--------------------------");
	var scopeManager = new ManageScope();
	createSymbolTable(AST.root);
	printSymbolTable();
	
	function scopeCheck(){
		
	}
	
	function createSymbolTable(node){
		if(node.name === "Block"){
			scopeManager.initializeNewScope();
			for (var i = 0; i < node.children.length; i++){
				createSymbolTable(node.children[i]);
			}
			scopeManager.leaveCurrentScope();
		}
		else if (node.name === "VarDecl")
		{
			var type = node.children[0].name;
			var id = node.children[1].name.substr(-1);
			var line = node.children[1].getLine();
			
			var scope = scopeManager.currentScope;
			
			//Check for redeclaration
			if(SymbolTableList[scope].hasOwnProperty(id)){
				putMessage("Error: redeclaration of variable " + id 
					+ " on line " + line);
			}
			else{
				putMessage("Adding id: " + id + " on line "+ line + " to symbol table in scope " + scope);
				SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope,
					"isUsed": false};
			}
		}
		else if(node.name === "AssignmentStatement"){
			//Get Id that is in R child
			var id = node.children[0].name.substr(-1);
			var scope = scopeManager.currentScope;
			//Id is undeclared
			if(!SymbolTableList[scope].hasOwnProperty(id)){
					putMessage("Error: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
					semanticErrorCount++;
			}
			else{
				var symbol = getSymbolTableEntry(id, scope);
				//If id is of type int the R child can be a +
				if(symbol.type == "int" && node.children[1].name == "+"){
					createSymbolTable(node.children[1]);
					var intExpr = addIntExpr(node.children[1]);
					symbol.value = parseInt(intExpr);
					setIdentifierAsUsed(id, scope);
				}
				else if(symbol.type == "int" && R_DIGIT.test(parseInt(node.children[1].name))){
					symbol.value = parseInt(node.children[1].name);
					setIdentifierAsUsed(id, scope);
				}
				else if(symbol.type == "string" && node.children[1].name.substr(0,1) == '\"'){
					symbol.value = node.children[1].name;
					setIdentifierAsUsed(id, scope);
				}
				else if(symbol.type == "boolean" && (node.children[1].name == "true" ||
													node.children[1].name == "false")){
					symbol.value = node.children[1].name;
					setIdentifierAsUsed(id, scope);
				}
				else if(symbol.type == "boolean" && (node.children[1].name == "==" ||
													node.children[1].name == "!=")){
					createSymbolTable(node.children[1]);
					var booleanExpr = addBooleanExpr(node.children[1]);
					symbol.value = booleanExpr;
					setIdentifierAsUsed(id, scope);
				}
				else{
					putMessage("Error: type mismatch with id " + node.children[0].name.substr(-1) +
						" of type " + symbol.type + " on line " + node.children[0].getLine());
				}
				
			}
		}
		else if(node.name == "Print"){
			//TO DO: CHECK TO SEE IF ID IS INITIALIZED
			var scope = scopeManager.currentScope;
			if(node.children[0].name.substr(0,2) == "Id"){
				var id = node.children[0].name.substr(-1);
				if(!SymbolTableList[scope].hasOwnProperty(id)){
						putMessage("Error: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
						semanticErrorCount++;
				}
				else{
					setIdentifierAsUsed(id, scope);
				}
			}
		}
		else if(node.name == "If"){
			if(node.children[0].name == "==" || node.children[1].name == "!="){
				createSymbolTable(node.children[0]);
			}
		}
		else if(node.name == "While"){
			if(node.children[0].name == "==" || node.children[1].name == "!="){
				createSymbolTable(node.children[0]);
			}
		}
		else if (node.name == "+"){
			if(node.children[1].name == "+"){
				createSymbolTable(node.children[1]);
			}
			else {
				putMessage("Error: can't add non int " + node.children[1].name 
					+ " on line " + node.children[1].getLine());
				semanticErrorCount++;
			}
		}
		
		
		
	}
	
	/*function createSymbolTable(){
		putMessage("Creating symbol table");
		putMessage("...and some type checking");
		putMessage("--------------------------");
		var scopeManager = new ManageScope();
		var scopeOpened = false;
		var parentValue;
		var intExprValue;
		var closeScope = false;
		
		function traverseAST(node, depth){
			if(node.children == null || node.children.length === 0){
				var subNodeName = node.name.substring(0, 2);
				if(subNodeName === "Id"){
					if(parentValue === "Print"){
						var id = node.name.substr(-1);
						scope = scopeManager.currentScope;
						if(getSymbolTableEntry(id, scope)){
							setIdentifierAsUsed(id, scope);
						}
						else{
							putMessage("Error: undeclared id "+ id + " on line " + node.getLine());
							semanticErrorCount++;
						}
					}
				}
			}
			ele{
				if(node.name === "Block"){
					scopeManager.initializeNewScope();
					/*if(scopeOpened === false){
						scopeOpened = true;
						scopeManager.initializeNewScope();
					}
					else if (scopeOpened){
						scopeManager.leaveCurrentScope();
						
						scopeManager.initializeNewScope();
					}
					
				}
				else if(node.name === "Print"){
					parentValue = "Print";
				}
				else if(node.name === "AssignmentStatement"){
					addAssignment(node);
				}
				else if(node.name === "VarDecl"){
					addVarDecl(node);
				}
				for (var i = 0; i < node.children.length; i++){
					if(node.name === "Block" && i != 0 && i != (node.children.lengh-1)){
					alert(node.name);
					alert(node.getLine());
					alert("middle child");
					}
					traverseAST(node.children[i], depth + 1);
				}
			}
			//Close last scope
			//scopeManager.leaveCurrentScope();
			
			semanticErrorCount = -1;
		}
		
		function addAssignment(node){
			var scope = scopeManager.currentScope;
			//Id is left child of assinment statement
			//Get specific ID and line
			var id = node.children[0].name.substr(-1);
			var line = node.children[0].getLine();
			intExprValue = 0;
			var entry = getSymbolTableEntry(id, scope);
			
			//If entry = undefined ... undeclard variable
			if(entry != undefined){
				//If R child is + call addIntExpr
				if(node.children[1].name === "+"){
					if(entry.type === "int"){
						var intopNode = node.children[1];
						//left child is always a digit
						var int1 = parseInt(intopNode.children[0].name);
						intExprValue = intExprValue + int1;
						//If right child is + add another intExpr
						if(intopNode.children[1].name === "+"){
							addIntExpr(intopNode.children[1]);
						}
						else if(R_DIGIT.test(parseInt(intopNode.children[1].name))){
							//R child is a digit so add to intExprValue
							intExprValue = intExprValue + parseInt(intopNode.children[1].name);
							
						}
						//R child is id of type int
						else if(intopNode.children[1].name.substr(0,2)){
							var childId = intopNode.children[1].name.substr(-1);
							var getChild = getSymbolTableEntry(id, scope);
							if(getChild && getChild.type == "int"){
								intExprValue = intExprValue + parseInt(getChild.value);
							}
						}
						else{
							putMessage("Error: cannot perform integer operation with object " + intopNode.children[1].name +" on " 
							+ id + " of type "+ entry.type);
							semanticErrorCount++;
						}
						
						var symbolTableEntry = getSymbolTableEntry(id, scope);
					
						if(symbolTableEntry){
							symbolTableEntry.value = intExprValue;
							setIdentifierAsUsed(id, scope);
						}
						else{
							putMessage("Error: assignment attempted on undeclared variable " 
								+ id + " on line " + line);
						}
					}
					else{
						putMessage("Error: cannot perform integer operation on " 
							+ id + " of type "+ entry.type);
						semanticErrorCount++;
					}
				}
				//R child is just a digit
				else if(R_DIGIT.test(parseInt(node.children[1].name))){
					if(entry.type === "int"){
						intExprValue = parseInt(node.children[1].name);
						
						var symbolTableEntry = getSymbolTableEntry(id, scope);
						if(symbolTableEntry){
							symbolTableEntry.value = intExprValue;
							setIdentifierAsUsed(id, scope);
						}
						else{
							putMessage("Error: assignment attempted on undeclared variable " 
								+ id + " on line " + line);
						}
					}
					else{
						putMessage("Error: cannot assign integer value to id " 
							+ id + " of type "+ entry.type);
						semanticErrorCount++;
					}
				}
				//R child is a string epression
				else if(node.children[1].name.substr(0,1) === '\"'){
					if(entry.type === "string"){
						var symbolTableEntry = getSymbolTableEntry(id, scope);
					
						if(symbolTableEntry){
							symbolTableEntry.value = node.children[1].name;
							setIdentifierAsUsed(id, scope);
						}
						else{
							putMessage("Error: assignment attempted on undeclared variable " 
								+ id + " on line " + line);
						}
					}
					else {
						putMessage("Error: cannot assign string value to id " 
							+ id + " of type "+ entry.type);
						semanticErrorCount++;
					}
				}
				//R child is boolean value
				else if(node.children[1].name =="true" || node.children[1].name == "false"){
					//Have to check type and add it to the symbol table
					if(entry.type === "boolean"){
						var symbolTableEntry = getSymbolTableEntry(id, scope);
					
						if(symbolTableEntry){
							symbolTableEntry.value = node.children[1].name;
							setIdentifierAsUsed(id, scope);
						}
						else{
							putMessage("Error: assignment attempted on undeclared variable " 
								+ id + " on line " + line);
						}
					}
					else {
						putMessage("Error: cannot assign boolean value to id " 
							+ id + " of type "+ entry.type);
						semanticErrorCount++;
					}
				}
				else if(node.children[1].name.substr(0,2) == "Id"){
					var id2 = node.children[1].name.substr(-1);
					
					var id2Entry = getSymbolTableEntry(id2, scopeManager.currentScope);
					if(entry.type == id2Entry.type){
						if(id2Entry.value == undefined || id2Entry.value == null){
							//Uninitialized variable...gotta handle that somehow
						}
						else{
							var symbolTableEntry = getSymbolTableEntry(id, scope);
						
							if(symbolTableEntry){
								symbolTableEntry.value = id2Entry.value;
								setIdentifierAsUsed(id, scope);
							}
							else{
								putMessage("Error: assignment attempted on undeclared variable " 
									+ id + " on line " + line);
								semanticErrorCount++;
							}
						}
					}
					else{
						putMessage("Error: type mismatch. Can not assign id " + id2 + " of type "
									+ id2Entry.type + " to id " + id + " of type " + entry.type);
						semanticErrorCount++;
					}
				}
			}
			else{
				putMessage("Error: assignment attempted on undeclared variable " 
									+ id + " on line " + line);
				semanticErrorCount++;
			}
			
		}
		
		function addVarDecl(node){
			var type = node.children[0].name;
			var id = node.children[1].name.substr(-1);
			var line = node.children[1].getLine();
			
			var scope = scopeManager.currentScope;
			
			//Check for redeclaration
			if(SymbolTableList[scope].hasOwnProperty(id)){
				putMessage("Error: redeclaration of variable " + id 
					+ " on line " + line);
			}
			else{
				putMessage("Adding id: " + id + " on line "+ line + " to symbol table in scope " + scope);
				SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope,
					"isUsed": false};
			}
		}
		
		function addIntExpr(node){
			alert("in int expr");
			//Left child will always be digit
			var int1 = parseInt(node.children[0].name);
			//if right child is + call another int expr
			if(node.children[1].name === "+"){
				intExprValue = intExprValue + 1;
				addIntExpr(node.children[1]);
			}
			else if(R_DIGIT.test(parseInt(node.children[1].name))){
				var int2 = parseInt(node.children[1].name) + int1;
				intExprValue = intExprValue + int2;
			}
			else if(node.children[1].name.substr(0,1) === '\"'){
				alert("string");
			}
		}
		
		function printSymbolTable(){
			putMessage("-----------------");
			putMessage("Symbol Table");
			putMessage("-----------------");
			for(var i = 0; i < SymbolTableList.length; i++){
				var currentTable = SymbolTableList[i];
				for(var symbol in currentTable)
				{
					if(currentTable.hasOwnProperty(symbol) && symbol != "parentScope"){
						putMessage(symbol + ": value - " + currentTable[symbol].value +
											", type - " + currentTable[symbol].type +
											", scope - " + currentTable[symbol].scope +
											", line - " + currentTable[symbol].line);
					}
				}
			}
			
		}
		
		//Initial call
		traverseAST(AST.root, 0);
		printSymbolTable();
		
	}*/
	function addIntExpr(node){
		var intExpr = parseInt(node.children[0].name);
		/*while(node.children[1].name != "+"){
			node = node.children[1];
			intExpr = intExpr + parseInt(node.children[0].name);
		}
		
		intExpr = intExpr + parseInt(node.children[1].name);
	
		return intExpr;*/
		while(node.children[1].name == "+"){
			node = node.children[1];
			intExpr = intExpr + parseInt(node.children[0].name);
		}
		intExpr = intExpr + parseInt(node.children[1].name);
		
		return intExpr;
	}
	
	function addBooleanExpr(node){
		var boolExpr = node.children[0].name;
		
		while(node.children[1].name == "==" || node.children[1].name == "!="){
			node = node.children[1];
			boolExpr = boolExpr + node.children[0].name + node.children[1].name;
		}
		boolExpr = boolExpr + node.children[1].name;
		
		return boolExpr;
	}
	
	function printSymbolTable(){
		putMessage("-----------------");
		putMessage("Symbol Table");
		putMessage("-----------------");
		for(var i = 0; i < SymbolTableList.length; i++){
			var currentTable = SymbolTableList[i];
			for(var symbol in currentTable)
			{
				if(currentTable.hasOwnProperty(symbol) && symbol != "parentScope"){
					putMessage(symbol + ": value - " + currentTable[symbol].value +
										", type - " + currentTable[symbol].type +
										", scope - " + currentTable[symbol].scope +
										", line - " + currentTable[symbol].line);
				}
			}
		}
			
	}
}