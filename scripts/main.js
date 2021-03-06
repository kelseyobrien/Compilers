// Global variables
    var tokens = "";
    var tokenIndex = 0;
    var currentToken = "";
    var errorCount = 0;
    var EOF = "$";
	var CST;
	var AST;
	var SymbolTableList = [];
	var semanticErrorCount = 0;
	var parseErrorCount = 0;

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
			putMessage("-------------------------");
			putMessage("Parse Started");
			putMessage("-------------------------");
			Parser(tokens);
		}
		
		if(errorCount == 0 && parseErrorCount == 0){
			putMessage("-------------------------");
			putMessage("Parse Returned");
			putMessage("-------------------------");
			putMessage("Semantic Analysis Started");
			putMessage("-------------------------");
			//while(semanticErrorCount === 0){
				semanticAnalysis();
			//}
		}
		
		if(errorCount == 0 & parseErrorCount == 0 && semanticErrorCount == 0){
			codeGen(AST);
		}
    }
    
    function putMessage(msg)
    {
        document.getElementById("taOutput").value += msg + "\n";
    }
	
	function putWarnings(msg)
    {
        document.getElementById("taWarnings").value += msg + "\n";
    }
	
	function putSymbolTable(msg)
    {
        document.getElementById("taSymbolTable").value += msg + "\n";
    }
	function putCSTAST(msg)
    {
        document.getElementById("taCSTAST").value += msg + "\n";
    }
	
	function putCode(msg){
		document.getElementById("taCode").value += msg;
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
		document.getElementById("taSourceCode").value = "{\nint a \n}\n$";
	}
	
	function btnDecVarErr(){
		document.getElementById("taSourceCode").value = "{\n string 1 \n}\n$";
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
	function btnSTScope(){
		document.getElementById("taSourceCode").value = "{\n int a \n a = 1 \n { \n     int a \n     a = 2 \n } \n string b \n b = \"alan\" \n }\n$";
	}
	function btnTypeMismatch(){
		document.getElementById("taSourceCode").value = "{\n string a \n a = \"sflkjsf\" \n { \n while( a != 2 ){ \n     int t \n     t = 6 \n}\n}}$";
	}
	function btnSATest(){
		document.getElementById("taSourceCode").value = "{ \nint a \na = 0 \nstring z \nz = \"bond\" \nwhile(a != 9){ \n     if(a != 5){ \n     print(\"bond\") \n}\n{\na = 1 + a \nstring b \nb = \"james bond\" \nprint(b) \n}\n}}$"
	}
	function btnDecErr(){
		document.getElementById("taSourceCode").value ="{\nboolean c\nc = true\nboolean d\nd = (true ==(true == false))\nd = (a == b)\n}$";
	}
	function btnBoolExpr(){
		document.getElementById("taSourceCode").value = "{\nboolean c\nc = true\nboolean d\nd = (1 != 1)\nboolean a\na = (\"string\" == \"string\")\n}$";
	}
	function btnNestedIf(){
		document.getElementById("taSourceCode").value = "{\nboolean d\nif(d == true){\n     int c\n     c = 1\n     if(c == 1){\n          print(\"ugh\")\n} \n} \n}$";
	}
	
	function btnGoodTest1(){
		document.getElementById("taSourceCode").value = "{ \n int a\n a = 0\nif(a == 0){\nprint(a)\n}\n}\n$";
	}
	
	function btnGoodTest2(){
		document.getElementById("taSourceCode").value = "{\nprint(\"sdlkfjslkfdjdslk\")\n}$";
	}
	
	function btnGoodTest3(){
		document.getElementById("taSourceCode").value = "{\nint a\nint b\nb = 2\na = 3 + b\nprint(a)\n}$";
	}
	
	function btnGoodTest4(){
		document.getElementById("taSourceCode").value = "{\nboolean b\nb = true\nboolean a\na = false\nif(a != b){\nprint(a)\nprint(b)\n}\n}$";
	}