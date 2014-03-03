function Parser(tokenStream){

	var lastToken;
	var results = parseProgram();

	
	function parseProgram(){
		/*if(!parseStatement()){
			return false;
		}*/
		
		if(tokenStream.length > 0){
		alert("if 1");
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
		}
	}
	
	//Functions to determine the different statment forms
	function printStatement(){
		alert("Print statement");
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