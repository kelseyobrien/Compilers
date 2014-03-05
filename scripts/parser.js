function Parser(tokenStream){

	var lastToken;
	var symbolTable = new SymbolTable();
	var results = parseProgram();
	

	
	function parseProgram(){
		if(!parseStatement()){
			return false;
		}
		
		if(tokenStream.length > 0){
			if(checkToken(T_EOF)){
				return true;
			}
			else{
				return false;
			}
		}
		else{
			putMessage("Warning: Program did not end with $.");
		}
	}
	
	function parseStatement(){
		var type = getTokenType();
		switch(type){
			case T_PRINT:
				return printStatement();
			break;
			case T_CHAR:
				return assignmentStatement();
			break;
			case T_INT:
			case T_STRING:
			case T_BOOLEAN:
				return varDecl();
			break;
			case T_WHILE:
				return whileStatement();
			break;
			case T_IF:
				return ifStatement();
			break;
			case T_OPENBRACE:
				return block();
			break;
			
		}
	}
	
	//Functions to determine the different statement forms
	
	//Print statement
	function printStatement(){
		if(checkToken(T_PRINT) && checkToken(T_OPENPAREN) 
			&& parseExpr() && checkToken(T_CLOSEPAREN)){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Assignment Statement -- Id = Expr
	function assignmentStatement(){
		if(parseId('initialized') && checkToken(T_EQUAL)
			&& parseExpr()){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Variable declaration -- type Id
	function varDecl(){
		var tokenType = tokenStream[0];
		var tokenID = tokenStream[1];
		
		if(parseType() && parseId('declared')){
			if(! symbolTable.addIdentifier(tokenID, tokenType)){
				putMessage("Redeclaration of Identifier: " + tokenID.value + " at line "+ tokenID.line);
			}
		return true;
		}
		else{
			return false;
		}
		
	}
	
	//While statement -- while booleanExprBlock
	function whileStatement(){
		if(checkToken(T_WHILE) && parseBooleanExpr() && block() ){
			return true;
		}
		else{
			return false;
		}
	}
	
	//If statement -- if booleanExpr Block
	function ifStatement(){
		if(checkToken(T_IF) && parseBooleanExpr() && block()){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Block -- { StatmentList }
	function block(){
		symbolTable.openScope();
		if(checkToken(T_OPENBRACE) && parseStatementList() 
			&& checkToken(T_CLOSEBRACE)){
			symbolTable.closeScope();
			return true;
		}
		else{
			return false;
		}
	}
	
	//Statement list -- Statement StatementList
	function parseStatementList(){
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
				return parseStatementList();
			break;
			default:
				return true;	
		}
		return true;
	}
	
	//Checks for expression
	function parseExpr(){
		var type = getTokenType();
		switch(type){
			case T_DIGIT:
				return parseIntExpr();
			break;
			case T_OPENPAREN:
			case T_TRUE:
			case T_FALSE:
				return parseBooleanExpr();
			break;
			case T_QUOTE:
				return parseStrExpr();
			break;
			//Pass 'used' becuase Id should already be declared
			case T_CHAR:
				return parseId('used');
			break;
			default:
				return false;
		}
		return false;
	}
	
	
	function parseIntExpr(){
		var digitToken = tokenStream[0];
		if (checkToken(T_DIGIT)){
			//Look ahead to see if there is an operator following
			switch(getTokenType()){
				case T_PLUS:
				case T_MINUS:
					return parseSubIntExpr();
				break;
			}
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function to parse expr = digit intop expr
	function parseSubIntExpr(){
		if(parseOp() && parseExpr()){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Function to parse boolean expression 
	//(Expr boolop Expr) or boolval
	function parseBooleanExpr(){
		//If expression starts w/ ( --> boolean expression
		//else boolval
		if(getTokenType() == T_OPENPAREN){
			return boolExpr();
		}
		else{
			return boolVal();
		}
	}
	
	function boolExpr(){
		if(checkToken(T_OPENPAREN) && parseExpr()
			&& parseBoolOp() && parseExpr() && checkToken(T_CLOSEPAREN)){
				return true;
			}
		else{
			return false;
		}
	}
	
	function parseBoolOp(){
	}
	
	
	function boolVal(){
		if(checkToken(T_TRUE) || checkToken(T_FALSE)){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseStrExpr(){
		if(parseQuote() && parseCharList() && parseQuote()){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseQuote(){
		if(checkToken(T_QUOTE)){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseCharList(){
		//If type = character or space try to parse it
		//If not return true since can go to epsilon
		switch(getTokenType()){
			case T_CHAR:
				if(parseChar()){
					return parseCharList();
				}
				else{
					return false;
				}
			break;
			case T_SPACE:
				if(parseSpace()){
					return parseCharList();
				}
				else{
					return false;
				}
				break;		
		}
		return true;
	}
	
	function parseType(){
		if(checkToken(T_INT) || checkToken(T_STRING) || checkToken(T_BOOLEAN)){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseId(status){
		if(status !== 'declared'){
			var id = getTokenValue();
			if(! symbolTable.workingScope.hasId(id, true)){
				putMessage("Undeclared identifier " + id + " at line "+ getTokenLine());
			}
			else if(status === 'initialized'){
				symbolTable.workingScope.initializedSymbol(id);
			}
			else if(status === 'used'){
				symbolTable.workingScope.usedSymbol(id);
			}
		}
		return parseChar();
		
	}
	
	function parseChar(){
		if(checkToken(T_CHAR)){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseInt(){
		if(checkToken(T_DIGIT)){
			return true;
		}
		else{
			return false;
		}
	}
	
	
	//Function to parse ops (+ | -)
	function parseOp(){
		if(checkToken(T_PLUS) || checkToken(T_MINUS)){
			return true;
		}
		else{
			return false;
		}
	}
	
	function parseSpace(){
		if(checkToken(T_SPACE)){
			return true;
		}
		else{
			return true;
		}
	}
	
	//Helper Functions
	
	
	function checkToken(type){
		putMessage("Expecting " + type);
		
		//Get type of current token
		var currentTokenType = getTokenType();
		if(currentTokenType === type){
			putMessage("Found " + type);
			
			if(acceptToken()){
				putMessage("Token accepted!");
				return true;
			}
			else{
				return false;
			}
		}
		else if(currentTokenType != type){
			expectedTokenError(type);
			return false;
		}
		
		return false;
	}
	
	/*//Function to check multiple tokens at once
	//Tried to use or operator to check in specific functions
	// but it makes the output messy and annoying
	function checkMultipleTokens(types){
		for(var index in types){
			var type = types[index];
			var currentTokenType = getTokenType();
			
			if(currentTokenType === type){
				putMessage("Found " + type);
				if(acceptToken()){
					putMessage("Token accepted!");
					return true;
				}
			}
		
		//If it gets to here then valid token not found
		expectedTokenError(types.join("|"));
		return false;
	}*/
	
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
	
	function expectedTokenError(type){
		putMessage("Expected: " + type + " Found: " +getTokenType()); 
		
	}
}