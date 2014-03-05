/* This file holds all possible tokens
	and their corresponding regular expressions.
*/

//Token constants

const T_INT			= 'T_INT';
const T_STRING		= 'T_STRING';
const T_DIGIT		= 'T_DIGIT';
const T_CHAR		= 'T_CHAR';
const T_BOOLEAN		= 'T_BOOLEAN';
const T_TRUE		= 'T_TRUE';
const T_FALSE		= 'T_FALSE';
const T_OPENBRACE	= 'T_OPENBRACE';
const T_CLOSEBRACE	= 'T_CLOSEBRACE';
const T_OPENPAREN	= 'T_OPENPAREN';
const T_CLOSEPAREN	= 'T_CLOSEPAREN';
const T_IF			= 'T_IF';
const T_WHILE		= 'T_WHILE';
const T_PRINT		= 'T_PRINT';
const T_EQUAL		= 'T_EQUAL';
const T_EQUALITY	= 'T_EQUALITY';
const T_NOTEQUAL	= 'T_NOTEQUAL';
const T_QUOTE		= 'T_QUOTE';
const T_PLUS		= 'T_PLUS';
const T_MINUS		= 'T_MINUS';
const T_SPACE		= 'T_SPACE';
const T_EOF			= 'T_EOF';
const T_EPSILON		= 'T_EPSILON';
const T_NEWLINE		= 'T_NEWLINE';

//Regular Expressions associated with each Token

const R_INT			= /^int/;
const R_STRING		= /^string/;
const R_DIGIT		= /^[0-9]/;
const R_CHAR		= /^[a-z]/;
const R_BOOLEAN		= /^boolean/;
const R_TRUE		= /^true/;
const R_FALSE		= /^false/;
const R_OPENBRACE	= /^[{]/;
const R_CLOSEBRACE	= /^[}]/;
const R_OPENPAREN	= /^[(]/;
const R_CLOSEPAREN	= /^[)]/;
const R_IF			= /^if/;
const R_WHILE		= /^while/;
const R_PRINT		= /^print/;
const R_EQUAL		= /^[=]/;
const R_EQUALITY	= /^==/;
const R_NOTEQUAL	= /^!=/;
const R_QUOTE		= /^["|']/;
const R_PLUS		= /^[+]/;
const R_MINUS		= /^[-]/;
const R_SPACE		= /^\s/;
const R_EOF			= /^[$]/;
const R_NEWLINE		= /^(\n)(\r)?/;


//Array of Tokens orderd by importance

var Tokens = {

	//Reserved words
	//length 
	T_INT		: { regex: R_INT, length: 3},
    T_STRING	: { regex: R_STRING, length: 6},
    T_PRINT		: { regex: R_PRINT, length: 5},
    T_WHILE		: { regex: R_WHILE, length: 5},
    T_IF		: { regex: R_IF, length: 2},
    T_BOOLEAN	: {	regex: R_BOOLEAN, length: 7},
    T_TRUE		: { regex: R_TRUE, length: 4},
    T_FALSE		: { regex: R_FALSE, length: 5},

	T_DIGIT		: { regex: R_DIGIT,	length: 1},
	T_CHAR		: { regex: R_CHAR, length: 1},
	T_OPENBRACE	: { regex: R_OPENBRACE, length: 1},
	T_CLOSEBRACE: { regex: R_CLOSEBRACE, length: 1},
	T_OPENPAREN : { regex: R_OPENPAREN, length: 1},
	T_CLOSEPAREN: { regex: R_CLOSEPAREN, length: 1},
	T_EQUALITY	: { regex: R_EQUALITY, length: 2},
	T_EQUAL		: { regex: R_EQUAL,	length: 1},
	T_NOTEQUAL	: { regex: R_NOTEQUAL, length: 2},
	T_QUOTE		: { regex: R_QUOTE,	length: 1},
	T_PLUS		: { regex: R_PLUS, length: 1},
	T_MINUS		: { regex: R_MINUS, length: 1},
	T_NEWLINE	: { regex: R_NEWLINE, length: 1},
	T_SPACE		: { regex: R_SPACE, length: 1},
	T_EOF		: { regex: R_EOF, length: 1}
};

// Container to hold a single token

var Token = function() {
	this.type = null;
	this.line = -1;
	this.value = '';
	
};