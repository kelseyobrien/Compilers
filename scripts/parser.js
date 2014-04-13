function Parser(tokenStream){

	var lastToken;
	var symbolTable = new SymbolTable();
	var results = parseProgram();
	var CST;
	var AST;
	var stringBuffer;
	

	
	function parseProgram(){
		CST  = new Tree();
		AST = new Tree();
		stringBuffer = "";
		
		CST.addNode("Program", "branch");
		
		if(!block()){
			return false;
		}
		
		if(tokenStream.length > 0){
			if(checkToken(T_EOF)){
				putMessage("----------");
				putMessage("CST");
				putMessage("----------");
				putMessage(CST.toString());
				putMessage("----------");
				putMessage("AST");
				putMessage("----------");
				putMessage(AST.toString());
				return true;
			}
			else{
				return false;
			}
		}
		else{
			putMessage("Warning: Program did not end with $.");
			putMessage("Ignoring...but don't let it happen again.");
		}
	}
	
	//Determine which statement to parse
	function parseStatement(){
		var type = getTokenType();
		var success;
		CST.addNode("Statement", "branch");
		
		switch(type){
			case T_PRINT:
				success = printStatement();
				CST.endChildren();
				return success;
			break;
			case T_CHAR:
				success = assignmentStatement();
				CST.endChildren();
				return success;
			break;
			case T_INT:
			case T_STRING:
			case T_BOOLEAN:
				success = varDecl();
				CST.endChildren();
				return success;
			break;
			case T_WHILE:
				success = whileStatement();
				CST.endChildren();
				return success;
			break;
			case T_IF:
				success = ifStatement();
				CST.endChildren();
				return success;
			break;
			case T_OPENBRACE:
				return block();
			break;
		}
	}
	
	//Functions to determine the different statement forms
	
	//Print statement
	function printStatement(){
		CST.addNode("Print", "branch");
		CST.addNode("(", "leaf");
		
		AST.addNode("Print", "branch");
		
		if(checkToken(T_PRINT) && checkToken(T_OPENPAREN) 
			&& parseExpr() && checkToken(T_CLOSEPAREN)){
			CST.addNode(")", "leaf");
			CST.endChildren();
			
			AST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Assignment Statement -- Id = Expr
	function assignmentStatement(){
		CST.addNode("AssignmentStatement", "branch");
		AST.addNode("AssignmentStatement", "branch");
		if(parseId('initialized')) {
			if(checkToken(T_EQUAL)){
				CST.addNode("=", "leaf");
				if(parseExpr()){
					CST.endChildren();
					AST.endChildren();
					return true;
				}
			}
		}
		else{
			return false;
		}
	}
	
	//Variable declaration -- type Id
	function varDecl(){
		CST.addNode("VarDecl", "branch");
		AST.addNode("VarDecl", "branch");
		var tokenType = tokenStream[0];
		var tokenID = tokenStream[1];
		
		if(parseType() && parseId('declared')){
			if(! symbolTable.addIdentifier(tokenID, tokenType)){
				putMessage("Redeclaration of Identifier: " + tokenID.value + " at line "+ tokenID.line);
			}
			CST.endChildren();
			AST.endChildren();
			return true;
		}
		else{
			return false;
		}
		
	}
	
	//While statement -- while booleanExprBlock
	function whileStatement(){
	
		CST.addNode("WhileStatement", "branch");
		AST.addNode("While", "branch");
		
		if(checkToken(T_WHILE) && parseBooleanExpr() && block() ){
			CST.endChildren();
			AST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//If statement -- if booleanExpr Block
	function ifStatement(){
		CST.addNode("IfStatement", "branch");
		AST.addNode("If", "branch");
		if(checkToken(T_IF) && parseBooleanExpr() && block()){
			CST.endChildren();
			AST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Block -- { StatmentList }
	function block(){
		symbolTable.openScope();
		
		CST.addNode("Block", "branch");
		CST.addNode("{", "leaf");
		
		AST.addNode("Block", "branch");
		
		if(checkToken(T_OPENBRACE) && parseStatementList() 
			&& checkToken(T_CLOSEBRACE)){
			
			CST.addNode("}", "leaf");
			CST.endChildren();
			
			AST.endChildren();
			
			symbolTable.closeScope();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Statement list -- Statement StatementList
	function parseStatementList(){
	
		CST.addNode("Statement List", "branch");
		var success;
		//Check to see if ai this is a statement
		//If so parse it
		//If not return true since can go to epsilon
		switch(getTokenType()){
			case T_PRINT:
			case T_CHAR:
			case T_INT:
			case T_STRING:
			case T_BOOLEAN:
			case T_OPENBRACE:
			case T_WHILE:
			case T_IF:
				parseStatement();
				success = parseStatementList();
				CST.endChildren();
				return success;
			break;
			default:
				CST.endChildren();
				return true;	
		}
		CST.endChildren();
		return true;
	}
	
	//Checks for the different expressions
	function parseExpr(){
		CST.addNode("Expr", "branch");
		var type = getTokenType();
		var success;
		
		switch(type){
			case T_DIGIT:
				success = parseDigitExpr();
				CST.endChildren();
				return success;
			break;
			case T_OPENPAREN:
			case T_TRUE:
			case T_FALSE:
				success = parseBooleanExpr();
				CST.endChildren();
				return success;
			break;
			case T_QUOTE:
				success = parseStrExpr();
				CST.endChildren();
				return success;
			break;
			//Pass 'used' becuase Id should already be declared
			//Really should be a global variable
			case T_CHAR:
				success = parseId('used');
				CST.endChildren();
				return success;
			break;
			default:
				return false;
		}
		return false;
	}
	
	
	//Parse integer expressions
	// digit intop Expr
	// or just digit
	function parseDigitExpr(){
		var digitToken = tokenStream[0];
		CST.addNode("IntExpr", "branch");
		var digit = getTokenValue();
		if (parseDigit(digit)){
			CST.addNode("digit " + digit, "leaf");
			/*if(getTokenType() == T_PLUS){
				AST.addNode("+", "branch");
			}*/
			//AST.addNode(digit, "leaf");
			
			switch(getTokenType()){
				case T_PLUS:
					AST.addNode("+", "branch");
					AST.addNode(digit, "leaf");
					var success = parseSubIntExpr();
					AST.endChildren();
					return success;
				break;
			}
			
			AST.addNode(digit, "leaf");
			CST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function to parse expr = digit intop expr
	function parseSubIntExpr(){
		if(parseOp() && parseExpr()){
			CST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function to parse boolean expression 
	//(Expr boolop Expr) or boolval
	function parseBooleanExpr(){
		var success;
		CST.addNode("BooleanExpr", "branch");
	
		//If expression starts w/ ( --> boolean expression
		if(getTokenType() == T_OPENPAREN){
			return boolExpr();
		}
		//else boolval
		else{
			success = boolVal();
			CST.endChildren();
			return success;
		}
	}
	
	//Parse boolean expression ( Expr boolop Expr)
	function boolExpr(){
		CST.addNode("{", "leaf");
		AST.addNode(getTokenValue(), "branch");
		/*var current = tokenStream[0];
		while(current != T_EQUALITY || current ){
			
		}*/
		
		if(checkToken(T_OPENPAREN) && parseExpr()
			&& parseBoolOp() && parseExpr() && checkToken(T_CLOSEPAREN)){
				CST.addNode("}", "leaf");
				CST.endChildren();
				AST.endChildren();
				return true;
			}
		else{
			return false;
		}
	}
	
	//Parse possible boolean operations == or !=
	function parseBoolOp(){
		CST.addNode("boolop", "branch");
		switch(getTokenType()){
			case T_EQUALITY:
				if(checkToken(T_EQUALITY)){
					CST.addNode("==", "leaf");
					CST.endChildren();
					return true;
				}
			break;
			case T_NOTEQUAL:
				if(checkToken(T_NOTEQUAL)){
					CST.addNode("!=", "leaf");
					CST.endChildren();
					return true;
				}
			break;
			default:
				return false;
			}
		return false;
	}
	
	//Parse boolean values true or false
	function boolVal(){
		CST.addNode("boolval", "branch");
		switch(getTokenType()){
			case T_TRUE:
				if(checkToken(T_TRUE)){
					CST.addNode("true", "leaf");
					CST.endChildren();
					AST.addNode("true", "leaf");
					return true;
				}
			break;
			case T_FALSE:
				if(checkToken(T_FALSE)){
					CST.addNode("false", "leaf");
					CST.endChildren();
					AST.addNode("false", "leaf");
					return true;
				}
			default:
				putMessage("Error expecting boolean value on line " + getTokenLine());
				return false;
		}
		return false;
	}
	
	//Parse string expression " Charlist "
	function parseStrExpr(){
		CST.addNode("StringExpr", "branch");
		stringBuffer = "";
		
		if(parseQuote() && parseCharList() && parseQuote()){
			CST.endChildren();
			AST.addNode('"' + stringBuffer + '"', "leaf");
			return true;
		}
		else{
			return false;
		}
	}
	
	//Pase quotation marks
	function parseQuote(){
		if(checkToken(T_QUOTE)){
			CST.addNode("\"", "leaf");
			return true;
		}
		else{
			return false;
		}
	}
	
	//Parse Charlist
	//char Charlist
	//space Charlist
	//or epsilon
	function parseCharList(){
		CST.addNode("CharList", "branch");
		var success;
		//var charList = getTokenValue();
		//If type = character or space try to parse it
		//If not return true since can go to epsilon
		switch(getTokenType()){
			case T_CHAR:
				if(parseChar(true)){
					success = parseCharList();
					CST.endChildren();
					return success;
				}
				else{
					return false;
				}
			break;
			case T_SPACE:
				if(parseSpace(true)){
					CST.addNode("space","leaf");
					success = parseCharList();
					CST.endChildren();
					return success;
				}
				else{
					return false;
				}
				break;		
		}
		CST.endChildren();
		return true;
	}
	
	//Parse possible types int string or boolean
	function parseType(){
		CST.addNode("type","branch");
		switch(getTokenType()){
			case T_INT:
				if(checkToken(T_INT)){
					CST.addNode("int", "leaf");
					CST.endChildren();
					AST.addNode("int", "leaf");
					return true;
				}
			break;
			case T_STRING:
				if(checkToken(T_STRING)){
					CST.addNode("string", "leaf");
					CST.endChildren();
					AST.addNode("string", "leaf");
					return true;
				}
			break;
			case T_BOOLEAN:
				if(checkToken(T_BOOLEAN)){
					CST.addNode("boolean", "leaf");
					CST.endChildren();
					AST.addNode("boolean", "leaf");
					return true;
				}
			break;
			default:
				return false;
		}
		return false;
	}
	
	//Parse id
	//Status passed in depends how function is called
	function parseId(status){
		CST.addNode("Id", "branch");
		var id = getTokenValue();
		var success;
		//Check if id has even been declared
		if(status !== 'declared'){
			var id = getTokenValue();
			//if(! symbolTable.workingScope.hasId(id, true)){
				//moveToNextLine();
				//putMessage("Undeclared identifier " + id + " at line "+ getTokenLine());
			//}
			
			//id is valid
			if(status === 'initialized'){
				symbolTable.workingScope.isInitialized(id);
			}
			else if(status === 'used'){
				symbolTable.workingScope.usedSymbol(id);
			}
		}
		AST.addNode("Id: " + id, "leaf");
		success = parseChar(id);
		CST.addNode("char, " + id, "leaf");
		CST.endChildren();
		return success;
	}

	//Parse char a...z
	function parseChar(buffer){
		if (buffer) {
			stringBuffer += getTokenValue();
		}
		else {
			AST.addNode(getTokenValue(), "leaf");
		}
		
		if(checkToken(T_CHAR)){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Parse digit 0 - 9
	function parseDigit(digit){
		if(checkToken(T_DIGIT)){
			return true;
		}
		else{
			return false;
		}
	}
	
	
	//Function to parse op +
	function parseOp(){
		if(checkToken(T_PLUS)){
			CST.addNode("intop", "branch");
			CST.addNode("+", "leaf");
			CST.endChildren();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Parse space character
	function parseSpace(buffer){
		if (buffer){
			stringBuffer += getTokenValue();
		}
		else{
			AST.addNode(getTokenValue(), "leaf");
		}
		if(checkToken(T_SPACE)){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Helper Functions
	
	//Check expected token against what is actually found
	function checkToken(type){
		putMessage("Expecting " + type);
		
		//Get type of current token
		var currentTokenType = getTokenType();
		if(currentTokenType === type){
			putMessage("Found " + type);
			//If expected token found accept it
			if(acceptToken()){
				putMessage("Token accepted!");
				return true;
			}
			else{
				return false;
			}
		}
		// Expected token not found
		else if(currentTokenType != type){
			expectedTokenError(type);
			return false;
		}
		
		return false;
	}
	
	//Function to get type of token
	function getTokenType(){
		if(tokenStream.length > 0){
			return tokenStream[0].type;
		}
	}
	
	//Function to accept valid tokens
	function acceptToken(){
		lastToken = tokenStream[0];
		
		if(tokenStream.length > 0){
			tokenStream.splice(0,1);
			return true;
		}
		return false;
	}
	
	//Get value of specific token
	function getTokenValue(){
		if(tokenStream.length > 0){
			return tokenStream[0].value;
		}
		else if(lastToken !== undefined){
			return lastToken.value;
		}
		else{
			return '';
		}
	}
	
	//Get the line of specific token
	function getTokenLine(){
		if(tokenStream.length > 0){
			return tokenStream[0].line;
		}
		else if(lastToken !== undefined){
			return lastToken.line;
		}
		else{
			return 'Last line.';
		}
	}
	
	//In case of expected error move to the next line
	function moveToNextLine(){
		if(tokenStream.length > 0){
			var currentLine = getTokenLine();
			while(currentLine == getTokenLine()){
				acceptToken();
			}
		}
	}
	
	//Handle expected token errors
	function expectedTokenError(type){
		//Print error message
		putMessage("ERROR: Expected: " + type + " Found: " +getTokenType()+" on line " + getTokenLine()); 
		moveToNextLine();
		/*if(tokenStream.length > 0){
			tokenStream.splice(0,1);
			return true;
		}
		return false;*/
	
	}
	
	//Totally cheating
	function expectedErrAndMove(type){
		putMessage("ERROR: Expected: " + type + " Found: " +getTokenType()+" on line " + getTokenLine());
		
		if(tokenStream.length > 0){
			tokenStream.splice(0,1);
			return true;
		}
		return false;
	}
}