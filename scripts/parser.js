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
			putMessage("Ignoring...but don't let it happen again.");
		}
	}
	
	//Determine which statement to parse
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
	
	//Checks for the different expressions
	function parseExpr(){
		var type = getTokenType();
		switch(type){
			case T_DIGIT:
				return parseDigitExpr();
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
			//Really should be a global variable
			case T_CHAR:
				return parseId('used');
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
		if (checkToken(T_DIGIT)){
			//Look ahead to see if there is an operator following
			switch(getTokenType()){
				case T_PLUS:
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
		if(getTokenType() == T_OPENPAREN){
			return boolExpr();
		}
		//else boolval
		else{
			return boolVal();
		}
	}
	
	//Parse boolean expression ( Expr boolop Expr)
	function boolExpr(){
		if(checkToken(T_OPENPAREN) && parseExpr()
			&& parseBoolOp() && parseExpr() && checkToken(T_CLOSEPAREN)){
				return true;
			}
		else{
			return false;
		}
	}
	
	//Parse possible boolean operations == or !=
	function parseBoolOp(){
		switch(getTokenType()){
			case T_EQUALITY:
				if(checkToken(T_EQUALITY)){
					return true;
				}
			break;
			case T_NOTEQUAL:
				if(checkToken(T_NOTEQUAL)){
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
		switch(getTokenType()){
			case T_TRUE:
				if(checkToken(T_TRUE)){
					return true;
				}
			break;
			case T_FALSE:
				if(checkToken(T_FALSE)){
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
		if(parseQuote() && parseCharList() && parseQuote()){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Pase quotation marks
	function parseQuote(){
		if(checkToken(T_QUOTE)){
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
	
	//Parse possible types int string or boolean
	function parseType(){
		switch(getTokenType()){
			case T_INT:
				if(checkToken(T_INT)){
					return true;
				}
			break;
			case T_STRING:
				if(checkToken(T_STRING)){
					return true;
				}
			break;
			case T_BOOLEAN:
				if(checkToken(T_BOOLEAN)){
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
		//Check if id has even been declared
		if(status !== 'declared'){
			var id = getTokenValue();
			if(! symbolTable.workingScope.hasId(id, true)){
				putMessage("Undeclared identifier " + id + " at line "+ getTokenLine());
			}
			
			//id is valid
			if(status === 'initialized'){
				symbolTable.workingScope.isInitialized(id);
			}
			else if(status === 'used'){
				symbolTable.workingScope.usedSymbol(id);
			}
		}
		return parseChar();	
	}

	//Parse char a...z
	function parseChar(){
		if(checkToken(T_CHAR)){
			return true;
		}
		else{
			return false;
		}
	}
	
	//Parse digit 0 - 9
	function parseDigit(){
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
			return true;
		}
		else{
			return false;
		}
	}
	
	//Parse space character
	function parseSpace(){
		if(checkToken(T_SPACE)){
			return true;
		}
		else{
			return true;
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
		// Expected topen not found
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
		//Discard rest of the line in case of an expected error
		moveToNextLine();
		//Print error message
		putMessage("ERROR: Expected: " + type + " Found: " +getTokenType()+" on line " + getTokenLine()); 
		
	}
}