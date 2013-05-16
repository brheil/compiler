// Code Gen, shiny new v1.0 BETA YAY
// Brian Heil
//
//



function codeGen(AST) {

	// remember only 96 bytes
	var codeList = [];

	var staticData = [];
	
	var jumpData = [];
	
	function newJump(nam, dis) {
		jumpData.push({name: nam, distance: dis});
	}

	function newData(nam, typ, scop, loc) {
		staticData.push({name: nam, type: typ, scope: scop, location: loc});
	}

	var heapCounter = 0;

	var stackCounter = 95;

	var erb = false;

	/*
	REFERENCE TABLE

	load accumulator with constant	-	-	-	A9	-	-	-	takes 1 byte
	load accumulator from memory	-	-	-	AD	-	-	-	takes 2 bytes

	store accumulator in memory	-	-	-	-	8D	-	-	-	takes 2 bytes

	add	contents of memory to acc	-	-	-	6D	-	-	-	takes 2 bytes

	load X reg with constant	-	-	-	-	A2	-	-	-	takes 1 byte
	load X reg from memory	-	-	-	-	-	AE	-	-	-	takes 2 bytes

	load Y reg with constant	-	-	-	-	A0	-	-	-	takes 1 byte
	load Y reg from memory	-	-	-	-	-	AC	-	-	-	takes 2 bytes

	compare memory to X reg (set Z flag if =)	EC	-	-	-	takes 2 bytes

	branch __ bytes if Z = 0	-	-	-	-	D0	-	-	-	takes 1 byte

	system call	-	-	-	-	-	-	-	-	FF	-	-	-	NO BYTES
	(X reg = 01, print int in Y)
	(X reg = 02, print memory at Y)

	break	-	-	-	-	-	-	-	-	-	00	-	-	-	NO BYTES

	 */

	function addtostack(thingy) {
		if(stackCounter === heapCounter) {
			putMessage("Error: Out of memory space!");
			erb = true;
		}
		else{
			codeList[stackCounter] = thingy;
			stackCounter = stackCounter - 1;
		}
	}

	function addtoheap(thingz) {
		if(stackCounter === heapCounter) {
			putMessage("Error: Out of memory space!");
			erb = true;
		}
		else{
			codeList[heapCounter] = thingz;
			heapCounter = heapCounter + 1;
		}
	}

	function convertHex(dat) {
		if(isNaN(dat) || dat === " ") {
			return convertHex(dat.charCodeAt(0));
		}
		else {
			dat = dat.toString(16).toUpperCase();
			if(dat.length === 1) {
				return "0" + dat;
			}
			else {
				return dat;
			}
		}
	}

	var scopeName = 0;

	function Gscope(par) {
		this.parent = par;
		this.name = scopeName;
		this.children = [];
	}

	var currentScope = new Gscope(null);

	function newScope() {
		scopeName = scopeName + 1;
		var node = new Gscope(currentScope);
		currentScope.children.push(node);
		currentScope = currentScope.children[currentScope.children.length - 1];
	}

	function endScope() {
		scopeName = scopeName - 1;
		currentScope = currentScope.parent;
	}


	function convertnegHex(dis) {
		// two's complement
		return convertnumHex(255 - dis);
	}

	function tempLoc() {
		if(staticData.length + 1 < 10) {
			var loc = staticData.length + 1;
			loc = "T" + loc;
			return loc;
		}
		else {
			putMessage("Out of memory! Too many variables!");
			erb = true;
		}
	}
	
	function tempJump() {
		if(jumpData.length < 10) {
			var name = "J" + jumpData.length;
			return name;
		}
		else {
			putMessage("Out of memory! Too many variables!");
			erb = true;
		}
	}

	function idLookUP(value, SSS) {
		for(var x = 0; x < staticData.length; x++) {
			if(staticData[x].name === value && staticData[x].scope === SSS.name) {
				return staticData[x];
			}
		}
		if(SSS.parent !== null) {
			return idLookUP(value, SSS.parent);
		}
	}
	
	function evalIntExpr(aNode, inc) {
		var done = false;
		
		addtoheap("A9");
		addtoheap(convertHex(aNode.children[inc].value));
		addtoheap("8D");
		addtoheap("T0");
		addtoheap("XX");
		
		inc = inc + 2;
		
		while(!done) {
			
			if(!isNaN(aNode.children[inc].value)) {
				addtoheap("A9");
				addtoheap(convertHex(aNode.children[inc].value));
			}
			else {
				addtoheap("AD");
				console.log(aNode.children[inc].value);
				addtoheap(idLookUP(aNode.children[inc].value, currentScope).location);
				addtoheap("XX");
			}
			
			addtoheap("6D");
			addtoheap("T0");
			addtoheap("XX");
			addtoheap("8D");
			addtoheap("T0");
			addtoheap("XX");
			if(inc + 1 < aNode.children.length) {
				if(aNode.children[inc + 1].value === "+" ||
					aNode.children[inc + 1].value === "-") {
					inc = inc + 2;
				}
				else {
					// done
					done = true;
				}
			}
			else {
				done = true;
			}
		}
	}
	
	function evalBoolExpr(aNode) {
		if(aNode.children[0].value === "BoolExpr") {
			// comparing booleans
			
			evalBoolExpr(aNode.children[0]);
			
			addtoheap("A2");
			addtoheap("00");
			addtoheap("D0");
			addtoheap("02");
			addtoheap("A2");
			addtoheap("01");
			
			if(aNode.children[0].value === "BoolExpr") {
			
				evalBoolExpr(aNode.children[1]);
				
				addtoheap("A9");
				addtoheap("00");
				addtoheap("8D");
				addtoheap("T0");
				addtoheap("XX");
				
				addtoheap("D0");
				addtoheap("05");
				
				addtoheap("A9");
				addtoheap("01");
				addtoheap("8D");
				addtoheap("T0");
				addtoheap("XX");
				
				addtoheap("EC");
				addtoheap("T0");
				addtoheap("XX");
				
			}
			
			else {
				if(aNode.children[1].value === "true") {
					
					addtoheap("A9");
					addtoheap("01");
					addtoheap("8D");
					addtoheap("T0");
					addtoheap("XX");
					
				}
				else {
				
					addtoheap("A9");
					addtoheap("00");
					addtoheap("8D");
					addtoheap("T0");
					addtoheap("XX");
					
				}
				
				addtoheap("EC");
				addtoheap("T0");
				addtoheap("XX");

			}
		}
		else if(!isNaN(aNode.children[0].value)) {
			// comparing integers
			
			if(!isNaN(aNode.children[1].value)) {
				if(aNode.children.length === 2) {
					// compare 2 numbers
					addtoheap("A9");
					addtoheap(convertHex(aNode.children[0].value));
					addtoheap("8D");
					addtoheap("T0");
					addtoheap("XX");
					addtoheap("A2");
					addtoheap(convertHex(aNode.children[1].value));
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
				else {
					// 2nd entry is int expr
					evalIntExpr(aNode, 1);
					
					addtoheap("A2");
					addtoheap(convertHex(aNode.children[0].value));
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
			}
			else if(aNode.children[1].value === "+" ||
					aNode.children[1].value === "-") {
				// 1st entry is int expr
				
				var beginSecond;
				
				for(var poop = 0; poop < aNode.children.length; poop++) {
					if(!(aNode.children[poop].value === "+" ||
							aNode.children[poop].value === "-")) {
						if(!isNaN(aNode.children[poop + 1].value)) {
							beginSecond = poop + 1;
							break;
						}
					}
				}
				if(aNode.children.length === beginSecond + 1) {
					// 2nd entry is a num
					evalIntExpr(aNode, 0);
					
					addtoheap("A2");
					addtoheap(convertHex(aNode.children[beginSecond]));
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
				else {
					// both are int expr ... fuckin kidding me
					// its fine, lets go
					evalIntExpr(aNode, 0);
					
					addtoheap("AE");
					addtoheap("T0");
					addtoheap("XX");
					
					evalIntExpr(aNode, beginSecond);
					
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
			}
		}
		else if(aNode.children[0].value === "true" ||
				aNode.children[0].value === "false") {
			// comparing booleans
			
			if(aNode.children[0].value === "true") {
				addtoheap("A9");
				addtoheap("01");
				addtoheap("8D");
				addtoheap("T0");
				addtoheap("XX");
			}
			else {
				addtoheap("A9");
				addtoheap("00");
				addtoheap("8D");
				addtoheap("T0");
				addtoheap("XX");
			}
			
			if(aNode.children[1].value !== "BoolExpr") {
				// 2nd is a bool
				if(aNode.children[1].value === "true") {
					addtoheap("A2");
					addtoheap("01");
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
				else {
					addtoheap("A2");
					addtoheap("00");
					addtoheap("EC");
					addtoheap("T0");
					addtoheap("XX");
				}
			}
			else {
				// 2nd is a bool expr ... fuck that. ok ok no its fine. really its fine.
				evalBoolExpr(aNode.children[1]);
				
				addtoheap("A2");
				addtoheap("00");
				addtoheap("D0");
				addtoheap("02");
				addtoheap("A2");
				addtoheap("01");
				
				addtoheap("EC");
				addtoheap("T0");
				addtoheap("XX");
				
			}
		}
		else if(aNode.children[0].value === "String") {
			
			
		}
	}

	function genStatement(aNode) {
		if(aNode.value === "VDS") {
			newData(aNode.children[1].value, aNode.children[0].value, scopeName, tempLoc());
		}
		if(aNode.value === "IAS") {
			if(!isNaN(aNode.children[1].value)) {
				if(aNode.children.length === 2) {
					addtoheap("A9");
					addtoheap(convertHex(aNode.children[1].value));
					addtoheap("8D");
					addtoheap(idLookUP(aNode.children[0].value, currentScope).location);
					addtoheap("XX");
				}
				else {
					evalIntExpr(aNode, 1);
					
					addtoheap("AD");
					addtoheap("T0");
					addtoheap("XX");
					addtoheap("8D");
					addtoheap(idLookUP(aNode.children[0].value, currentScope).location);
					addtoheap("XX");
				}
			}
			else if(aNode.children[1].value.length === 1) {
				addtoheap("AD");
				addtoheap(idLookUP(aNode.children[1].value, currentScope).location);
				addtoheap("XX");
				addtoheap("8D");
				addtoheap(idLookUP(aNode.children[0].value, currentScope).location);
				addtoheap("XX");
			}
			else if(aNode.children[1].value === "String") {
				var le = aNode.children[1].children.length;
				addtostack("00");
				for(var xy = 0; xy < le; xy++) {
					addtostack(convertHex(aNode.children[1].children[le - xy - 1].value));
				}
				addtoheap("A9");
				addtoheap(convertHex(stackCounter + 1));
				addtoheap("8D");
				addtoheap(idLookUP(aNode.children[0].value, currentScope).location);
				addtoheap("XX");
			}
		}
		if(aNode.value === "SL") {
			newScope();

			for(var a = 0; a < aNode.children.length; a++) {
				genStatement(aNode.children[a]);
			}
			endScope();
		}
		if(aNode.value === "IS") {
			if(aNode.children[0].value !== "BoolExpr") {
				// put something
				console.log("seriously fuck off code kit");
			}
			else {
				// recursively compare shit (?)
				evalBoolExpr(aNode.children[0]);
				
				addtoheap("D0");
				
				var start = heapCounter;
				var jname = tempJump();
				addtoheap(jname);
				genStatement(aNode.children[1]);
				
				var end = heapCounter;
				
				newJump(jname, end - start);
				
			}
		}
		if(aNode.value === "PS") {
			if(aNode.children[0].value === "String") {
				var l = aNode.children[0].children.length;
				addtostack("00");
				for(var x = 0; x < l; x++) {
					addtostack(convertHex(aNode.children[0].children[l - x - 1].value));
				}
				// load 02 into x
				addtoheap("A2");
				addtoheap("02");
				// load the memory location start of string into y
				addtoheap("A0");
				addtoheap(convertHex(stackCounter + 1));
				// sys call
				addtoheap("FF");
			}
			else if(aNode.children[0].value === "true" ||
				aNode.children[0].value === "false" ||
				aNode.children[0].value === "BoolExpr") {
					console.log("fuck you and your empty block");
				// generate boolean value
			}
			//else if(!isNaN(aNode.children[0].value) || aNode.children[1].value === "+" || "-") {
				// generate int expr
			//}
			else {
				addtoheap("AC");
				addtoheap(idLookUP(aNode.children[0].value, currentScope).location);
				addtoheap("XX");
				if(idLookUP(aNode.children[0].value, currentScope).type === "int") {
					addtoheap("A2");
					addtoheap("01");
					addtoheap("FF");
				}
				else if(idLookUP(aNode.children[0].value, currentScope).type === "string") {
					addtoheap("A2");
					addtoheap("02");
					addtoheap("FF");
				}
			}
		}
	}

	function backPatch() {

		var endOfCode = 0;

		for(var c = 0; c < 96; c++) {
			if(codeList[c] === "00") {
				endOfCode = c + 1;
				break;
			}
		}
		for(var d = 0; d < staticData.length + 1; d++) {
			for(var b = 0; b < 96; b++) {
				if(codeList[b].charAt(0) === "T") {
					if(codeList[b].charAt(1) === d + "") {
						codeList[b] = convertHex(endOfCode);
						codeList[b + 1] = "00";
					}
				}
			}
			endOfCode = endOfCode + 1;
		}
		for(var e = 0; e < 96; e++) {
			if(codeList[e].charAt(0) === "J") {
				codeList[e] = jumpData[codeList[e].charAt(1)].distance;
			}
		}
	}

	function GENERATE(mahtree) {
		genStatement(mahtree);
		putMessage("Generating code ...");
		putMessage("");
		for(var p = 0; p < 96; p++) {
			if(codeList[p] === undefined) {
				codeList[p] = "00";
			}
		}
		backPatch();
		for(var x = 0; x < 12; x++) {
			putMessage(codeList[x * 8] + " " + codeList[x * 8 + 1] + " " + codeList[x * 8 + 2] +
						" " + codeList[x * 8 + 3] + " " + codeList[x * 8 + 4] + " " + codeList[x * 8 + 5] +
						" " + codeList[x * 8 + 6] + " " + codeList[x * 8 + 7]);
		}
		putMessage("");
		putMessage("Code Generation Complete!");
	}

	GENERATE(AST.children[0]);
}







