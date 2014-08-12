Supporting Materials
====================

These are the supporting materials for the ICSE 2013 submission *Efficient Construction of Approximate Call Graphs for JavaScript IDE Services*.

* list of subject programs: see `benchmarks.md`, contains links from where to download the subject programs and version information

* call graphs: see directory `callgraphs`; for every subject program, there are three JSON files:

  1. `dynamic-cg.fixed.json`: this is the dynamic call graph
  2. `optimistic-cg.fixed.json`: this is the call graph produced by the optimistic analysis
  3. `pessimistic-cg.fixed.json`: this is the call graph produced by the pessimistic analysis

  The call graphs are encoded in a very simple JSON format: the property names of the root object are call sites, while the property values are arrays listing all call targets.

  Call sites are encoded as strings of the form `<filename>@<line>:<startoff>-<endoff>`, where `<filename>` is the base name of the file in which the call site occurs, `<line>` is the line number, `<startoff>` is the start offset (in characters from the beginning of the file), ond `<endoff>` is the (exclusive) end offset.

  Call targets are either source-level functions, which are encoded in the same way, or built-in methods which are given with their fully qualified name, such as `Array_prototype_sort`.

* timings: `time-parse.txt`, `time-pessimistic.txt` and `time-optimistic.txt` give timings for parsing, parsing and running the pessimistic analysis, and parsing and running the optimistic analysis, respectively

* summaries: `summary-pessimistic.txt` and `summary-optimistic.txt` summarize several other bits of data about running the respective analyses on all subject programs; in particular, they list function coverage for the dynamic call graphs, precision and recall, and callee distribution

Inconsistency
=============

The call graphs originally uploaded here had inconsistent offsets in the callsite and callee IDs, making the dynamic call graphs incomparable to the static ones. The offsets have been forcefully aligned by a best-effort algorithm (see below).

Moreover, the wrong files were uploaded altogether for the optimistic call graphs. These have been regenerated and uploaded again.

This makes the evaluation repeatable with numbers that are close to those in the paper, although we are not able to get the exact same numbers anymore.

We have not been able to determine the precise reason for the inconsistency. It is likely due to our attempt to work around a [bug in esprima](https://code.google.com/p/esprima/issues/detail?id=309), causing the dynamic analysis to use different offsets than the static analysis.

Tools
=====

Two tools are included in the repository, `convert.js` and `evaluate.js`.

To use them, install [node.js](http://nodejs.org) and run `npm install` from the repository folder.

evaluate.js
-----------

`evaluate.js` computes precision and recall for a given benchmark. For example:

    ./evaluate.js callgraphs/markitup

convert.js
---------

`convert.js` was used to align offsets in the dynamic and static call graphs. It uses line numbers and the relative ordering of offsets within a line to match IDs.

For example, to examine the conversion for `markitup`'s dynamic call graph, run:

    ./convert.js callgraphs/markitup/dynamic-cg.broken.json --pretty --summary


