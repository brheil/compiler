// parser v.2.0
// Brian Heil


function parse() {
	//initialize parse index to 0
	var parseIndex = 0;
	// initialize error boolean to false
	var errorBool = false;
	// initialize currNodeIndex to 1
	var currNodeIndex = 1;
	
	// treeToken function for creating nodes on the CST and AST
	function TreeToken(par, val) {
		this.parent = par;
		this.value = val ;
		this.children = [];
	}
	
	// initialize scope
	var scope = 0;
	// initialize symbol table
	var symbolTable = new TreeToken(null, scope);
	var tableNode = symbolTable;
	
	
	// initialize CST
	var superRootCST = new TreeToken(null, null);
	// initialize currentNode to the superRoot
	var currentNode = superRootCST;
	
	// node creator, creates a new node on a tree (CST or AST)
	function newNode(par, val) {
		var theNode = new TreeToken(par, val);
		par.children.push(theNode);
	}
		
	// parse a statement
	function parseStatement(returnNode) {
		if(!errorBool) {
			putMessage("Expecting start of statement ...");
			newNode(currentNode, "Statement");
			currentNode = currentNode.children[currentNode.children.length - 1];
			if(tokens[parseIndex].type === "symbol") {
				// look for either print or {
				if(tokens[parseIndex].value === "print") {
					// found print
					putMessage("Found start of Statement (Print)");
					newNode(currentNode, "Print");
					parsePrint(currentNode);
				}
				else if(tokens[parseIndex].value === "{") {
					// found statement list
					newNode(currentNode, tokens[parseIndex]);
					parseIndex = parseIndex + 1;
					putMessage("Found start of statement (Statement List)");
					newNode(currentNode, "StatementList");
					parseStatementList(currentNode);
					if(!errorBool) {
						newNode(currentNode, tokens[parseIndex]);
						parseIndex = parseIndex + 1;
					}
				}
				else {
					putMessage("Error! Found symbol: \"" + tokens[parseIndex].value +
								"\" (line " + tokens[parseIndex].line + ")");
					errorBool = true;
				}
			}
			else if(tokens[parseIndex].type === "type") {
				// found int or string or boolean
				putMessage("Found start of statement (Variable Declaration)");
				newNode(currentNode, "VarDec");
				parseVarDec(currentNode);
			}
			else if(tokens[parseIndex].type === "char") {
				// found char
				putMessage("Found start of statement (Id Assignment)");
				newNode(currentNode, "IdAss");
				parseIdAss(currentNode);
			}
			else if(tokens[parseIndex].type === "cond") {
				// found conditional
				if(tokens[parseIndex].value === "if") {
					putMessage("Found start of statement (If Statement)");
					newNode(currentNode, "IfS");
					parseIfS(currentNode);
				}
				else {
					putMessage("Found start of statement (While Statement)");
					newNode(currentNode, "WhileS");
					parseWhileS(currentNode);
				}
			}
			else {
				// error
				putMessage("Error! Found invalid token: " + tokens[parseIndex].value +
							" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
			currentNode = returnNode;
		}
	}
	
	// parse a Print
	function parsePrint(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			putMessage("Expecting token: \"(\" ...");
			if(tokens[parseIndex].value === "(") {
				// found a (
				putMessage("Found token: \"(\"");
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				newNode(currentNode, "Expression");
				putMessage("Expecting start of expression ...");
				parseExpr(currentNode);
				if(!errorBool) {
					putMessage("Expecting token: \")\" ...");
					if(tokens[parseIndex].value === ")") {
						// found a )
						putMessage("Found token: \")\"");
						newNode(currentNode, tokens[parseIndex]);
						parseIndex = parseIndex + 1;
						currentNode = returnNode;
					}
					else {
						// error
						putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
									"\" (line " + tokens[parseIndex].line + ")");
						errorBool = true;
					}
				}
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
		}
	}
	
	// parse Statement List
	function parseStatementList(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			scope = scope + 1;
			newNode(tableNode, scope);
			tableNode = tableNode.children[tableNode.children.length - 1];
			if(tokens[parseIndex].value === "}") {
				putMessage("Found symbol: \"}\"");
			}
			else {
				parseListofState(currentNode);
			}
			currentNode = returnNode;
			tableNode = tableNode.parent;
		}
	}
	
	// parse list of statements
	function parseListofState(returnNode) {
		if(!errorBool) {
			if(tokens[parseIndex].value === "}") {
				putMessage("Found symbol: \"}\"");
			}
			else if(tokens[parseIndex].type === "end") {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
			else {
				parseStatement(currentNode);
				if(!errorBool) {
					parseListofState(currentNode);
				}
			}
		}
	}
	
	// parse Id Assignment
	function parseIdAss(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			putMessage("Found character: " + tokens[parseIndex].value);
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			putMessage("Expecting symbol: \"=\" ...");
			if(tokens[parseIndex].value === "=") {
				// found the equal sign
				putMessage("Found symbol: \"=\"");
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				putMessage("Expecting start of expression ...");
				newNode(currentNode, "Expression");
				parseExpr();
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
		}
	}
	
	// parse variable declaration
	function parseVarDec(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			putMessage("Found type: " + tokens[parseIndex].value);
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			putMessage("Expecting ID ...");
			if(tokens[parseIndex].type === "char") {
				// found a char
				putMessage("Found character: " + tokens[parseIndex].value);
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
				parseIndex = parseIndex + 1;
			}
			currentNode = returnNode;
		}
	}
	
	// parse if statement
	function parseIfS(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			putMessage("Found conditional: " + tokens[parseIndex].value);
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			putMessage("Expecting boolean expr ...");
			newNode(currentNode, "Expression");
			currentNode = currentNode.children[currentNode.children.length - 1];
			newNode(currentNode, "BoolExpr");
			parseBoolExpr(currentNode);
			currentNode = currentNode.parent;
			if(!errorBool) {
				putMessage("Expecting Statement ...");
				if(tokens[parseIndex].value === "{") {
					// found statement list
					newNode(currentNode, tokens[parseIndex]);
					parseIndex = parseIndex + 1;
					putMessage("Found start of statement (Statement List)");
					newNode(currentNode, "StatementList");
					parseStatementList(currentNode);
					if(!errorBool) {
						newNode(currentNode, tokens[parseIndex]);
						parseIndex = parseIndex + 1;
					}
				}
				else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
				parseIndex = parseIndex + 1;
				}
				currentNode = returnNode;
			}
			
		}
	}
	
	// parse while statement
	function parseWhileS(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			putMessage("Found conditional: " + tokens[parseIndex].value);
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			putMessage("Expecting boolean expr ...");
			newNode(currentNode, "Expression");
			currentNode = currentNode.children[currentNode.children.length - 1];
			newNode(currentNode, "BoolExpr");
			parseBoolExpr(currentNode);
			currentNode = currentNode.parent;
			if(!errorBool) {
				putMessage("Expecting Statement List ...");
				if(tokens[parseIndex].value === "{") {
					// found statement list
					newNode(currentNode, tokens[parseIndex]);
					parseIndex = parseIndex + 1;
					putMessage("Found start of statement (Statement List)");
					newNode(currentNode, "StatementList");
					parseStatementList(currentNode);
					if(!errorBool) {
						newNode(currentNode, tokens[parseIndex]);
						parseIndex = parseIndex + 1;
					}
				}
				else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
				parseIndex = parseIndex + 1;
				}
				currentNode = returnNode;
			}
			
		}
	}
	
	// parse expressions
	function parseExpr(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			if(tokens[parseIndex].value === "\"") {
				// found a charList
				putMessage("Found start of expression (String Exp):");
				newNode(currentNode, "StringExpr");
				parseStringExpr(currentNode);
			}
			else if(tokens[parseIndex].type === "digit") {
				// found a digit
				putMessage("Found start of expression (Integer Exp)");
				newNode(currentNode, "IntExpr");
				parseIntExpr(currentNode);
			}
			else if(tokens[parseIndex].type === "char") {
				// found a char
				putMessage("Found expression (ID): " + tokens[parseIndex].value);
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
			}
			else if(tokens[parseIndex].value === "(") {
				// found bool exp
				putMessage("Found start of expression (boolean)");
				newNode(currentNode, "BoolExpr");
				parseBoolExpr(currentNode);
			}
			else if(tokens[parseIndex].type === "bool") {
				// found a single boolean
				putMessage("Found start of expression (boolean)");
				newNode(currentNode, "BoolExpr");
				parseBoolExpr(currentNode);
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
			currentNode = returnNode;
		}
	}
	
	// parse Integer Expression
	function parseIntExpr(returnNode) {
		currentNode = currentNode.children[currentNode.children.length - 1];
		putMessage("Found digit: " + tokens[parseIndex].value);
		newNode(currentNode, tokens[parseIndex]);
		parseIndex = parseIndex + 1;
		// int exp can be a single digit or an op plus another expr
		// got to check to make sure it isnt a single digit
		if(tokens[parseIndex].type === "op") {
			putMessage("Found operator: " + tokens[parseIndex].value);
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			newNode(currentNode, "Expression");
			parseExprAfterInt(currentNode);
		}
		currentNode = returnNode;
	}
	
	// parse expr after getting into a int expr (only allow ID and int expr)
	function parseExprAfterInt(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			if(tokens[parseIndex].type === "digit") {
				// found a digit
				putMessage("Found start of expression (Integer Exp)");
				newNode(currentNode, "IntExpr");
				parseIntExpr(currentNode);
			}
			else if(tokens[parseIndex].type === "char") {
				// found a char
				putMessage("Found expression (ID): " + tokens[parseIndex].value);
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
			currentNode = returnNode;
		}
	}
	
	
	// parse String Expression
	function parseStringExpr(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			newNode(currentNode, tokens[parseIndex]);
			parseIndex = parseIndex + 1;
			newNode(currentNode, "CharList");
			parseCharList(currentNode);
			if(tokens[parseIndex].value === "\"") {
				// found end of char list
				putMessage("Found end of character list: \"");
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				currentNode = returnNode;
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
			currentNode = returnNode;
		}
	}
	
	// parse Boolean Expression
	function parseBoolExpr(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			if(tokens[parseIndex].value === "(") {
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				newNode(currentNode, "Expr");
				parseExpr(currentNode);
				if(!errorBool) {
					if(tokens[parseIndex].value === "==") {
						// found == between exprs
						newNode(currentNode, tokens[parseIndex]);
						parseIndex = parseIndex + 1;
						newNode(currentNode, "Expr");
						parseExpr(currentNode);
						if(!errorBool) {
							if(tokens[parseIndex].value === ")") {
								// found end of bool expr
								newNode(currentNode, tokens[parseIndex]);
								parseIndex = parseIndex + 1;
								currentNode = returnNode;
							}
						}
					}
				}
			}
			else if(tokens[parseIndex].type === "bool") {
				// found a boolean
				putMessage("Found boolean: " + tokens[parseIndex].value);
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				currentNode = returnNode;
			}
			else {
				// error
				putMessage("Error! Found invalid token: \"" + tokens[parseIndex].value +
							"\" (line " + tokens[parseIndex].line + ")");
				errorBool = true;
			}
		}
	}
	
	// parse character lists
	function parseCharList(returnNode) {
		if(!errorBool) {
			currentNode = currentNode.children[currentNode.children.length - 1];
			if(tokens[parseIndex].type === "char") {
				// found a char
				putMessage("Found character: " + tokens[parseIndex].value);
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				newNode(currentNode, "CharList");
				parseCharList(currentNode);
			}
			else if(tokens[parseIndex].type === "space") {
				// found a space
				putMessage("Found a space!");
				newNode(currentNode, tokens[parseIndex]);
				parseIndex = parseIndex + 1;
				newNode(currentNode, "CharList");
				parseCharList(currentNode);
			}
			currentNode = returnNode;
		}
	}
	
	// display the symbol table
	/*function symTabDisplay(scop, returnNode) {
		if(tableNode.children.length === 0) {
			putMessage("Empty!");
		}
		for(var x = 0; x < tableNode.children.length; x++) {
			if(isNaN(tableNode.children[x].value)) {
				putMessage(tableNode.children[x].value.val + " - " + tableNode.children[x].value.typ);
				if(!tableNode.children[x].value.initB) {
					putMessage("Warning! Symbol: " + tableNode.children[x].value.val + " is uninitialized");
				}
			}
			else {
				tableNode = tableNode.children[x];
				scop = scop + 1;
				putMessage("Scope " + scop + ":");
				symTabDisplay(scop, tableNode);
				putMessage("(End Scope " + scop + ")");
			}
			tableNode = returnNode;
		}
	}*/
	
	// parse it!
	function parseGo() {
		//if(tokens[0].type === "end") {
		//	putMessage("Program empty. Please write a program then come back.");
		//}
		//else {
			parseStatement(currentNode);
			if(errorBool) {
				putMessage("Parsing failed!");
			}
			else if (parseIndex >= tokens.length || tokens[parseIndex].type === "end") {
				putMessage("Parsing successful! Program accepted!");
				//console.log(superRootCST);
				typeChecker(superRootCST);
			}
			else {
				putMessage("Parsing failed! Excess code found outside statement list.");
			}
		//}
	}
	
	// finally, call parseGo
	putMessage("\nBeginning parsing!");
	parseGo();
}