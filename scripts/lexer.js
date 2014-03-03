/* lexer.js  */

function Lexer(sourceCode)
{
	//Information to keep track of throughout the process	
	var currentLine = 1;
	var errors = new Array();
	var inQuotes = false;
	
	//Start lex process
	var allTokens = new Array();
	allTokens = lex(sourceCode);
	return allTokens;
	
	//Lex process
	function lex(sourceCode){
		var tokenType = getToken(sourceCode);
		var length = getTokenLength(tokenType);

		//Remove found token from source code
		var updatedSource = sourceCode.substr(length);
	
		//New token to be used throughout process
		var tokenTemp = new Token();
		
		switch(tokenType) {
			case T_NEWLINE:
				currentLine++;
			case T_SPACE:
				//If in quotes get value of string
				if(inQuotes){
					tokenTemp.type = tokenType;
					tokenTemp.line = currentLine;
					tokenTemp.value = sourceCode.substr(0, length);
				}
				else {
						return lex(updatedSource);
				}
			break;
			case null:
				putMessage('Unknown Token --> '+ sourceCode[0] + ' <-- at line ' + currentLine);
				
			break;
			case T_QUOTE:
				if(inQuotes){
					inQuotes = false;
				}
				else{
					inQuotes = true;
				}
			default:
				tokenTemp.type = tokenType;
				tokenTemp.line = currentLine;
				tokenTemp.value = sourceCode.substr(0, length);
			}
			
			//Return array of tokens
			if(updatedSource.length > 0){
				return new Array(token).concat(lex(updatedSource));
			}
			else{
				return new Array(tokenTemp);
			}
	}	
	//Helper Functions
	
	//Function to get token from Tokens array if valid
	function getToken(sourceCode)
	{
		for (token in Tokens){
			if(inQuotes && Tokens[token].length > 1){
				continue;
			}
			var regularExpr = Tokens[token].regex;
			try{
				if(regularExpr.test(sourceCode)){
					putMessage("Found Token :" + token);
					return token;
				}
			}
			catch(e){
				return null;
			}
		}
		//No valid tokens found
		return null;
	}

	//Function to get Token length or return 1 if token not found
	function getTokenLength(tokenType)
	{
		if(tokenType in Tokens){
			return Tokens[tokenType].length;
		}
		else{
			return 1;
		}
	}
	
	function getErrors()
	{
		return errors;
	}

}
