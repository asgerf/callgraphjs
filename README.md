Supporting Materials
====================

These are the supporting materials for the ICSE 2013 submission *Efficient Construction of Approximate Call Graphs for JavaScript IDE Services*.

* list of subject programs: see `benchmarks.md`, contains links from where to download the subject programs and version information

* call graphs: see directory `callgraphs`; for every subject program, there are three JSON files:

  1. `dynamic-cg.json`: this is the dynamic call graph
  2. `optimistic-cg.json`: this is the call graph produced by the optimistic analysis
  3. `pessimistic-cg.json`: this is the call graph produced by the pessimistic analysis

  The call graphs are encoded in a very simple JSON format: the property names of the root object are call sites, while the property values are arrays listing all call targets.

  Call sites are encoded as strings of the form `<filename>@<line>:<startoff>-<endoff>`, where `<filename>` is the base name of the file in which the call site occurs, `<line>` is the line number, `<startoff>` is the start offset (in characters from the beginning of the file), ond `<endoff>` is the (exclusive) end offset.

  Call targets are either source-level functions, which are encoded in the same way, or built-in methods which are given with their fully qualified name, such as `Array_prototype_sort`.

* timings: `time-parse.txt`, `time-pessimistic.txt` and `time-optimistic.txt` give timings for parsing, parsing and running the pessimistic analysis, and parsing and running the optimistic analysis, respectively

* summaries: `summary-pessimistic.txt` and `summary-optimistic.txt` summarize several other bits of data about running the respective analyses on all subject programs; in particular, they list function coverage for the dynamic call graphs, precision and recall, and callee distribution

* analysis source code: will be made available once IP issues have been resolved