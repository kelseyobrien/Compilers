function semanticAnalysis(){
	var scopeManager = new ManageScope();
	if(semanticErrorCount === 0){
		putMessage("Creating symbol table");
		putMessage("And some scope checking");
		putMessage("...and some type checking at the same time.");
		putMessage("--------------------------");
		createSymbolTable(AST.root);
	}
	
	checkforUnusedVariables();
	
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
			putMessage("SCOPE: Checking for redeclaration of id " + id + " in current scope.");
			if(SymbolTableList[scope].hasOwnProperty(id)){
				putMessage("ERROR: redeclaration of variable " + id 
					+ " on line " + line);
					semanticErrorCount++;
			}
			else{
				putMessage("ADDING id: " + id + " on line "+ line + " to symbol table in scope " + scope);
				SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope,
					"isUsed": false};
			}
		}
		else if(node.name === "AssignmentStatement"){
			//Get Id that is in L child
			var id = node.children[0].name.substr(-1);
			var scope = scopeManager.currentScope;
			//If Id is not in current scope for parent scope...undeclared
			putMessage("SCOPE: Checking for declaration of id " + id + " in current or parent scope.");
			if(!SymbolTableList[scope].hasOwnProperty(id) && !getSymbolTableEntry(id, scope)){
					putMessage("ERROR: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
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
					alert(booleanExpr);
					symbol.value = booleanExpr;
					setIdentifierAsUsed(id, scope);
				}
				//R child is Id --> check if declared and if types match
				else if(node.children[1].name.substr(0,2) == "Id"){
					var thisId = node.children[1].name.substr(-1);
					if(!SymbolTableList[scope].hasOwnProperty(thisId) && !getSymbolTableEntry(thisId, scope)){
						putMessage("ERROR: Variable " + thisId + " on line " + node.children[1].getLine() + " is undeclared");
						semanticErrorCount++;
					}
					//Types don't match
					else if(symbol.type != getSymbolTableEntry(thisId, scope).type){
						putMessage("ERROR: type mismatch with id " + thisId +
						" of type " + getSymbolTableEntry(thisId, scope).type + " on line " + node.children[1].getLine());
						semanticErrorCount++;
					}
					//Types match
					else if(symbol.type == getSymbolTableEntry(thisId, scope).type){
						symbol.value = getSymbolTableEntry(thisId, scope).value;
						setIdentifierAsUsed(id, scope);
					}
				
				}
				else{
					//Type mismatch between id in L child and expr in right child
					putMessage("ERROR: type mismatch with id " + node.children[0].name.substr(-1) +
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
				putMessage("SCOPE: Checking for declaration of id " + id + " in current or parent scope.");
				if(!SymbolTableList[scope].hasOwnProperty(id) && !getSymbolTableEntry(id, scope)){
					putMessage("ERROR: Variable " + id + " on line " + node.children[0].getLine() + " is undeclared");
					semanticErrorCount++;
				}
				//Id is not initialized
				else if(tableEntry.value == undefined ||tableEntry.value == null){
					putWarnings("WARNING: id " + id + " on line " + node.children[0].getLine() 
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
				putMessage("SCOPE: Checking for declaration of id " + id + " in current or parent scope.");
				if(!getSymbolTableEntry(id, scope)){
					putMessage("ERROR: id " + id + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
			}
			//R child is Id but not of type int
			else if(node.children[1].name.substr(0,2) == "Id"){ 
				if(getSymbolTableEntry(id, scope).type != "int"){
				putMessage("ERROR: id " + id + " on line " + node.children[1].getLine() 
							+ " is not an int ");
				semanticErrorCount++;
				}
				else if(getSymbolTableEntry(id, scope).value == undefined || 
						getSymbolTableEntry(id, scope).value == null){
					putWarnings("WARNING: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
				}
			}
			else {	//Not sure this is necessary but leaving it anyways
				putMessage("ERROR: can't add non int " + node.children[1].name 
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
				if(node.children[1].name == "==" || node.children[1].name == "!="){
				}
				//R child is Id
				else if(node.children[1].name.substr(0,2) == "Id"){
					//Id is declared
					putMessage("SCOPE: Checking for declaration of id " + id + " in current or parent scope.");
					if(!getSymbolTableEntry(id, scope)){
						putMessage("ERROR: id " + id + " on line " + node.getLine() + " is undeclared");
						semanticErrorCount++;
					}
					else if(getSymbolTableEntry(id, scope).value == undefined ||
							getSymbolTableEntry(id, scope).value == null){
						putWarnings("WARNING: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
					}
				}
			}
			//R child is another boolean expression
			if(node.children[1].name == "==" || node.children[1].name == "!="){
				createSymbolTable(node.children[1]);
				
				if(node.children[0].name == "==" || node.children[0].name == "!="){
				}
				//L child is Id
				else if(node.children[0].name.substr(0,2) == "Id"){
					//Id is declared
					putMessage("SCOPE: Checking for declaration of id " + id + " in current or parent scope.");
					if(!getSymbolTableEntry(id, scope)){
						putMessage("ERROR: id " + id + " on line " + node.getLine() + " is undeclared");
						semanticErrorCount++;
					}
					else if(getSymbolTableEntry(id, scope).value == undefined ||
							getSymbolTableEntry(id, scope).value == null){
						putWarnings("WARNING: id " + id + " on line " + node.children[1].getLine() 
							+ " was never initialized.");	
					}
				}
			}
			else if(node.children[0].name.substr(0,2) == "Id"){
				if(!getSymbolTableEntry(node.children[0].name.substr(-1), scope)){
					putMessage("ERROR: id " + node.children[0].name.substr(-1) + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
				else if(getSymbolTableEntry(node.children[0].name.substr(-1), scope).value == undefined ||
							getSymbolTableEntry(node.children[0].name.substr(-1), scope).value == null){
						putWarnings("WARNING: id " + node.children[0].name.substr(-1) + " on line " + node.getLine() 
							+ " was never initialized.");
				}
			}
			else if(node.children[1].name.substr(0,2) == "Id" ){
				if(!getSymbolTableEntry(node.children[1].name.substr(-1), scope)){
					putMessage("ERROR: id " + node.children[1].name.substr(-1) + " on line " + node.getLine() + " is undeclared");
					semanticErrorCount++;
				}
				else if(getSymbolTableEntry(node.children[1].name.substr(-1), scope).value == undefined ||
							getSymbolTableEntry(node.children[1].name.substr(-1), scope).value == null){
						putWarnings("WARNING: id " + node.children[1].name.substr(-1) + " on line " + node.getLine() 
							+ " was never initialized.");
				}
			}
				
			
			//Following code checks type when performing boolean operations
			
			//If children are ids these are their identifiers
			var id1 = node.children[0].name.substr(-1);
			var id2 = node.children[1].name.substr(-1);
			
			//If L is boolean value and R is id...type check
			if((node.children[1].name.substr(0,2) == "Id" ) && (node.children[0].name == "true" || node.children[0].name == "false")){
					if(getSymbolTableEntry(id2, scope) && getSymbolTableEntry(id2, scope).type != "boolean"){
						putMessage("ERROR: type mismatch between string and id " + id2 + " of type " 
						+ getSymbolTableEntry(id2, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
					}
			}
			//If L is Id and R is boolean value...check type
			else if(node.children[0].name.substr(0,2) == "Id" && (node.children[1].name == "true" || node.children[1].name == "false")){
					if(getSymbolTableEntry(id1, scope) && getSymbolTableEntry(id1, scope).type != "boolean"){
						putMessage("ERROR: type mismatch between string and id " + id1 + " of type " 
						+ getSymbolTableEntry(id1, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
					}
			}
			//2 boolean values being compared
			else if((node.children[0].name == "true" || node.children[0].name == "false")
				&& (node.children[1].name == "true" || node.children[1].name == "false")){
					putMessage("Type match: both boolean values");
			}
			//If 2 strings being compared
			else if(node.children[0].name.substr(-1) == '\"' && node.children[1].name.substr(-1) == '\"'){
				putMessage("Type match: both expressions are strings");
			}
			//If 1 is string and other is an Id...check type
			else if ((node.children[0].name.substr(0,1) == '\"' && node.children[1].name.substr(0,2) == "Id")
				||(node.children[0].name.substr(0,2) == "Id" && node.children[1].name.substr(0,1) == '\"' )){
				//Check to see if exists first incase this child is not an id
				if(getSymbolTableEntry(id1, scope) && getSymbolTableEntry(id1, scope).type != "string"){
					putMessage("ERROR: type mismatch between string and id " + id1 + " of type " 
						+ getSymbolTableEntry(id1, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
				else if(getSymbolTableEntry(id2, scope) && getSymbolTableEntry(id2, scope).type != "string"){
					putMessage("ERROR: type mismatch between string and id " + id2 + " of type " 
						+ getSymbolTableEntry(id2, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
			}
			//If both children are numbers
			//Don't really like this but it doesn't hurt
			else if(R_DIGIT.test(parseInt(node.children[0].name)) && R_DIGIT.test(parseInt(node.children[1].name))){
				putMessage("Type match: both expressions are integers.");
			}
			//L child digit R child Id or vice versa
			else if((R_DIGIT.test(parseInt(node.children[0].name)) && node.children[1].name.substr(0,2) == "Id")
				||(node.children[0].name.substr(0,2) == "Id" && R_DIGIT.test(parseInt(node.children[1].name)) )){
				//Check to see if exists first incase this child is not an id
				if(getSymbolTableEntry(id1, scope) && getSymbolTableEntry(id1, scope).type != "int"){
					putMessage("ERROR: type mismatch between int and id " + id1 + " of type " 
						+ getSymbolTableEntry(id1, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
				else if(getSymbolTableEntry(id2, scope) && getSymbolTableEntry(id2, scope).type != "int"){
					putMessage("ERROR: type mismatch between int and id " + id2 + " of type " 
						+ getSymbolTableEntry(id2, scope).type + " on line " + node.getLine());
						semanticErrorCount++;
				}
			}
			//If 2 Ids are being compared...check type(should already be declared)
			else if(node.children[1].name.substr(0,2) == "Id" && node.children[0].name.substr(0,2) == "Id"){
				if(getSymbolTableEntry(id1, scope) && getSymbolTableEntry(id2, scope)){
					var type1 = getSymbolTableEntry(id1, scope).type;
					var type2 = getSymbolTableEntry(id2, scope).type;
					if(type1 != type2){
						putMessage("ERROR: type mismatch between id " + id1 + " of type "+ type1
								+ " and id " + id2 + " of type " + type2 + " on line " + node.getLine());
						semanticErrorCount++;
						
					}
				}
			}
			/*else{
				putMessage("ERROR: type mismatch on line " + node.getLine());
				semanticErrorCount++;
			}*/
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
		alert(node.name);
		var boolExpr = "";
		if((node.children[0].name == "==" || node.children[0].name == "!=")
			&& (node.children[1].name == "==" || node.children[1].name == "!=")){
			alert(1);
			return boolExpr + "(" + addBoolExpr(node.children[0]) + ")" + node.name 
							+ "(" + addBoolExpr(node.children[1]) + ")";
			}
			
		if(node.children[0].name == "==" || node.children[0].name =="!="){
			alert(2);
			return boolExpr + "(" + addBooleanExpr(node.children[0]) + ")" + node.name
								+ node.children[1].name;
		}
		
		if(node.children[1].name == "==" || node.children[1].name =="!="){
		
			return boolExpr.toString() + node.children[0].name + node.name + "("
								+ addBooleanExpr(node.children[1]) + ")";
		}
		
		return boolExpr + node.children[0].name + node.name + node.children[1].name;
	}
	
	function printSymbolTable(){
		for(var i = 0; i < SymbolTableList.length; i++){
			var currentTable = SymbolTableList[i];
			for(var symbol in currentTable)
			{
				if(currentTable.hasOwnProperty(symbol) && symbol != "parentScope"){
					putSymbolTable(symbol + ": value- " + currentTable[symbol].value +
										", type- " + currentTable[symbol].type +
										", scope- " + currentTable[symbol].scope +
										", line- " + currentTable[symbol].line);
				}
			}
		}
			
	}
	

	
}