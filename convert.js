#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var esprima = require('esprima')
var Map = require('./map')
require('sugar')
var util = require('util')
var program = require('commander')

program
	.option('--pretty', 'Pretty print translation info (no JSON)')
	.option('--summary', 'Print summary info (no JSON)')
	.parse(process.argv)

if (program.args.length != 1) {
	program.help()
}

var cgFile = program.args[0]
if (!cgFile.endsWith('.json') || !fs.existsSync(cgFile)) {
	console.error("Not a JSON file: " + cgFile)
	process.exit(1)
}

var dirname = path.dirname(cgFile)

var filenames = Object.create(null)

var inputs = []; // [{ file, AST }]
fs.readdirSync(dirname).forEach(function(file) {
	if (path.extname(file) === '.js') {
		var name = path.basename(file)
		filenames[name] = true
		inputs.push({
			file: name,
			ast: esprima.parse(fs.readFileSync(dirname + '/' + file), {loc: true, range: true})
		})
	}
})

function traverse(node, f) {
	if (!node || typeof node !== 'object')
		return;
	if (!Array.isArray(node)) {
		f(node);
	}
	for (var k in node) {
		if (k === 'range' || k === 'loc')
			continue;
		traverse(node[k], f);
	}
}

// Converts an AST node and a filename to an object { key, file, line, start, end }
function convertNode(node, file) {
	if (typeof file !== 'string') throw new Error("No file")
	var line = node.loc.start.line
	return {
		key: file + '@' + line + ':' + node.range[0] + '-' + node.range[1],
		file: file,
		line: line,
		start: node.range[0],
		end: node.range[1]
	}
}

var astCalls = [] // array of {key,file,line,start,end}
var astCallees = []

inputs.forEach(function (input) {
	traverse(input.ast, function(node) {
		switch (node.type) {
			case 'CallExpression':
			case 'NewExpression':
				astCalls.push(convertNode(node, input.file))
				break
			case 'FunctionExpression':
			case 'FunctionDeclaration':
				astCallees.push(convertNode(node, input.file))
				break;
		}
	})
})

function abort(msg) {
	console.error(msg)
	process.exit(1)
}

// Converts a string of form file@line:start-end to an object { key, file, line, start, end }
function convertKey(key) {
	var at = key.indexOf('@')
	var colon = key.indexOf(':', at)
	var dash = key.indexOf('-', colon)
	var file = key.substring(0, at)
	if (!filenames[file]) {
		abort("Missing referenced source file: " + file)
	}
	return {
		key: key,
		file: file,
		line: Number(key.substring(at+1, colon)),
		start: Number(key.substring(colon+1, dash)),
		end: Number(key.substring(dash+1))
	}
}
function isNative(key) {
	return key.indexOf('@') === -1;
}

function compare(x, y) {
	if (x.start !== y.start)
		return x.start - y.start;
	return y.end - x.end; // note: reverse ordering for `end`
}

