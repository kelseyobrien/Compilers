function codeGen(AST){
	 var ByteCodes = [];
	 var referenceTable = {};
	 var jumpTable = {};
	 var scope = -1;
	
	//Initialize ByteCodes
	for(var i = 0; i < 256; i++){
		ByteCodes[i] = "00";
	}
	
	generateCode(AST);
	
	
	function generateCode(AST){
		generateBlock(AST.root);
	}
	
	function generateBlock(node){
		//Be careful with this
		scope++;
		for(var i = 0; i < node.children.length; i++){
			generateStatement(node.children[i]);
		}
		scope--;
	}
	
	function generateStatement(node){
		switch(node.name)
		{
			case "VarDecl":
				generateVarDecl(node);
			break;
			case "AssignmentStatement":
				generateAssignment(node);
			break;
			case "Print":
				generatePrint(node);
			break;
		}
	}
	
	function generateVarDecl(node){
		var type = node.children[0].name;
		var id = node.children[1].name.substr(-1);
		
		if(type == "int" || type == "boolean"){
		//Int and boolean declarations are the same
		//Add A9 00
		//Add 8D <tempAddr> 00
		}
		else if(type == "string"){
		//Don't need any bytes but have to make temp table entry
		}
		
	}
	
	function generateAssignment(node){
		var id = node.children[0].name.substr(-1);
		var value = node.children[1].name;
		var type = getSymbolTableEntry(id, scope).type;
		
		//Need temp key from table

		//type = int
		//Can be digit intop expr
		//or just digit
		if(type === "int"){
		}
		//Can be ( expr boolop expr)
		//or just boolval
		else if(type === "boolean"){
		}
		// " Charlist "
		else if(type === "string"){
		}
		
	}
	
	function generatePrint(node){
		var value = node.children[0].name;
		
		//Print Id
		if(value.substr(0,2) == "Id"){
			var id = value.substr(-1);
			var type = getSymbolTableEntry(id, scope).type;
			
			if(type == "int" || type == "boolean"){
				//Get entry in reference table
				
				
				//A2 01
				//AC <temp value> 00
				//FF
			}
			//String
			else{
				//Get entry in reference table
				
				//A2 02
				//A0 <table entry>
				//FF
			}

		}
		else if(value.substr(-1) == '\"'){
			//Convert string to hex values
			
			//A2 02
			//A0 <load memory location>
			//FF
			
			//Jump past the string
			//Calculate jump valie
			//D0 <jump value>
			//Add ascii character to source code
		
		}
		//Else intexpr or boolean
	}
	
}