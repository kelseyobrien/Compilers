function codeGen(AST){
	 var ByteCodes = [];
	 var referenceTable = {};
	 var jumpTable = {};
	 var stringTable = null;
	
	generateCode(AST);
	ByteCodes.push("00");
	
	referenceBackpatch();
	jumpBackpatch();
	
	for(var i = 0; i < 255; i++){
		if(ByteCodes[i] == undefined){
			putCode("00" + " ");
		}
		else{
			putCode(ByteCodes[i] + " ");
		}
	}
	
	
	function generateCode(AST){
		generateBlock(AST.root);
	}
	
	function generateBlock(node){
		for(var i = 0; i < node.children.length; i++){
			if(node.children[i].name == "Block"){
				generateBlock(node.children[i]);
			}
			else{
				generateStatement(node.children[i]);
			}
		}
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
			case "If":
				generateIf(node);
			break;
			case "While":
				generateWhile(node);
			break;
		}
	}
	
	function generateVarDecl(node){
		var type = node.children[0].name;
		var id = node.children[1].name.substr(-1);
		var scope = node.children[1].scope;
		if(type == "int" || type == "boolean"){
			//Int and boolean declarations are the same
			//Add A9 00
			//Add 8D <tempAddr> 00
			var tempKey = getRefTableEntry(id, type, scope);
			ByteCodes.push("A9", "00");
			ByteCodes.push("8D", tempKey, "XX");
		}
		else if(type == "string"){
			var tempKey = getRefTableEntry(id, type, scope);
			ByteCodes.push("A9", "00");
			ByteCodes.push("8D", tempKey, "XX");
		}
		
	}
	
	function generateAssignment(node){
		var id = node.children[0].name.substr(-1);
		var scope = node.children[0].scope;
	
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
			var boolVal = getBoolHex(node.children[1], node.children[1].scope);
			ByteCodes.push("A9", boolVal);
			ByteCodes.push("8D", tempKey, "00");
			
		}
		// " Charlist "
		else if(type === "string"){
			var stringHexList = getStrHex(node.children[1], scope);
			//Need offset for storage
			var totalOffset = 0;
			
			//Make sure not to cover up existing values
			for(entry in referenceTable){
				if(referenceTable[entry]["type"] == "string" && referenceTable[entry]["offset"] != undefined){
					totalOffset += referenceTable[entry]["offset"];
				}
			}
		
			
			var startingIndex = 256 - totalOffset - stringHexList.length;
			
			referenceTable[tempKey]["offset"] = 256 - startingIndex;
			
			//Not sure if this is necessary
			referenceTable[startingIndex.toString(16).toUpperCase()] = referenceTable[tempKey];
			
			delete referenceTable[tempKey];
			
			for(var j = 0; j < stringHexList.length; j++){
					ByteCodes[startingIndex] = stringHexList[j];
					startingIndex++;
				}
		}
		
	}
	
	function generatePrint(node){
		var value = node.children[0].name;
		if(R_DIGIT.test(parseInt(value))){
			ByteCodes.push("A0" , "0" + value);
			ByteCodes.push("A2", "01");
		}
		//Print Id
		else if(value.substr(0,2) == "Id"){
			var id = value.substr(-1);
			var scope = node.children[0].scope;
			var type = getSymbolTableEntry(id, scope).type;
			var tempKey = getRefTableEntry(id, type, scope);
			
			if(type == "int" || type == "boolean"){
				ByteCodes.push("A2", "01");
				ByteCodes.push("AC", tempKey, "XX");
			}
			//String
			else{
				ByteCodes.push("A2", "02");
				ByteCodes.push("AC", tempKey, "XX");
			}
		}
		else if(value.substr(-1) == '\"'){
			//Remove quotation marks
			var string = value.substr(1, value.length - 2);
			var totalOffset = 0;
			
			//Get offset in order not to cover other things
			for(entry in referenceTable){
				if(referenceTable[entry]["type"] == "string" && referenceTable[entry]["offset"] != undefined){
					totalOffset += referenceTable[entry]["offset"];
				}
			}
			
			var startingIndex = 256 - totalOffset - string.length - 1;
			
			ByteCodes.push("A2", "02");
			ByteCodes.push("A0", startingIndex.toString(16).toUpperCase());
			ByteCodes.push("FF");
			
			for(var j = 0; j <= string.length; j++){
					if(j == string.length){
						ByteCodes[startingIndex] = "00";
					}
					else{
						ByteCodes[startingIndex] = string.charCodeAt(j).toString(16).toUpperCase();
						startingIndex++;
					}	
			}
			
			getRefTableEntry(string, "print string", -1);
		}
		//Else intexpr or boolean
		//CHECK ON 00 00 AFTER 6D AND 8D
		else if(value == "+"){
		
			var valueList = getIntHex(node.children[0], -1);
			ByteCodes.push("A9", valueList[0]);
			ByteCodes.push("8D", "00", "00");
			
			for(var i = 1; i < valueList.length; i++){
				ByteCodes.push("A9", valueList[i]);
				ByteCodes.push("6D", "00", "00");
				ByteCodes.push("8D", "00", "00");
			}
			
			ByteCodes.push("A2", "01");
			ByteCodes.push("AC", "00", "00");
			
		}
		else if(value == "true" || value == "false"){
			var boolVal = getBoolHex(node.children[0], -1);
			ByteCodes.push("A9", boolVal);
			ByteCodes.push("8D", "00", "00");
			ByteCodes.push("A2", "01");
			ByteCodes.push("AC", "00", "00");
		}
		
		//System call
		ByteCodes.push("FF");
	}
	
	function generateIf(node){
		var equalityNode = node.children[0];
		var blockNode = node.children[1];
		var scope = node.children[1].scope;
		
		//Get values of both conditions
		var values = [];
			for(var i = 0; i < 2; i++){
				if(equalityNode.children[i].name.substr(0,2) == "Id"){
					var id = equalityNode.children[i].name.substr(-1);
					var scope = equalityNode.children[i].scope;
					var value = getSymbolTableEntry(id, scope).value;
					values[i] = value;
				}
				else {
					if(R_DIGIT.test(parseInt(equalityNode.children[i].name))){
						
						values[i] = equalityNode.children[i].name;
					}
					else if(equalityNode.children[i].name == "true" ||
							equalityNode.children[i].name == "false"){
						values[i] = equalityNode.children[i].name;
					}
				}
			}
			
			var equality = false;
			if(values[0] == values[1]){
				equality = true;
			}
		
		//If boolean operation is ==
		if (equalityNode.name == "=="){
			for(var i = 0; i < 2; i++){
				if(equalityNode.children[i].name.substr(0,2) == "Id"){
					var id = equalityNode.children[i].name.substr(-1);
					var tempKey = getRefTableEntry(id, "don't know", scope);
					
					if(i == 0){
						ByteCodes.push("AE", tempKey, "00");
					}
					else{
						ByteCodes.push("AD", tempKey, "00");
						ByteCodes.push("8D", "00", "00");
					}
				}
				else {
					if(R_DIGIT.test(parseInt(equalityNode.children[i].name)) ||
						equalityNode.children[i].name == "+"){
						var valueList = getIntHex(equalityNode.children[i]);
						ByteCodes.push("A9", valueList[0]);
						ByteCodes.push("8D", "00", "00");
						
						for(var x = 1; x < valueList.length; x++){
							ByteCodes.push("A9", valueList[x]);
							ByteCodes.push("6D", "00", "00");
							ByteCodes.push("8D", "00", "00");
						}
						
						if(i == 0){
							ByteCodes.push("AE", "00", "00");
						}
					}
					else if(equalityNode.children[i].name == "true" ||
							equalityNode.children[i].name == "false"){
						var boolVal = getBoolHex(equalityNode.children[i]);
						ByteCodes.push("A9", boolVal);
						ByteCodes.push("8D", "00", "00");
						
						if(i == 0){
							ByteCodes.push("AE", "00", "00");
						}
					}
				}
				
			}
			
			ByteCodes.push("EC", "00", "00");
			ByteCodes.push("D0", getJumpTableEntry());
			generateBlock(blockNode);
			ByteCodes.push("EA");
		}
		//Boolean operation is != and the values are different
		else if (equalityNode.name == "!="){
			if(equality == false){
				//Load same values
				ByteCodes.push("A9", "02");
				ByteCodes.push("8D", "00", "00");
				ByteCodes.push("AE", "00", "00");
				ByteCodes.push("A9", "02");
				ByteCodes.push("8D", "00", "00");
				ByteCodes.push("EC", "00", "00");
				ByteCodes.push("D0", getJumpTableEntry());
				generateBlock(blockNode);
				ByteCodes.push("EA");
			}
			else{
				//Load same values
				ByteCodes.push("A9", "02");
				ByteCodes.push("8D", "00", "00");
				ByteCodes.push("AE", "00", "00");
				ByteCodes.push("A9", "03");
				ByteCodes.push("8D", "00", "00");
				ByteCodes.push("EC", "00", "00");
				ByteCodes.push("D0", getJumpTableEntry());
				generateBlock(blockNode);
				ByteCodes.push("EA");
			}
			
		}
		
	}
	
	function generateWhile(node){
		var equalityNode = node.children[0];
		var blockNode	 = node.children[1];

		var conditionStartLoc = ByteCodes.length;
		
		for(var i = 0; i < 2; i++){
			//Child is id
			if(equalityNode.children[i].name.substr(0, 2) == "Id"){
				var id = equalityNode.children[i].name.substr(-1);
				var scope = equalityNode.children[i].scope
				var type = getSymbolTableEntry(id, scope).type;
				var tempKey = getRefTableEntry(id, type, scope);
				
				if(i == 0)
				{
					ByteCodes.push("AE", tempKey, "00");
				}
				else{
					ByteCodes.push("AD", tempKey, "00");
				}
			}
			else {
					if(R_DIGIT.test(parseInt(equalityNode.children[i].name)) ||
						equalityNode.children[i].name == "+"){
							var valueList = getIntHex(equalityNode.children[i]);
							ByteCodes.push("A9", valueList[0]);
							ByteCodes.push("8D", "00", "00");
							
							for(var x = 1; x < valueList.length; x++){
								ByteCodes.push("A9", valueList[x]);
								ByteCodes.push("6D", "00", "00");
								ByteCodes.push("8D", "00", "00");
							}
							
							if(i == 0){
								ByteCodes.push("AE", "00", "00");
							}
						}
						
					else if(equalityNode.children[i].name == "true" ||
							equalityNode.children[i].name == "false"){
								var boolVal = getBoolHex(equalityNode.children[i]);
								ByteCodes.push("A9", boolVal);
								ByteCodes.push("8D", "00", "00");
						
								if(i == 0){
									ByteCodes.push("AE", "00", "00");
								}
						}
				}
		}
		
		ByteCodes.push("EC", "00", "00");
		ByteCodes.push("D0", getJumpTableEntry());
		generateBlock(blockNode);
		
		//Need to handle false comparison
		//Get location of jump value
		//Calc jump back
		
		
		
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
					
					offset++;
				}
				else if(type == "string"){
					var offset = undefined;
				}
				
				referenceTable["T" + entryNum] = {"id": id, "type": type, "scope": scope, "offset": offset};
				
				return "T" + entryNum;
			}
	}
	
	
	function getJumpTableEntry(){
		var entryNum = 0;
		
		for(key in jumpTable){
			entryNum++;
		}
		
		jumpTable["J" + entryNum] = undefined;
		
		return "J" + entryNum;
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
		//var scope = node.children[1].name.charAt(2);
		
		getIntExpr(node);
		
		return hexList;
		
			function getIntExpr(node){
				var intVal = node.name;
				
				if(intVal == "+"){
					hexList.push("0" + node.children[0].name)
					getIntExpr(node.children[1]);
				}
				//Int
				else if(R_DIGIT.test(parseInt(intVal))){
					hexList.push("0" + intVal);
				}
				//Id
				else{
					//Have to handle if val is another id?
					var scope = node.scope;
					var val = getSymbolTableEntry(intVal.substr(-1), scope).value;
					if(val == undefined){
						val = 0;
					}
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
			charList[i] = charList[i].charCodeAt(0).toString(16).toUpperCase();
		}
		
		//Add 00 to make it a null terminated string
		charList.push("00");

		return charList;
	}
	
	function allocateString(string){
		var length = string.length + 1;
		
		var record = {
			id : stringId,
			length : length,
			string : string
			}
			
		stringTable.push(record);
		
	}
	
	function referenceBackpatch(){
		for(key in referenceTable){
			var location = (referenceTable[key].offset + ByteCodes.length - 1).toString(16).toUpperCase();
			
			//Make sure location is 2 hex digits
			if(location.length == 1){
				location = "0" + location;
			}
			
			
			for(var i = 0; i < ByteCodes.length; i++){
				if(ByteCodes[i] == key){
					ByteCodes.splice(i, 1, location);
					ByteCodes.splice(i + 1, 1, "00");
				}
			}
			
			delete referenceTable[key];
		}
	}
	
	function jumpBackpatch(){
		for(key in jumpTable){
			for(var i = 0; i < ByteCodes.length; i++){
				if(ByteCodes[i] == key){
					var start = i;
				}
				if(ByteCodes[i] == "EA"){
					var destination = i;
				}
			}
			var jumpDist = (destination - start).toString(16).toUpperCase();
			
			if(jumpDist.length == 1){
				jumpDist = "0" + jumpDist;
			}
			
			ByteCodes.splice(start, 1, jumpDist);
			
			delete jumpTable[key];
		}
	}
	
	
}