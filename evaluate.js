#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
require('sugar');

program.option('--broken', 'Use broken CGs, without offset adjustment')
program.usage('DIR [options]\n\n'+
			  '  Compare call graphs in DIR. For example: `evaluate callgraphs/beslimed`')
program.parse(process.argv);

var dir = program.args[0];
if (!dir) {
	program.help()
}

if (dir.endsWith('/')) {
	dir = dir.substring(0, dir.length-1);
}

function getJSON(name) {
	var ext = program.broken ? '-cg.broken.json' : '-cg.fixed.json';
	return JSON.parse(fs.readFileSync(dir + '/' + name + ext, 'utf8'));
}

var dynamicCG = getJSON('dynamic');
var optimisticCG = getJSON('optimistic');
var pessimisticCG = getJSON('pessimistic');

function sizeOfIntersection(xs, ys) {
	var map = Object.create(null);
	ys.forEach(function(y) {
		map[y] = true;
	});
	var count = 0;
	xs.forEach(function(x) {
		if (map[x]) {
			++count[x];
		}
	})
	return count;
}
function divide(x, y) {
	if (y == 0)
		return 1;
	return x / y;
}

function trim(id) {
	var at = id.indexOf('@')
	var idx = id.indexOf(':');
	return id.substring(0, at) + id.substring(idx);
}
function trimCG(cg) {
	var result = Object.create(null);
	for (var k in cg) {
		var tk = trim(k)
		if (!(tk in result)) {
			result[tk] = [];
		}
		result[tk].push(k)
	}
	return result;
}
function checkSuspicousIDs(cg) {
	var trimmedDynamicCG = trimCG(dynamicCG)
	var trimmedCG = trimCG(cg);
	for (var k in cg) {
		var tk = trim(k);
		if (!(k in dynamicCG) && tk in trimmedDynamicCG) {
			console.log("Static " + k + " vs dynamic " + trimmedDynamicCG[tk] + " (" + cg[k] + ")");
		}
	}
	for (var k in dynamicCG) {
		var tk = trim(k)
		if (!(k in cg) && tk in trimmedCG) {
			console.log("Dynamic " + k + " + vs static " + trimmedCG[tk] + " (" + dynamicCG[k] + ")")
		}
	}
}

/// Removes the line number part from an ID
function fixID(id) {
	return id;
	var x1 = id.indexOf('@');
	if (x1 == -1)
		return id; // native ID, such as Math_pow, has no @ symbol
	var x2 = id.indexOf(':');
	return id.substring(0, x1) + id.substring(x2);
}

function fixCallgraph(cg) {
	var result = {};
	for (var k in cg) {
		if (!cg.hasOwnProperty(k))
			continue;
		result[fixID(k)] = cg[k].map(fixID);
	}
	return result;
}

function evaluateCallgraph(cg) {
	var cg = cg
	var dyn = dynamicCG
	// cg = fixCallgraph(cg);
	// dyn = fixCallgraph(dynamicCG);
	var precisionSamples = [];
	var recallSamples = [];
	for (var callsite in dyn) {
		if (!dyn.hasOwnProperty(callsite))
			continue;

		var dynCallees = dyn[callsite];
		if (dynCallees.length === 0)
			continue; // no dynamic information about call site

		var callees = cg[callsite];
		if (!callees) {
			// console.log("Missing calls for " + callsite);
			callees = [];
		}
		var positives = dynCallees.intersect(callees);

		var precision = divide(positives.length, callees.length);
		var recall = divide(positives.length, dynCallees.length);

		precisionSamples.push(precision);
		recallSamples.push(recall);
	}
	return {
		precision : precisionSamples.average(),
		recall : recallSamples.average()
	}
}

var optimistic = evaluateCallgraph(optimisticCG);
var pessimistic = evaluateCallgraph(pessimisticCG);

function percent(x) {
	return (100 * x).toFixed(2) + '%';
}

checkSuspicousIDs(optimisticCG)
checkSuspicousIDs(pessimisticCG)

console.log('Optimistic:')
console.log('  Recall:    %s', percent(optimistic.recall));
console.log('  Precision: %s', percent(optimistic.precision));

console.log('Pessimistic:')
console.log('  Recall:    %s', percent(pessimistic.recall));
console.log('  Precision: %s', percent(pessimistic.precision));
