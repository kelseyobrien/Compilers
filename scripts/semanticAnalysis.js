function semanticAnalysis(){
	createSymbolTable();
	
	function scopeCheck(){
		
	}
	
	function createSymbolTable(){
		putMessage("Creating symbol table");
		putMessage("...and some type checking");
		putMessage("--------------------------");
		var scopeManager = new ManageScope();
		var scopeOpened = false;
		var parentValue;
		var intExprValue;
		
		function traverseAST(node, depth){
			if(node.children == null || node.children.length === 0){
				//alert(node.name);
				//alert(node.children.length);
				var subNodeName = node.name.substring(0, 2);
				if(subNodeName === "Id"){
					if(parentValue === "Print"){
						var id = node.name.substr(-1);
						scope = scopeManager.currentScope;
						setIdentifierAsUsed(id, scope);
					}
				}
			}
			else{
				if(node.name === "Block"){
					if(scopeOpened === false){
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
					traverseAST(node.children[i], depth + 1);
				}
			}
			//Close last scope
			//scopeManager.leaveCurrentScope();
			
			semanticErrorCount = -1;
		}
		
		/*function addAssignment(node){
			var scope = scopeManager.currentScope;
			//Name is left child of assinment statement
			var id = node.children[0].name.substr(-1);
			var line = node.children[0].getLine();
			var value;
			
			//Handle right child based on what it is.
			if(node.children[1].name === "+"){
				var intopNode = node.children[1];
				//left child is always a digit
				var int1 = parseInt(intopNode.children[0].name);
				//If right child is + add another intExpr
				if(intopNode.children[1].name === "+"){
					var result = addIntExpr(intopNode.children[1], id, scope);
					//determine if AddIntExpr returns int
					if(result != true || result != false){
						alert(result);
						value = int1 + parseInt(result);
						alert(value);
					}
				}
				else{
					var int2 = parseInt(intopNode.children[1].name);
					value = int1 + int2;
					alert(value);
				}
			}
			else{ 
					//If Id...add value to symbol table entry
					//else it is a single digit or string
					var checkForId = node.children[1].name.substr(0,2);
					if(checkForId === "Id"){
						alert("found id");
					}
					else{
						value = node.children[1].name;
					}
			}
			
			var symbolTableEntry = getSymbolTableEntry(id, scope);
			
			if(symbolTableEntry){
				symbolTableEntry.value = value;
				alert(value);
				setIdentifierAsUsed(id, scope);
			}
			else{
				putMessage("Error: assignment attempted on undeclared variable " 
					+ id + " on line " + line);
			}
			
			
			
		}*/
		
		function addAssignment(node){
			var scope = scopeManager.currentScope;
			//Id is left child of assinment statement
			//Get specific ID and line
			var id = node.children[0].name.substr(-1);
			var line = node.children[0].getLine();
			var entry = getSymbolTableEntry(id, scope);
			intExprValue = 0;
			
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
				var id2Entry = getSymbolTableEntry(id2, scope);
				if(entry.type == id2Entry.type){
					if(id2Entry.value == undefined || id2Entry.value == null){
						//Uninitialized variable...gotta handle that somehow
						alert("if");
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
						}
					}
				}
				else{
					putMessage("Error: type mismatch. Can not assign id " + id2 + " of type "
								+ id2Entry.type + " to id " + id + " of type " + entry.type);
				}
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
		
		/*function addIntExpr(node){
			alert("in intexpr");
			//Left child always an int
			var int1 = parseInt(node.children[0].name);
			//alert(int1);
			//determine if another intop in right child
			if(node.children[1].name === "+"){
				addIntExpr(node.children[1]);
				return true
			}
			else{ //Token is id, single digit, or string
				var subNodeName = node.children[1].name.substring(0, 2);
				if(subNodeName === "Id"){
					alert("found id");
					var id = node.children[1].name.substr(-1);
					var scope = scopeManager.currentScope;
					
					setIdentifierAsUsed(id, scope);
					return true;
				}
				else{
					//Right child is a string
					if(node.children[1].name.substr(0, 1) === '\"'){
						alert("string");
						return true;
					}
					else{ //digit
						var int2 = parseInt(node.children[1].name);
						return (int1 + int2);
					}
				}
			}
			return false;
		}*/
		
		//Initial call
		traverseAST(AST.root, 0);
		
	}
}