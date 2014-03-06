// Global variables
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;
    var EOF = "$";

    function init()
    {
        // Clear the message box.
        document.getElementById("taOutput").value = "";
        // Set the initial values for our globals.
        tokens = "";
        tokenIndex = 0;
        currentToken = ' ';
        errorCount = 0;        
    }
    
    function btnCompile_click()
    {        
        // This is executed as a result of the usr pressing the 
        // "compile" button between the two text areas, above.  
        // Note the <input> element's event handler: onclick="btnCompile_click();
        init();
		
        // Grab the "raw" source code.
        var sourceCode = document.getElementById("taSourceCode").value;
        // Trim the leading and trailing spaces.
        sourceCode = trim(sourceCode);

		if (sourceCode == ""){
			putMessage("Error: there was no input to compile.");
		}
		else{
			putMessage("Compilation Started");
			putMessage("--------------------");
			putMessage("Lex started");
			tokens = Lexer(sourceCode);
			putMessage("--------------------");
			putMessage("Lex returned.");
			}
        // . . . and parse!
		if(errorCount == 0){
			putMessage("--------------------");
			putMessage("Parse Started");
			Parser(tokens);
		}
    }
    
    function putMessage(msg)
    {
        document.getElementById("taOutput").value += msg + "\n";
    }
    
    
    function parse()
    {
        putMessage("Parsing [" + tokens + "]");
        // Grab the next token.
        currentToken = getNextToken();
        // A valid parse derives the G(oal) production, so begin there.
        //parseG();
        // Report the results.
        //putMessage("Parsing found " + errorCount + " error(s).");        
    }
    

    function getNextToken()
    {
        var thisToken = EOF;    // Let's assume that we're at the EOF.
        if (tokenIndex < tokens.length)
        {
            // If we're not at EOF, then return the next token in the stream and advance the index.
            thisToken = tokens[tokenIndex];
            putMessage("Current token:" + thisToken);
            tokenIndex++;
        }
        return thisToken;
    }
	
	//Functions for test cases
	function btnLexErr(){
		document.getElementById("taSourceCode").value = "{\n    !@#%^&*()_\n}\n$";
	}
	function btnDecVar1(){
		document.getElementById("taSourceCode").value = "int a\n$";
	}
	
	function btnDecVarErr(){
		document.getElementById("taSourceCode").value = "string 1\n$";
	}
	
	function btnStmnt(){
		document.getElementById("taSourceCode").value = "{\n    print(\"daniel craig\")\n    string b\n\n    b = \"string\"\n}\n$";
	}
	
	function btnWhileStmnt(){
		document.getElementById("taSourceCode").value = "{\n    while( 4 != 2 ){\n    int t\n\n    t = 6\n     }\n}\n$";
	}
	
	function btnIdErr(){
		document.getElementById("taSourceCode").value = "{\n    int 1\n    string 42\n}\n$";
	}
	
	function btnIfStmntErr(){
		document.getElementById("taSourceCode").value = "{\n    if( 6 == 2 ){\n    print(\"hello world\")\n    }\n$";
	}
	
	function btnEOFErr(){
		document.getElementById("taSourceCode").value = "{\n    $\n}\n$";
	}
	
	function btnEOFWarn(){
		document.getElementById("taSourceCode").value = "{\n    print(\"hello\")\n}";
	}
	
	function btnParseError(){
		document.getElementById("taSourceCode").value = "{\n    string b\n    b = \"this 1s a t35t\"\n}\n$";
	}
	
	function btnParseError2(){
		document.getElementById("taSourceCode").value = "{\n    print(\"start 0f example\")\n    int a\n    string b\n\n    a = a + 4 + 5\n    a = 1 + a\n\n    b = \"string\"\n  }\n \n$";
	}
	
	function btnRedecErr(){
		document.getElementById("taSourceCode").value = "{\n    int a\n    a = 1\n    a = 5 + a\n\n    string a\n}\n$";
	}