// Tree object to be used for CST and AST
var Tree = function(){
	this.root = null;
	this.current = null;
	
	//Add a node to the tree
	//Type = branch or leaf
	this.addNode = function(name, type, token){
		var node = new Node(name, token);
		
		//Check to see if root needs to be created
		if(this.root == null){
			this.root = node;
		}
		else {
			node.parent = this.current;
			this.current.children.push(node);
		}
		
		//See what type of node
		if(type == "branch"){
			this.current = node;
		}
	}

	//Function to move up to the parent node if possible
	this.endChildren = function(){
		if(this.current.parent !==null){
			this.current = this.current.parent;
		}
		else {
			putMessage("Error: Problem occured during tree traversal.");
		}
	}

	//Returns a string representation of the tree
	this.toString = function(){
		var result = "";
		
		function traverse(node, depth){
			for (var i = 0; i < depth; i++){
				result += "-";
			}
			
			if(node.children === null || node.children.length === 0){
				result += "[" + node.name + "] depth: " + depth;
				result += "\n";
			}
			else { //There are children
				result += "<" + node.name + "> depth: " + depth + "\n";
				for (var i = 0; i < node.children.length; i++) {
					traverse(node.children[i], depth + 1);
				}
			}
		}
		
		//Initial call
		traverse(this.root, 0);
		return result;
	}
}

//Single unit in the tree
var Node = function(name, token){
	this.name = name;
	this.token = token;
	this.children = [];
	this.parent = {};
	
	/*this.getType = function(){
		return this.token.type;
	}
	
	this.getValue = function(){
		this.token.value;
	}*/
	
	this.getLine = function(){
		return this.token.line;
	}
}

