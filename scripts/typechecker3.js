// Type Checker, v1.0
// Brian Heil

function typeChecker(superRootCST) {
	// type check stuff
	
	// error bool
	var errorBoolean = false;
	
	// treeToken function for creating nodes on the CST and AST
	function TreeToken(par, val) {
		this.parent = par;
		this.value = val ;
		this.children = [];
	}
	
	// node creator, creates a new node on a tree (CST or AST)
	function newNode(par, val) {
		var theNode = new TreeToken(par, val);
		par.children.push(theNode);
	}
	
	// initialize the super root for ast
	var superRootAST = new TreeToken(null, null);
	
	// initialize symbol table
	var scope = 0;
	var symbolTable = new TreeToken(null, scope);
	var tableNode = symbolTable;
	
	// function to see if variable is already declared
	function isDeclared(tableNodey, vari, typi, parentNode, scopeBool) {
		var foundit = false;
		for(var x = 0; x < tableNodey.children.length; x++) {
			if(isNaN(tableNodey.children[x].value)) {
				if(tableNodey.children[x].value.value === vari) {
					if(tableNodey.children[x].value.type === typi) {
						if(scopeBool) {
							putMessage("Error: Incorrect variable declaration - " + vari);
							putMessage("Previously declared in this scope!");
							errorBoolean = true;
							foundit = true;
							break;
						}
						else {
							putMessage("Warning: Redeclared variable - " + vari);
							putMessage("Previously declared in scope " + tableNodey.children[x].value.symScope);
							foundit = true;
							break;
						}
					}
					else if(typi === "undefined") {
						tableNodey.children[x].value.initB = true;
						foundit = true;
						return tableNodey.children[x].value.type;
					}
					else if (scopeBool) {
						putMessage("Error: Incorrect variable declaration - " + vari);
						putMessage("Declared in scope " + tableNodey.children[x].value.symScope);
						errorBoolean = true;
						foundit = true;
						break;
					}
				}
			}
		}
		if(!foundit && tableNodey === symbolTable) {
			if(typi === "undefined") {
				putMessage("Error: Undeclared variable " + vari);
				errorBoolean = true;
			}
			else {
				newNode(parentNode, {value: vari, type: typi, symScope: scope, initB: false});
			}
		}
		else if (!foundit && tableNodey !== symbolTable) {
			isDeclared(tableNodey.parent, vari, typi, parentNode, false);
		}
	}

	
	// Statements are broken into 6 categories
	// 1) Print Statement (PS)
	//		- one child (an expression)
	// 2) ID Assign Statement (IAS)
	//		- two children (an ID followed by an expression)
	// 3) Var Dec Statement (VDS)
	//		- two children (type followed by an ID)
	// 4) Statement List (SL)
	//		- multiple children (the statements in the list)
	// 5) if statement (IS)
	//		- two children (bool expr follow by SL)
	// 6) while statement (WS)
	//		- two children (bool expr follow by SL)
	function createASTState(currRoot, CST) {
		if(!errorBoolean) {
			// case 1 (print statement)
			if(CST.children[0].value === "Print") {
				putMessage("Creating PS Node");
				newNode(currRoot, "PS");
				currRoot = currRoot.children[currRoot.children.length - 1];
				createASTExpr(currRoot, CST.children[0].children[2]);
			}
			// case 2 (id assign statement)
			else if(CST.children[0].value === "IdAss") {
				putMessage("Creating IAS Node");
				newNode(currRoot, "IAS");
				currRoot = currRoot.children[currRoot.children.length - 1];
				putMessage("ID terminal node created!");
				newNode(currRoot, CST.children[0].children[0].value.value);
				createASTExpr(currRoot, CST.children[0].children[2]);
				isDeclared(tableNode, CST.children[0].children[0].value.value, "undefined", tableNode, true);
			}
			// case 3 (Var Dec Statement)
			else if(CST.children[0].value === "VarDec") {
				putMessage("Creating VDS Node");
				newNode(currRoot, "VDS");
				currRoot = currRoot.children[currRoot.children.length - 1];
				putMessage("type terminal node created!");
				putMessage("ID terminal node created!");
				newNode(currRoot, CST.children[0].children[0].value.value);
				newNode(currRoot, CST.children[0].children[1].value.value);
				currRoot = currRoot.parent;
				isDeclared(tableNode, CST.children[0].children[1].value.value,
							CST.children[0].children[0].value.value, tableNode, true);
			}
			else if(CST.children[0].value === "IfS") {
				putMessage("Creating IS Node");
				newNode(currRoot, "IS");
				currRoot = currRoot.children[currRoot.children.length - 1];
				createASTExpr(currRoot, CST.children[0].children[1]);
				createASTState(currRoot, CST.children[0].children[3]);
			}
			else if(CST.children[0].value === "WhileS") {
				putMessage("Creating WS Node");
				newNode(currRoot, "WS");
				currRoot = currRoot.children[currRoot.children.length - 1];
				createASTExpr(currRoot, CST.children[0].children[1]);
				createASTState(currRoot, CST.children[0].children[3]);
			}
			else if(CST.children[0].value.value === "{") {
				putMessage("Creating SL Node");
				newNode(currRoot, "SL");
				scope = scope + 1;
				newNode(tableNode, scope);
				var returnNode = tableNode;
				tableNode = tableNode.children[tableNode.children.length - 1];
				for(var x = 0; x < CST.children[1].children.length; x++) {
					createASTState(currRoot.children[currRoot.children.length - 1],
									CST.children[1].children[x]);
				}
				tableNode = returnNode;
			}
			else if(CST.value === "StatementList") {
				putMessage("Creating SL Node");
				newNode(currRoot, "SL");
				scope = scope + 1;
				newNode(tableNode, scope);
				var returnNode2 = tableNode;
				tableNode = tableNode.children[tableNode.children.length - 1];
				for(var y = 0; y < CST.children.length; y++) {
					createASTState(currRoot.children[currRoot.children.length - 1],
									CST.children[y]);
				}
				tableNode = returnNode2;

			}
			else {
				putMessage("Error!");
			}
		}
	}
	
	// Expressions in the AST come in 4 categories
	// 1) an ID
	// 2) a String Expression
	// 3) Any number of Int Expressions (sometimes followed by an ID or String Expr)
	// 4) a boolean
	function createASTExpr(currRoot, CST) {
		if(!errorBoolean) {
			if(CST.children[0].value === "StringExpr") {
				putMessage("Creating String Node");
				newNode(currRoot, "String");
				createASTCharList(currRoot.children[currRoot.children.length - 1], CST.children[0].children[1]);
			}
			else if(CST.children[0].value === "IntExpr") {
				createASTIntExpr(currRoot, CST.children[0]);
			}
			else if(CST.children[0].value === "BoolExpr") {
				putMessage("Creating Boolean Expression");
				if(CST.children[0].children.length === 1) {
					newNode(currRoot, CST.children[0].children[0].value.value);
				}
				else if(CST.children[0].children.length === 5) {
					newNode(currRoot, "BoolExpr");
					currRoot = currRoot.children[currRoot.children.length - 1];
					createASTExpr(currRoot, CST.children[0].children[1]);
					createASTExpr(currRoot, CST.children[0].children[3]);
				}
			}
			else if(CST.children[0].children.length === 0) {
				putMessage("ID terminal node created!");
				newNode(currRoot, CST.children[0].value.value);
				isDeclared(tableNode, CST.children[0].value.value, "undefined", tableNode, true);
			}
		}
	}
	
	// char list ast creation
	function createASTCharList(currRoot, CST) {
		if(!errorBoolean) {
			if(CST.children.length !== 0) {
				putMessage(CST.children[0].value.type + " terminal node created!");
				newNode(currRoot, CST.children[0].value.value);
				createASTCharList(currRoot, CST.children[1]);
			}
		}
	}
	
	// int expr ast creation
	function createASTIntExpr(currRoot, CST) {
		if(!errorBoolean) {
			if(CST.children.length === 1) {
				putMessage("digit terminal node created!");
				newNode(currRoot, CST.children[0].value.value);
			}
			else {
				putMessage("digit terminal node created!");
				putMessage("op terminal node created!");
				newNode(currRoot, CST.children[0].value.value);
				newNode(currRoot, CST.children[1].value.value);
				createASTExpr(currRoot, CST.children[2]);
			}
		}
	}
	
	// lets make an AST
	function createAST() {
		createASTState(superRootAST, superRootCST.children[0]);
	}
	
	putMessage("");
	putMessage("Beginning Abstract Syntax Tree creation!!");
	createAST();
	if(!errorBoolean) {
		putMessage("AST complete!");
		
	}
	if(errorBoolean) {
		putMessage("AST failed!");
	}
	
	console.log("AST:");
	console.log(superRootAST);
	console.log("Symbol Table:");
	console.log(symbolTable);
	
	
	function symTabLookUp(tableN, vari, whatScope) {
		var foundIt = false;
		
		if(whatScope === 0) {
			foundIt = lookNow(tableN, vari);
		}
		
		for(var x = 0; x < tableN.children.length; x++) {
			if(tableN.children[x].value === whatScope) {
				foundIt = lookNow(tableN.children[x], vari);
				break;
			}
			else if(!isNaN(tableN.children[x].value))  {
				foundIt = symTabLookUp(tableN.children[x], vari, whatScope);
			}
		}
		
		return foundIt;
	}
	
	function lookNow(tableM, varj) {
	
		//console.log(tableM);
	
		var foundIt2 = false;
		
		for(var y = 0; y < tableM.children.length; y++) {
	
			if(isNaN(tableM.children[y].value) &&
					tableM.children[y].value.value === varj) {
						foundIt2 = tableM.children[y];
						break;
			}
			
		}

		if(tableM.value !== 0) {
			if(foundIt2 === false) {
				foundIt2 = lookNow(tableM.parent, varj);
			}
		}
		
		if(foundIt2 === false) {
			console.log("Failed to find ID. Das a prob.");
		}
		return foundIt2;
	}
	
	var daScope = 0;
	
	// type check by traversing AST and symbol table
	function typeCheck(thisNode) {
		if(!errorBoolean) {
			
			for(var x = 0; x < thisNode.children.length; x++) {
				if(thisNode.children[x].value === "IAS") {
					putMessage("Type checking ID Assignment: " + thisNode.children[x].children[0].value);
					if(thisNode.children[x].children[1].value.length === 1 &&
						isNaN(thisNode.children[x].children[1].value)) {
						
						// ID case
						// check if their types match
						putMessage("Matching variable to ID ...");
						if(symTabLookUp(symbolTable,
										thisNode.children[x].children[0].value,
										daScope).value.type ===
							symTabLookUp(symbolTable,
										thisNode.children[x].children[1].value,
										daScope).value.type) {
										
								putMessage("Types approved!");
								
						}
						else {
							putMessage("Error: Types mismatched!");
							errorBoolean = true;
							break;
						}
					}
					else if (thisNode.children[x].children[1].value === "String") {
						// char list case
						// check if the type is string
						putMessage("Matching variable to string ...");
						if(symTabLookUp(symbolTable,
										thisNode.children[x].children[0].value,
										daScope).value.type === "string") {
								putMessage("Types approved!");
						}
						else {
							putMessage("Error: Types mismatched!");
							errorBoolean = true;
							break;
						}
					}
					else if (thisNode.children[x].children[1].value.length === 1) {
						// int expr case
						putMessage("Matching variable to mathematical expression ...");
						if(symTabLookUp(symbolTable,
										thisNode.children[x].children[0].value,
										daScope).value.type === "int") {
							putMessage("Types approved!");
						}
						else {
							putMessage("Error: Types mismatched!");
							errorBoolean = true;
							break;
						}

					}
					else if (thisNode.children[x].children[1].value === "Boolean") {
						// check if the type is boolean
						putMessage("Matching variable to boolean ...");
						if(symTabLookUp(symbolTable,
										thisNode.children[x].children[0].value,
										daScope).value.type === "boolean") {
								putMessage("Types approved!");
						}
						else {
							putMessage("Error: Types mismatched!");
							errorBoolean = true;
							break;
						}

					}
					else if(thisNode.children[x].children[1].value === "BoolExpr") {
						// check if the type is boolean
						putMessage("Matching ID to boolean ...");
						if(symTabLookUp(symbolTable,
										thisNode.children[x].children[0].value,
										daScope).value.type === "boolean") {
								putMessage("Types approved!");
						}
						else {
							putMessage("Error: Types mismatched!");
							errorBoolean = true;
							break;
						}
					}
				}
				else if(thisNode.children[x].value === "BoolExpr" &&
						thisNode.children[x].children.length >= 2) {
							typeCheckBoolExpr(thisNode.children[x]);
						}
			}
			
			for(var s = 0; s < thisNode.children.length; s++) {
				if(thisNode.children[s].value === "SL") {
					daScope = daScope + 1;
				}
				if(thisNode.children[s].children.length !== 0) {
					typeCheck(thisNode.children[s]);
				}
			}
		}
	}
	

	
	function typeCheckBoolExpr(myNode) {
	
		putMessage("Type Checking a Boolean Expression!");
	
		if(myNode.children[0].value === "BoolExpr") {
			if(myNode.children[1].value === "true" || myNode.children[1].value === "false") {
				putMessage("Checked boolean vs boolean, approved!");
				typeCheckBoolExpr(myNode.children[0]);
			}
			else if(myNode.children[1].value === "BoolExpr") {
				putMessage("Checked boolean vs boolean, approved!");
				typeCheckBoolExpr(myNode.children[0]);
				typeCheckBoolExpr(myNode.children[1]);
			}
			else if(isNaN(myNode.children[1].value)) {
				if(symTabLookUp(symbolTable, myNode.children[1].value, daScope).value.type === "boolean") {
					putMessage("Checked boolean vs ID, approved!");
					typeCheckBoolExpr(myNode.children[0]);
				}
			}
			else {
				putMessage("Checking boolean vs nonboolean ...");
				putMessage("Error: Types mismatched!");
				errorBoolean = true;
			}
		}
		else if(myNode.children[0].value === "true" || myNode.children[0].value === "false") {
			if(myNode.children[1].value === "BoolExpr") {
				putMessage("Checked boolean vs boolean, approved!");
				typeCheckBoolExpr(myNode.children[1]);
			}
			else if(myNode.children[1].value === "true" || myNode.children[1].value === "false") {
				putMessage("Checking boolean vs boolean, approved!");
			}
			else if(isNaN(myNode.children[1].value)) {
				if(symTabLookUp(symbolTable, myNode.children[1].value, daScope).value.type === "boolean") {
					putMessage("Checking boolean vs ID, approved!");
				}
			}
			else {
				putMessage("Checking boolean vs nonboolean ...");
				putMessage("Error: Types mismatched!");
				errorBoolean = true;
			}
		}
		else if(myNode.children[0].value === "String") {
			putMessage("Error: string inside compare!");
			errorBoolean = true;
		}
		else if(!isNaN(myNode.children[0].value) ||
				myNode.children[1].value === "+" ||
				myNode.children[1].value === "-") {
					if(!isNaN(myNode.children[myNode.children.length - 1].value) ||
						myNode.children[myNode.children.length - 2].value === "+" ||
						myNode.children[myNode.children.length - 2].value === "-") {
							putMessage("Checking int vs int, approved!");
					}
					else if(isNaN(myNode.children[myNode.children.length - 1].value)) {
						if(symTabLookUp(symbolTable,
										myNode.children[myNode.children.length - 1].value,
										daScope).value.type === "int") {
							putMessage("Checking int vs ID, approved!");
						}
					}
					else {
						putMessage("Checking int against nonint ...");
						putMessage("Error: Types mismatched!");
						errorBoolean = true;
					}
		}
		else if(isNaN(myNode.children[0].value)) {
		
			var theType = symTabLookUp(symbolTable, myNode.children[0].value, daScope).value.type;
			
			if(theType === "boolean") {
				if(myNode.children[1].value === "BoolExpr") {
					putMessage("Checked ID vs boolean, approved!");
					typeCheckBoolExpr(myNode.children[1]);
				}
				else if(myNode.children[1].value === "true" || myNode.children[1].value === "false") {
					putMessage("Checked ID vs boolean, approved!");
				}
				else if(isNaN(myNode.children[1].value)) {
					if(symTabLookUp(symbolTable, myNode.children[1].value, daScope).value.type === "boolean") {
						putMessage("Checked ID vs ID, approved!");
					}
				}
				else {
					putMessage("Checking ID (boolean) against nonboolean ...");
					putMessage("Error: Types mismatched!");
					errorBoolean = true;
				}
			}
			else if(theType === "string") {
				putMessage("Error: string inside compare!");
				errorBoolean = true;
			}
			else if(theType === "int") {
				if(!isNaN(myNode.children[myNode.children.length - 1].value) ||
					myNode.children[myNode.children.length - 2].value === "+" ||
					myNode.children[myNode.children.length - 2].value === "-") {
						putMessage("Checking ID vs int, approved!");
				}
				else if(isNaN(myNode.children[1].value)) {
					if(symTabLookUp(symbolTable,
									myNode.children[1].value,
									daScope).value.type === "int") {
						putMessage("Checking ID vs ID, approved!");
					}
				}
				else {
					putMessage("Checking ID (int) against nonint ...");
					putMessage("Error: Types mismatched!");
					errorBoolean = true;
				}
			}
		}
	}


	if(!errorBoolean) {
		putMessage("");
		putMessage("Type Checking!");
		typeCheck(superRootAST, 0);
		if(errorBoolean) {
			putMessage("Type Checking failed!");
		}
		else {
			putMessage("Type Checking complete!");
		}
	}
	
	// check for uninitialized variables
	function uninitVarFinder(nodey) {
		for(var x = 0; x < nodey.children.length; x++) {
			if(isNaN(nodey.children[x].value)) {
				if(!nodey.children[x].value.initB) {
					putMessage("Warning: Uninitialized variable " + nodey.children[x].value.value +
								" (scope " + nodey.children[x].value.symScope + ")");
				}
				else {
					putMessage("Variable " + nodey.children[x].value.value + " initialized!" +
								" (scope " + nodey.children[x].value.symScope + ")");
				}
			}
			else {
				uninitVarFinder(nodey.children[x]);
			}
		}
	}
	
	if(!errorBoolean) {
		putMessage("");
		putMessage("Checking for unitialized variables ...");
		uninitVarFinder(symbolTable);
		putMessage("Check complete!");
		putMessage("");
		putMessage("(AST and Symbol Table output to console)");
		putMessage("");
		if(!errorBoolean) {
			codeGen(superRootAST);
		}
	}
	
	
}
	
	
	
	
	
