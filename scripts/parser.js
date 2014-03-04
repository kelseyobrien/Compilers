function Parser(tokenStream){

	var lastToken;
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
		//if(parseId
	}
	
	//Variable declaration -- type Id
	function varDecl(){
	}
	
	//While statement -- while booleanExprBlock
	function whileStatement(){
		if(checkToken(T_WHILE) && parseBooleanExpr() ){
			return true;
		}
		else{
			return false;
		}
	}
	
	//If statement -- if booleanExpr Block
	function ifStatement(){
		if(checkToken(T_IF) && parseBooleanExpr() ){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Block -- { StatmentList }
	function block(){
	}
	
	//Statement list -- Statement StatementList
	function parseStatementList(){
		//Statement StatementList
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
			&& checkToken(T_EQUALITY) && parseExpr() && checkToken(T_CLOSEPAREN)){
				return true;
			}
		else{
			return false;
		}
	}
	
	function boolVal(){
		if(checkToken(T_TRUE) || checkToken(T_FALSE)){
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
}