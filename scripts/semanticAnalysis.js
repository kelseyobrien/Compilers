function semanticAnalysis(){
	createSymbolTable();
	
	function scopeCheck(){
		
	}
	
	function createSymbolTable(){
		var scopeManager = new ManageScope();
		var scopeOpened = false;
		var parentValue;
		
		function traverseAST(node, depth){
			if(node.children == null || node.children.length === 0){
				//alert(node.name);
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
						//alert("new scope");
						scopeManager.initializeNewScope();
					}
					else if (scopeOpened){
						//Leavee current scope before entering new block
						//alert("closed scope");
						scopeManager.leaveCurrentScope();
						//alert("new scope");
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
		}
		
		function addAssignment(node){
			var scope = scopeManager.currentScope;
			//Name is left child of assinment statement
			var id = node.children[0].name.substr(-1);
			var line = node.children[0].getLine();
			var value;
			
			//Handle right child based on what it is.
			if(node.children[1].name == "+"){
				var intopNode = node.children[1];
				//left child is always a digit
				var int1 = parseInt(intopNode.children[0].name);
				//If right child is +
				if(intopNode.children[1].name){
					addIntExpr(intopNode.children[1]);
				}
				else{
				var int2 = parseInt(intopNode.children[1].name);
				value = int1 + int2;
				}
			}
			
			var symbolTableEntry = getSymbolTableEntry(id, scope);
			
			if(symbolTableEntry){
				symbolTableEntry.value = value;
				setIdentifierAsUsed(id, scope);
			}
			else{
				putMessage("Error: assignment attempted on undeclared variable " 
					+ id + " on line " + line);
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
				SymbolTableList[scope][id] = {"type": type, "line": line, "scope": scope,
					"isUsed": false};
			}
		}
		
		function addIntExpr(node){
			//determine if another intop in right child
			if(node.children[1].name === "+"){
				addIntExpr();
			}
			else{ //Token is id, single digit, or string
			}
		}
		
		//Initial call
		traverseAST(AST.root, 0);
		
	}
}