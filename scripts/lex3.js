// lexer v.2.0
// Brian Heil




// lex
// lex the code, return tokens to be parsed
function lex() {

	// trim leading and trailing white space
	var lexString = trim(sourceCode);
	// initialize total tokens to 0
	var totalTokens = 0;
	// initialize index of token array to 0
	var tokenIndex = 0;
	// initialize # of lines to 1
	var lineCount = 1;
	// initialize errorB to false
	var errorB = false;
	// initialize char list holder
	var charListHold = "";
	
	
	// searches the front of the string looking for a digit
	// returns boolean
	function matchDigit() {
		var pattern = /^\d/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a type (int or string)
	// returns boolean
	function matchType() {
		var pattern = /^(int|string|boolean)/;
		var x = lexString.match(pattern);
		if(x !== null){
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a while or if
	// returns boolean
	function matchCond() {
		var pattern = /^(while|if)/;
		var x = lexString.match(pattern);
		if(x !== null){
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a boolean (true/false)
	// returns boolean
	function matchBool() {
		var pattern = /^(true|false)/;
		var x = lexString.match(pattern);
		if(x !== null){
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a character
	// returns boolean
	function matchChar() {
		var pattern = /^[a-z]/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a operator (+ or -)
	// returns boolean
	function matchOp() {
		var pattern = /^(\+|-)/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for any white space
	// returns boolean
	function matchWhite() {
		var pattern = /^(\s|\n|\t)/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a tab
	// returns boolean
	function matchTab() {
		var pattern = /^\t/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for a new line
	// returns boolean
	function matchNewLine() {
		var pattern = /^\n/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}

	
	// searches the front of the string looking for any miscellaneous symbols
	// (includes quotation marks, brackets, parathensis, and equal sign)
	// returns boolean
	function matchSymbol() {
		var pattern = /^[{}\(\)]/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;		}
		else {
			return false;
		}
	}
	
	//searches the front of the string looking for an equal sign
	// returns boolean
	function matchEqual() {
		var pattern = /^=/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for print
	// returns boolean
	function matchPrint() {
		var pattern = /^(print)/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for any quotes (indicating a char list)
	// returns boolean
	function matchQuote() {
		var pattern = /^"/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// searches the front of the string looking for an end of program symbol ($)
	// returns boolean
	function matchEnd() {
		var pattern = /^\$/;
		var x = lexString.match(pattern);
		if(x !== null) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// lex a char list
	function lexCharList() {
		if(errorB) {
			errorB = errorB;
		}
		else if(matchWhite()) {
			if(!matchNewLine() && !matchTab()) {
				totalTokens = totalTokens + 1;
				putMessage("Found space: \t" + lexString.charAt(0));
				tokens[tokenIndex] = {type: "space", value: lexString.charAt(0), line: lineCount};
				lexString = lexString.slice(1, lexString.length);
				tokenIndex = tokenIndex + 1;
				lexCharList();
			}
			else {
				// put error message here
				putMessage("Error: Tabs/New Lines not allowed in Character List");
				putMessage("(line " + lineCount + ")");
				lexString = lexString.slice(1, lexString.length);
				errorB = true;
			}
		}
		else if(matchChar()) {
			totalTokens = totalTokens + 1;
			putMessage("Found character: \t" + lexString.charAt(0));
			tokens[tokenIndex] = {type: "char", value: lexString.charAt(0), line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
			lexCharList();
		}
		else if(matchQuote()) {
			putMessage("Found symbol: \t\t" + "\"");
			tokens[tokenIndex] = {type: "symbol", value: "\"", line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
			totalTokens = totalTokens + 1;
		}
		else {
			// put error message here
			putMessage("Error: \"" + lexString.charAt(0) + "\" not allowed in Character List");
			putMessage("(line " + lineCount + ")");
			lexString = lexString.slice(1, lexString.length);
			errorB = true;
		}
	}
	
	// if there is at least 1 more character in the string,
	// create a new token (based off matching functions)
	function createToken() {
		if(matchDigit()) {
			// increment token total
			totalTokens = totalTokens + 1;
			// output token found
			putMessage("Found digit: \t\t" + lexString.charAt(0));
			// add token to the token array
			tokens[tokenIndex] = {type: "digit", value: lexString.charAt(0), line: lineCount};
			// slice off the first character (of in the case of IDs, the first couple)
			lexString = lexString.slice(1, lexString.length);
			// increment the index of the token array
			tokenIndex = tokenIndex + 1;
			if(matchDigit()) {
				putMessage("Error: Double digit numbers not supported");
				errorB = true;
			}

		}
		else if(matchType()) {
			totalTokens = totalTokens + 1;
			if(lexString.charAt(0) === "i") {
				putMessage("Found Id: \t\t\t" + "int");
				tokens[tokenIndex] = {type: "type", value: "int", line: lineCount};
				lexString = lexString.slice(3, lexString.length);
				tokenIndex = tokenIndex + 1;
				if(matchChar()) {
					putMessage("Error: Character directly following a type (line " + lineCount + ")");
					errorB = true;
				}
			}
			else if(lexString.charAt(0) === "b") {
				putMessage("Found Id: \t\t\t" + "boolean");
				tokens[tokenIndex] = {type: "type", value: "boolean", line: lineCount};
				lexString = lexString.slice(7, lexString.length);
				tokenIndex = tokenIndex + 1;
				if(matchChar()) {
					putMessage("Error: Character directly following a type (line " + lineCount + ")");
					errorB = true;
				}
			}
			else {
				putMessage("Found Id: \t\t\t" + "string");
				tokens[tokenIndex] = {type: "type", value: "string", line: lineCount};
				lexString = lexString.slice(6, lexString.length);
				tokenIndex = tokenIndex + 1;
			}
		}
		else if(matchBool()) {
			totalTokens = totalTokens + 1;
			if(lexString.charAt(0) === "t") {
				putMessage("Found boolean: \t" + "true");
				tokens[tokenIndex] = {type: "bool", value: "true", line: lineCount};
				lexString = lexString.slice(4, lexString.length);
				tokenIndex = tokenIndex + 1;
				if(matchChar()) {
					putMessage("Error: Character directly following a boolean (line " + lineCount + ")");
					errorB = true;
				}
			}
			else {
				putMessage("Found boolean: \t" + "false");
				tokens[tokenIndex] = {type: "bool", value: "false", line: lineCount};
				lexString = lexString.slice(5, lexString.length);
				tokenIndex = tokenIndex + 1;
			}
		}
		else if(matchCond()) {
			totalTokens = totalTokens + 1;
			if(lexString.charAt(0) === "i") {
				putMessage("Found conditional: \t" + "if");
				tokens[tokenIndex] = {type: "cond", value: "if", line: lineCount};
				lexString = lexString.slice(2, lexString.length);
				tokenIndex = tokenIndex + 1;
				if(matchChar()) {
					putMessage("Error: Character directly following a cond (line " + lineCount + ")");
					errorB = true;
				}
			}
			else {
				putMessage("Found conditional: \t" + "while");
				tokens[tokenIndex] = {type: "cond", value: "while", line: lineCount};
				lexString = lexString.slice(5, lexString.length);
				tokenIndex = tokenIndex + 1;
			}
		}
		else if(matchPrint()) {
			totalTokens = totalTokens + 1;
			putMessage("Found symbol: \t\t\t" + "print");
			tokens[tokenIndex] = {type: "symbol", value: "print", line: lineCount};
			lexString = lexString.slice(5, lexString.length);
			tokenIndex = tokenIndex + 1;
		}
		else if(matchChar()) {
			totalTokens = totalTokens + 1;
			putMessage("Found character: \t" + lexString.charAt(0));
			tokens[tokenIndex] = {type: "char", value: lexString.charAt(0), line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
			if(matchChar()) {
				putMessage("Error: Character directly following a character (line " + lineCount + ")");
				errorB = true;
			}
		}
		else if(matchOp()) {
			totalTokens = totalTokens + 1;
			putMessage("Found operator: \t" + lexString.charAt(0));
			tokens[tokenIndex] = {type: "op", value: lexString.charAt(0), line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
		}
		else if(matchSymbol()) {
			totalTokens = totalTokens + 1;
			putMessage("Found symbol: \t\t" + lexString.charAt(0));
			tokens[tokenIndex] = {type: "symbol", value: lexString.charAt(0), line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
		}
		else if(matchEqual()) {
			var save = lexString;
			lexString = lexString.slice(1, lexString.length);
			if(matchEqual()) {
				totalTokens = totalTokens + 1;
				putMessage("Found symbol: \t\t" + "==");
				tokens[tokenIndex] = {type: "symbol", value: "==", line: lineCount};
				lexString = lexString.slice(1, lexString.length);
				tokenIndex = tokenIndex + 1;
			}
			else {
				totalTokens = totalTokens + 1;
				putMessage("Found symbol: \t\t" + "=");
				tokens[tokenIndex] = {type: "symbol", value: "=", line: lineCount};
				tokenIndex = tokenIndex + 1;
			}
		}
		else if(matchQuote()) {
			putMessage("Found symbol: \t\t" + "\"");
			tokens[tokenIndex] = {type: "symbol", value: "\"", line: lineCount};
			lexString = lexString.slice(1, lexString.length);
			tokenIndex = tokenIndex + 1;
			totalTokens = totalTokens + 1;
			lexCharList();
		}
		else if (matchWhite()) {
			// there is no token for white space (return or tab) ... SLICE IT UP
			if(matchNewLine()) {
				lineCount = lineCount + 1;
			}
			lexString = lexString.slice(1, lexString.length);
		}
		else if(matchEnd()) {
			totalTokens = totalTokens + 1;
			putMessage("Found end of program!");
			tokens[tokenIndex] = {type: "end", value: lexString.charAt(0), line: lineCount};
			if(lexString.slice(1, lexString.length).length !== 0) {
				//throw an error
				putMessage("Warning: Code following program end. Deleting extra code.");
			}
			lexString = "";
			tokenIndex = tokenIndex + 1;
		}
		else {
			// put error message here
			putMessage("Error: \"" + lexString.charAt(0) + "\" not in the language (line " + lineCount + ")");
			lexString = lexString.slice(1, lexString.length);
			errorB = true;
		}
	}
	
	function lexNext() {
		// check for an error
		if(errorB) {
			putMessage("Lexing Failed!");
		}
		// if the source code isnt empty, process the remainder
		else if(lexString.length !== 0) {
			createToken();
			lexNext();
		}
		// otherwise, output the end of lex! :D
		else {
			if(tokens[tokenIndex - 1].type !== "end") {
				putMessage("Missing $ at end of code. Adding it. (You're welcome)");
				tokens[tokenIndex] = {type: "end", value: "$"};
				totalTokens = totalTokens + 1;
			}
			putMessage("Finished lexing! " + totalTokens + " tokens created.");
			//if no errors, parse it
			if(!errorB) {
				parse();
			}
		}
	}
	
	// calling the functions
	putMessage("\nBeginning lexing!");
	lexNext();
	
}
	
