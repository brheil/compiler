// compiler v.2.0
// Brian Heil



// Grab the "raw" source code.
var sourceCode;
// initialize tokens array
var tokens = [];
// error boolean (controlled by lex, if true we will not parse)
var errorB;


// cleanUp
// clears out the code box and resets variables
function cleanUp()
{
    // Clear the code box
    document.getElementById("taOutput").value = "";
    // Set the initial values for our globals
    tokens = [];
    errorB = false;
}


// putMessage
// outputs given message
function putMessage(message)
{
    document.getElementById("taOutput").value += message + "\n";
}


// trim
// Use a regular expression to remove leading and trailing spaces.
function trim(str)      {
	return str.replace(/^\s+ | \s+$/g, "");
	/*
	Huh?  Take a breath.  Here we go:
	- The "|" separates this into two expressions, as in A or B.
	- "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
    - "\s+$" is the same thing, but at the end of the string.
    - "g" makes is global, so we get all the whitespace.
    - "" is nothing, which is what we replace the whitespace with.
	*/

}


// compileNow
// runs the compiler
function btnCompile_click()
{
    // This is executed as a result of the usr pressing the
    // "compile" button between the two text areas, above.
    // Note the <input> element's event handler: onclick="btnCompile_click();
    cleanUp();
    sourceCode = document.getElementById("taSourceCode").value;
    putMessage("Compiling ...");
    // lex it
    lex();
}
