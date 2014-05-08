function codeGen(AST){
	 var ByteCodes = [];
	 var referenceTable = {};
	 var jumpTable = {};
	 var scope = -1;
	
	//Initialize ByteCodes
	/*for(var i = 0; i < 256; i++){
		ByteCodes[i] = "00";
	}*/
	
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
			var tempKey = getRefTableEntry(id, type, scope);
			ByteCodes.push("A9", "00");
			ByteCodes.push("8D", tempKey, "XX");
		}
		else if(type == "string"){
			//Don't need any bytes but have to make temp table entry
			getRefTableEntry(id, type, scope);
		}
		
	}
	
	function generateAssignment(node){
		var id = node.children[0].name.substr(-1);
		var value = node.children[1].name;
		var type = getSymbolTableEntry(id, scope).type;
		
		//Need temp key from table
		var tempKey = getRefTableEntry(id, type, scope);
		//type = int
		//Can be digit intop expr
		//or just digit
		if(type === "int"){
			var hexValues = getIntHex(node.children[1], scope);
			ByteCodes.push("A9", hexValues[0]);
			ByteCodes.push("8D", tempKey, "00");
			
			for(var i = 1; i < hexValues.length; i++){
				ByteCodes.push("A9", hexValues[i]);
				ByteCodes.push("6D", tempKey, "00");
				ByteCodes.push("8D", tempKey, "00");
			}
		}
		//Can be ( expr boolop expr)
		//or just boolval
		else if(type === "boolean"){
			var boolVal = getBoolHex(node.children[1], scope);
			ByteCodes.push("A9", boolVal);
			ByteCodes.push("8D", tempKey, "00");
			alert(ByteCodes);
			
		}
		// " Charlist "
		else if(type === "string"){
			var stringHexList = getStrHex(node.children[1], scope);
			//Need offset for storage
			var totalOffset = 0;
			
			for(entry in referenceTable){
				if(referenceTable[entry]["type"] == "string" && referenceTable[entry]["offset"] != undefined){
					totalOffset += referenceTable[entry]["offset"];
				}
			}
		}
		
		var openIndex = 256 - totalOffset;
		
		var startingIndex = openIndex - stringHexList.length;
		
		referenceTable[tempKey]["offset"] = 256 - startingIndex;
		
		referenceTable[startingIndex.toString(16).toUpperCase()] = referenceTable[tempKey];
		
		delete referenceTable[tempKey];
		
		for(var i = 0; i < stringHexList.length; i++){
			ByteCodes.push("A9", stringHexList[i]);
			ByteCodes.push("8D", (startingIndex + i).toString(16).toUpperCase(), "00");
		}
		alert(ByteCodes);
		
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
		else{
			//if integer or operator
			
		}
	}
	
	//Helper functions for reference and jump tables
	
	function getRefTableEntry(id, type, scope){
		
		if(refEntryExists(id, scope)){
			for(key in referenceTable){
				if(referenceTable[key].id == id && referenceTable[key].scope === scope){
					return key
				}
			}
		}
		else{
			var entryNum = 0;
			for(key in referenceTable){
				entryNum++;
			}
			
			//Need to determine offset by type
			if(type == "int" || type == "boolean"){
				var offset = 0;
				
				for(key in referenceTable){
					if(referenceTable[key].type != "string"){
						offset++;
					}
				}
			}
			else if(type == "string"){
				var offset = undefined;
			}
			
			referenceTable["T" + entryNum] = {"id": id, "type": type, "scope": scope, "offset": offset};
			
			return "T" + entryNum;
		}
	}
	
	function refEntryExists(id, scope){
		for(key in referenceTable){
			if(referenceTable[key].id == id && referenceTable[key].scope === scope){
				return true;
			}
		}
		return false;
	}
	
	function getIntHex(node, scope){
		var hexList = [];
		
		getIntExpr(node);
		
		return hexList;
		
			function getIntExpr(node){
				var value = node.name;
				
				if(value == "+" || value == "-"){
					hexList.push("0" + node.children[0].name)
					getIntExpr(node.children[1]);
				}
				//Int
				else if(R_DIGIT.test(parseInt(value))){
					hexList.push("0" + value);
				}
				//Id
				else{
					//Have to handle if val is another id?
				
					var val = getSymbolTableEntry(value.substr(-1), scope).value;
					hexList.push("0" + val);
				}
		
			}
	}
	
	function getBoolHex(node, scope){
	
		var val;
		
		//True
		if(node.name == "true"){
			val = "01";
		}
		//False
		else if(node.name == "false"){
			val = "00";
		}
		//Else...id
		else{
			var id = node.name.substr(-1);
			var value = getSymbolTableEntry(id, scope).value;
			
			if(value == "true"){
				val = "01";
			}
			else if(value == "false"){
				val = "01";
			}
			
		}
		
		return val;
			
	}
	
	function getStrHex(node, scope){
		var value = node.name;
		//Id
		if(node.name.substr(0, 2) == "Id"){
			var id = node.name.substr(-1);
			value = getSymbolTableEntry(id, scope).value;
		}
		
		value = value.replace(/\"/g, "");
		
		var charList = value.split("");
		//convert all chars to ascii value
		for(var i = 0; i < charList.length; i++){
			charList[i] = charList[i].toUpperCase();
			charList[i] = charList[i].charCodeAt(0).toString(16);
		}
		
		//Add 00 to make it a null terminated string
		charList.push("00");

		return charList;
	}
	
}