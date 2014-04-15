function semanticAnalysis(){
	var scopeManager = new ManageScope();
	if(semanticErrorCount === 0){
		putMessage("Creating symbol table");
		putMessage("And some scope checking");
		putMessage("...and some type checking at the same time.");
		putMessage("--------------------------");
		createSymbolTable(AST.root);
	}
	
	if(semanticErrorCount === 0){
		printSymbolTable();
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
			
			//Check for redeclaration in current scope
			putMessage("Checking for redeclaration of id " + id + " in current scope.");
			if(SymbolTableList[scope].hasOwnProperty(id)){
				putMessage("Error: redeclaration of variable " + id 
					+ " on line " + line);
					semanticErrorCount++;
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
			//If Id is not in current scope for parent scope...undeclared
			putMessage("Checking for declaration of id " + id + " in current or parent scope.");
			if(!SymbolTableList[scope].hasOwnProperty(id) && !getSymbolTableEntry(id, scope)){
					putMessage("Error: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
					semanticErrorCount++;
			}
			//Id declared...proceed
			else{
				var symbol = getSymbolTableEntry(id, scope);
				//If id is of type int the R child can be a +
				if(symbol.type == "int" && node.children[1].name == "+"){
					createSymbolTable(node.children[1]);
					
					//Evaluate intExpr & return value
					var intExpr = addIntExpr(node.children[1]);
					symbol.value = parseInt(intExpr);
					setIdentifierAsUsed(id, scope);
				}
				//Id is of type int and the R child of the assignment statement is intExpr
				else if(symbol.type == "int" && R_DIGIT.test(parseInt(node.children[1].name))){
					symbol.value = parseInt(node.children[1].name);
					setIdentifierAsUsed(id, scope);
				}
				//Id is a string and R child of assignment statement is valid string 
				else if(symbol.type == "string" && node.children[1].name.substr(0,1) == '\"'){
					symbol.value = node.children[1].name;
					setIdentifierAsUsed(id, scope);
				}
				//Id is a boolean and R child of assignment statement is boolean value
				else if(symbol.type == "boolean" && (node.children[1].name == "true" ||
													node.children[1].name == "false")){
					symbol.value = node.children[1].name;
					setIdentifierAsUsed(id, scope);
				}
				//Id is a boolean and R child is boolean expr
				else if(symbol.type == "boolean" && (node.children[1].name == "==" ||
													node.children[1].name == "!=")){
					createSymbolTable(node.children[1]);
					var booleanExpr = addBooleanExpr(node.children[1]);
					symbol.value = booleanExpr;
					setIdentifierAsUsed(id, scope);
				}
				else{
					//Type mismatch between id in L child and expr in right child
					putMessage("Error: type mismatch with id " + node.children[0].name.substr(-1) +
						" of type " + symbol.type + " on line " + node.children[0].getLine());
					semanticErrorCount++;
				}
				
			}
		}
		else if(node.name == "Print"){
			var scope = scopeManager.currentScope;
			//Check to see if Id
			if(node.children[0].name.substr(0,2) == "Id"){
				var id = node.children[0].name.substr(-1);
				var tableEntry = getSymbolTableEntry(id, scope);
				
				//If id is not declared in current scope or parent
				putMessage("Checking for declaration of id " + id + " in current or parent scope.");
				if(!SymbolTableList[scope].hasOwnProperty(id) && !getSymbolTableEntry(id, scope)){
					putMessage("Error: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
					semanticErrorCount++;
				}
				//Id is not initialized
				else if(tableEntry.value == undefined ||tableEntry.value == null){
					putMessage("Warning: id " + id + " on line " + node.children[0].getLine() 
								+ " is never initialized.");
				}
				//Valid expression...set Id to used
				else{
					setIdentifierAsUsed(id, scope);
				}
			}
		}
		else if(node.name == "If"){
			//Boolean expression should always be in L child
			if(node.children[0].name == "==" || node.children[0].name == "!="){
				createSymbolTable(node.children[0]);
			}
			createSymbolTable(node.children[1]);
		}
		else if(node.name == "While"){
			//Boolean expression should always be in L child
			if(node.children[0].name == "==" || node.children[0].name == "!="){
				createSymbolTable(node.children[0]);
			}
			createSymbolTable(node.children[1]);
		}
		//Evaluated integer operations further
		else if (node.name == "+"){
			//if R child is id this will be its id
			var id = node.children[1].name.substr(-1);
			var scope = scopeManager.currentScope;
			if(node.children[1].name == "+"){
				createSymbolTable(node.children[1]);
			}
			//If is an Id and if it is declared
			else if(node.children[1].name.substr(0,2) == "Id"){
				putMessage("Checking for declaration of id " + id + " in current or parent scope.");
				if(!getSymbolTableEntry(id, scope)){
					putMessage("Error: id " + id + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
			}
			//R child is Id but not of type int
			else if(node.children[1].name.substr(0,2) == "Id"){ 
				if(getSymbolTableEntry(id, scope).type != "int"){
				putMessage("Error: id " + id + " on line " + node.children[1].getLine() 
							+ " is not an int ");
				semanticErrorCount++;
				}
				else if(getSymbolTableEntry(id, scope).value == undefined || 
						getSymbolTableEntry(id, scope).value == null){
					putMessage("Warning: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
				}
			}
			else {	//Not sure this is necessary but leaving it anyways
				putMessage("Error: can't add non int " + node.children[1].name 
					+ " on line " + node.children[1].getLine());
				semanticErrorCount++;
			}
			
		}
		else if(node.name == "==" || node.name == "!="){
			//if R child is id this will be its id
			var id = node.children[0].name.substr(-1);
			var scope = scopeManager.currentScope;
			
			//L child is another boolean expression
			if(node.children[0].name == "==" || node.children[0].name == "!="){
				createSymbolTable(node.children[0]);
				//R child is Id
				if(node.children[1].name.substr(0,2) == "Id"){
					//Id is declared
					putMessage("Checking for declaration of id " + id + " in current or parent scope.");
					if(!getSymbolTableEntry(id, scope)){
						putMessage("Error: id " + id + " on line " + node.getLine() + " is undeclared");
						semanticErrorCount++;
					}
					else if(getSymbolTableEntry(id, scope).value == undefined ||
							getSymbolTableEntry(id, scope).value == null){
						putMessage("Warning: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
					}
				}
			}
			//R child is another boolean expression
			else if(node.children[1].name == "==" || node.children[1].name == "!="){
				createSymbolTable(node.children[1]);
				//L child is Id
				if(node.children[0].name.substr(0,2) == "Id"){
					//Id is declared
					putMessage("Checking for declaration of id " + id + " in current or parent scope.");
					if(!getSymbolTableEntry(id, scope)){
						putMessage("Error: id " + id + " on line " + node.getLine() + " is undeclared");
						semanticErrorCount++;
					}
					else if(getSymbolTableEntry(id, scope).value == undefined ||
							getSymbolTableEntry(id, scope).value == null){
						putMessage("Warning: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
					}
				}
			}
			else if(node.children[0].name.substr(0,2) == "Id"){
				if(!getSymbolTableEntry(node.children[0].name.substr(-1), scope)){
					putMessage("Error: id " + node.children[0].name.substr(-1) + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
				else if(getSymbolTableEntry(node.children[0].name.substr(-1), scope).value == undefined ||
							getSymbolTableEntry(node.children[0].name.substr(-1), scope).value == null){
						putMessage("Warning: id " + node.children[0].name.substr(-1) + " on line " + node.getLine() 
							+ " was never initialized.");
				}
			}
			else if(node.children[1].name.substr(0,2) == "Id" ){
				if(!getSymbolTableEntry(node.children[1].name.substr(-1), scope)){
					putMessage("Error: id " + node.children[1].name.substr(-1) + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
				else if(getSymbolTableEntry(node.children[1].name.substr(-1), scope).value == undefined ||
							getSymbolTableEntry(node.children[1].name.substr(-1), scope).value == null){
						putMessage("Warning: id " + node.children[1].name.substr(-1) + " on line " + node.getLine() 
							+ " was never initialized.");
				}
			}
				
			
			//Following code checks type when performing boolean operations
			
			//If children are ids these are their identifiers
			var id1 = node.children[0].name.substr(-1);
			var id2 = node.children[1].name.substr(-1);
			
			//If both children are numbers
			if(R_DIGIT.test(parseInt(node.children[0].name)) && R_DIGIT.test(parseInt(node.children[1].name))){
				putMessage("Type match: both expressions are integers.");
			}
			//L child digit R child Id or vice versa
			else if((R_DIGIT.test(parseInt(node.children[0].name)) && node.children[1].name.substr(0,2) == "Id")
				||(node.children[0].name.substr(0,2) == "Id" && R_DIGIT.test(parseInt(node.children[1].name)) )){
				//Check to see if exists first incase this child is not an id
				if(getSymbolTableEntry(id1, scope) && getSymbolTableEntry(id1, scope).type != "int"){
					putMessage("Error: type mismatch between int and id " + id1 + " of type " 
						+ getSymbolTableEntry(id1, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
				else if(getSymbolTableEntry(id2, scope) && getSymbolTableEntry(id2, scope).type != "int"){
					putMessage("Error: type mismatch between int and id " + id2 + " of type " 
						+ getSymbolTableEntry(id2, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
			}
			//If 2 Ids are being compared...check type(should already be declared)
			else if(node.children[1].name.substr(0,2) == "Id" && node.children[0].name.substr(0,2)){
				
			}
		}
		
		
		
	}
	
	function addIntExpr(node){
		var intExpr = parseInt(node.children[0].name);
		while(node.children[1].name == "+"){
			node = node.children[1];
			intExpr = intExpr + parseInt(node.children[0].name);
		}
		intExpr = intExpr + parseInt(node.children[1].name);
		
		return intExpr;
	}
	
	function addBooleanExpr(node){
		var boolExpr = "";
		if((node.children[0].name == "==" || node.children[0].name == "!=")
			&& (node.children[1].name == "==" || node.children[1].name == "!=")){
			return boolExpr + "(" + addBoolExpr(node.children[0]) + ")" + node.name 
							+ "(" + addBoolExpr(node.children[1]) + ")";
			}
			
		if(node.children[0].name == "==" || node.children[0].name =="!="){
			return boolExpr + "(" + addBooleanExpr(node.children[0]) + ")" + node.name
								+ node.children[1].name;
		}
		
		if(node.children[1].name == "==" || node.children[1].name =="!="){
			return boolExpr + node.children[0] + node.name + "("
								+ node.children[1].name + ")";
		}
		
		return boolExpr + node.children[0].name + node.name + node.children[1].name;
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