// Matches callsite IDs based on line numbers and the relative ordering of offsets.
function ComputeClosestMatch(dynCalls, astCalls) {
	var translationObject = {}
	function registerRemoval(call) {
		translationObject[call.key] = null;
	}
	function registerTranslation(from, to) {
		if (from.file !== to.file || from.line !== to.line) {
			throw "Invalid translation from " + from.key + " to " + to.key
		}
		translationObject[from.key] = to.key
	}

	// Group calls by "file@line" and match each group separately
	function getFileLine(call) {
		return call.file + '@' + call.line
	}
	var dynCallGroups = Map.groupBy(dynCalls, getFileLine)
	var astCallGroups = Map.groupBy(astCalls, getFileLine)
	dynCallGroups.forEach(function(fileLineKey, dcalls) {
		var acalls = astCallGroups.get(fileLineKey) || []
		if (acalls.length === 0) {
			// It seems some debugging calls to console.log were not removed from jquery.markitup
			// before the dynamic CGs were generated. These have been outcommened in the code, but
			// the CG still contains callsites for them. Just delete them.
			dcalls.forEach(registerRemoval)
			return
		}
		if (dcalls.length !== acalls.length) {
			// The dynamic CG regrettably omits keys for callsites without targets, so for lines with multiple
			// calls, of which only some were executed, it is hard to determine which callsite is being referred to.
			// For example, if the source code says,
			//    x ? f() : g()
			// and the dynamic CG mentions exactly one call on the above line, we cannot know which call it refers to,
			// since the offsets can be shifted arbitrarily, and the two calls are syntactically of the same length.
			// dcalls.forEach(registerRemoval);
			// However, in cases where the offsets match perfectly, we assume that the match is correct.
			// This last case is important for handling the minified version of flotr-0.2.0 where everything is in one line.
			dcalls.forEach(function(dcall) {
				var acall = acalls.find(function(call) { return call.key == dcall.key })
				if (!acall) {
					registerRemoval(dcall);
				} else {
					registerTranslation(dcall, acall);
				}
			})
			return
		}
		// Sort all the calls on the line.
		// The absolute offsets cannot be trusted, so the rely on them being ordered consistently.
		dcalls.sort(compare)
		acalls.sort(compare)
		for (var i=0; i<acalls.length; i++) {
			registerTranslation(dcalls[i], acalls[i])
		}
	})

	return translationObject
}

function translateCG(cg) {
	var calls = []
	var callees = []
	var seen_callees = {}
	for (var k in cg) {
		calls.push(convertKey(k))
		cg[k].forEach(function(target) {
			if (!isNative(target)) {
				if (seen_callees[target]) 
					return
				seen_callees[target] = true
				callees.push(convertKey(target))
			}
		})
	}
	var translateCalls = ComputeClosestMatch(calls, astCalls)
	var translateCallees = ComputeClosestMatch(callees, astCallees)
	var result = {}
	for (var k in cg) {
		if (!(k in translateCalls))
			throw new Error("Missing translation for key " + k)
		if (translateCalls[k] === null)
			continue
		result[translateCalls[k]] = cg[k].map(function(target) {
			if (target in translateCallees)
				return translateCallees[target]
			if (isNative(target))
				return target;
			throw new Error("Missing translation for target " + target)
		}).filter(function(x) { return x !== null });
	}
	return {
		cg: result,
		translateCalls: translateCalls,
		translateCallees: translateCallees
	};
}

var cg = JSON.parse(fs.readFileSync(cgFile, 'utf8'))
var result = translateCG(cg)

if (program.pretty) {
	dumpTranslation(result.translateCalls)
	dumpTranslation(result.translateCallees)
}
if (program.summary) {
	var sumCalls = getSummary(result.translateCalls)
	var sumCallees = getSummary(result.translateCallees)
	console.log("Calls:          %d", sumCalls.total)
	console.log("- Translations: %d", sumCalls.translations)
	console.log("- Removals:     %d", sumCalls.removals)
	console.log("Callees:        %d", sumCallees.total)
	console.log("- Translations: %d", sumCallees.translations)
	console.log("- Removals:     %d", sumCallees.removals)
}
if (!program.pretty && !program.summary) {
	console.log(JSON.stringify(result.cg))
}

function dumpTranslation(translationObject) {
	var keys = Object.keys(translationObject)
	keys.sort()
	keys.forEach(function(k) {
		if (k === translationObject[k])
			return
		if (translationObject[k] === null) {
			console.log(k + " -> REMOVED")
		} else {
			console.log(k + " -> " + translationObject[k])
		}
	})
}
function getSummary(translationObject, str) {
	function countWhere(fn) {
		var n = 0;
		for (var k in translationObject) {
			if (fn(k, translationObject[k])) {
				n++
			}
		}
		return n;
	}
	return {
		total: countWhere(function() { return true }),
		translations: countWhere(function(from, to) { return to !== null && from !== to }),
		removals: countWhere(function(from, to) { return to === null })
	}
}






