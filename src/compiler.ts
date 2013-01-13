///<reference path="pratphall.ts" />

module Pratphall {
    export class CompilerOptions {
        allCapsConst = false;
        extensions: string[] = [];
        comments = true;
        composer = true;
        jsLib = true;
        organize = true;
        phpLib = true;
        typeHint = true;
        out: string = null;
        preferSingleQuotes = false;
        requireReferences = false;
        single = false;
        useElseif = false;
        verbose = false;
        lint = false;
    }

    export class Compiler {
        io = loadIo();

        constructor(public options: CompilerOptions) {
        }

        private debug(str: string) {
            if (this.options.verbose) this.io.writeLine(str);
        }

        compile(files: string[], err: StringWriter) {
            this.debug('Beginning compile');
            //validate options
            if (files == null || files.length == 0) throw new Error('No files given to compile');
            if (this.options.requireReferences && this.options.organize) {
                throw new Error('require-references can only be set with no-organize');
            }
            if (this.options.single && !this.options.organize) {
                throw new Error('single cannot be set with no-organize, it is assumed');
            }
            if (this.options.single && this.options.out != null &&
                    this.io.exists(this.options.out) && !this.io.isFile(this.options.out)) {
                throw new Error('out must be a file if it exists when single is set');
            }
            if (this.options.single && this.options.out == null && files.length > 1) {
                throw new Error('out must be set if single is set and multiple compiled files are given');
            }
            //resolve units
            var units: TypeScript.SourceUnit[] = [];
            var knownFullPaths: string[] = [];
            var addUnitAndReferences = (path: string, baseDir = '.') => {
                var fullPath = this.io.resolvePath(baseDir, path);
                if (knownFullPaths.indexOf(fullPath) != -1) return;
                if (!this.io.isFile(fullPath)) throw new Error('Resolved file not found: ' + path);
                this.debug('Loading source unit: ' + fullPath);
                var unit = new TypeScript.SourceUnit(fullPath, this.io.readFile(fullPath));
                unit.referencedFiles = TypeScript.getReferencedFiles(unit);
                units.push(unit);
                knownFullPaths.push(fullPath);
                //loop through references
                unit.referencedFiles.forEach((value: TypeScript.IFileReference) => {
                    addUnitAndReferences(value.path, this.io.dirPath(fullPath));
                });
            }
            //add lib.d.ts?
            if (this.options.jsLib) {
                addUnitAndReferences('lib.d.ts', this.io.getExecutingFilePath());
            }
            //add php runtime decls?
            if (this.options.phpLib) {
                addUnitAndReferences('php.d.ts', this.io.getExecutingFilePath());
            }
            //add given files
            files.forEach(addUnitAndReferences);
            //create compiler
            var settings = new TypeScript.CompilationSettings();
            var logger: TypeScript.ILogger = new TypeScript.NullLogger();
            //add debug logger?
            if (this.options.verbose) {
                logger = {
                    information: () => { return true; },
                    debug: () => { return true; },
                    warning: () => { return true; },
                    error: () => { return true; },
                    fatal: () => { return true; },
                    log: this.io.writeLine
                };
            }
            var compiler = new TypeScript.TypeScriptCompiler(err, logger, settings);
            //extend the error reporter
            extendErrorReporter(compiler);
            //add units to the compiler
            units.forEach((value: TypeScript.SourceUnit) => {
                var path = this.io.relativePath(this.io.dirPath(files[0]), value.path);
                compiler.addSourceUnit(value, path, false, value.referencedFiles);
            });
            //errors means null
            if (err.contents.length > 0) return null;
            //now that we're compiled, type check
            compiler.typeCheck();
            //errors means null
            if (err.contents.length > 0) return null;
            //return
            return compiler;
        }

        buildEmitter(compiler: TypeScript.TypeScriptCompiler) {
            //create PHP emitter
            var options = new PhpEmitOptions();
            options.allCapsConsts = this.options.allCapsConst;
            options.alwaysPreferSingleQuotes = this.options.preferSingleQuotes;
            options.comments = this.options.comments;
            options.requireReferences = this.options.requireReferences;
            options.typeHint = this.options.typeHint;
            options.useElseif = this.options.typeHint;
            //TODO: register custom extensions
            return new PhpEmitter(compiler.typeChecker, options);
        }

        emit(compiler: TypeScript.TypeScriptCompiler, emitter: PhpEmitter) {
            if (this.options.organize) return this.emitOrganized(compiler, emitter);
            else return this.emitNonOrganized(compiler, emitter);
        }

        emitOrganized(compiler: TypeScript.TypeScriptCompiler, emitter: PhpEmitter) {
            this.debug('Emitting organized files');
            var results = new Results();
            //loop through scripts
            compiler.scripts.members.forEach((value: TypeScript.Script, index: number) => {
                //ignore decl
                if (value.isDeclareFile) return;
                emitter.emit(value);
                //errors and warnings
                var errors = emitter.clearErrors();
                if (errors.length > 0) {
                    results.errors.push({ filename: value.locationInfo.filename, details: errors });
                }
                var warnings = emitter.clearWarnings();
                if (warnings.length > 0) {
                    results.warnings.push({ filename: value.locationInfo.filename, details: warnings });
                }
            });
            //do we have errors? then no-go
            if (results.errors.length != 0) return results;
            //first, the top namespace code as the main file
            if (emitter.topNamespace.code.trim().length > 0) {
                var file = new OutputFile((<TypeScript.Script>compiler.scripts.members[0]).locationInfo.filename);
                this.debug('Emitting top namespace code at ' + file.path);
                file.contents += this.emitUseDeclarations(emitter.topNamespace);
                if (this.options.composer) file.contents += "require('vendor/autoload.php');\n";
                file.contents += emitter.topNamespace.code.trim();
                results.files.push(file);
            }
            //now write all types
            var writeNamespace = (value: Namespace) => {
                //if there is code in a non-top-level namespace, we have a problem
                if (value.name != '' && value.code.trim().length > 0) {
                    if (this.options.verbose) {
                        this.debug('Top-level code found for ' + value.name + ':\n' + value.code.trim());
                    }
                    throw new Error('Module ' + value.name + ' cannot have top level code');
                }
                value.types.forEach((decl: TypeDecl) => {
                    //filename is module + decl name + .php
                    var filename = value.name == '' ? '' : value.name.replace('.', '/') + '/';
                    filename += decl.name + '.php';
                    var file = new OutputFile(filename);
                    if (value.name != '') file.contents += 'namespace ' + value.getPhpName() + ';\n\n';
                    file.contents += this.emitUseDeclarations(decl);
                    file.contents += decl.code.trim();
                    results.files.push(file);
                });
                //and children
                value.children.forEach(writeNamespace);
            }
            writeNamespace(emitter.topNamespace);
            return results;
        }

        emitNonOrganized(compiler: TypeScript.TypeScriptCompiler, emitter: PhpEmitter) {
            //loop through scripts
            var results = new Results();
            var filenameNormalize = (value: TypeScript.Script) => {
                return value.locationInfo.filename.replace('.ts', '.php');
            };
            compiler.scripts.members.forEach((value: TypeScript.Script, index: number) => {
                //ignore decl
                if (value.isDeclareFile) return;
                //not single means reset
                if (!this.options.single) emitter.reset();
                emitter.emit(value);
                //errors and warnings
                var errors = emitter.clearErrors();
                if (errors.length > 0) {
                    results.errors.push({ filename: value.locationInfo.filename, details: errors });
                }
                var warnings = emitter.clearWarnings();
                if (warnings.length > 0) {
                    results.warnings.push({ filename: value.locationInfo.filename, details: warnings });
                }
                //not single means we need file right here (if never had any errors ever)
                if (!this.options.single && results.errors.length == 0) {
                    results.files.push(this.emitSingleScript(filenameNormalize(value), emitter, index == 0));
                }
            });
            //remove files if error
            if (results.errors.length > 0) results.files = [];
            else if (this.options.single) {
                //single means just one file here
                var filename = this.options.out;
                results.files.push(this.emitSingleScript(filenameNormalize(<TypeScript.Script>compiler.scripts.
                    members[0]), emitter, true));
            }
            return results;
        }

        public emitSingleScript(filename: string, emitter: PhpEmitter, bootstrap: bool) {
            var file = new OutputFile(filename);
            //more than one namespace?
            emitter.topNamespace.code = emitter.topNamespace.code.trim();
            var onlyNs: Namespace = null; 
            if (emitter.topNamespace.code.length == 0 && emitter.topNamespace.children.length == 1 &&
                    emitter.topNamespace.types.length == 0 &&
                    emitter.topNamespace.children[0].children.length == 0) {
                onlyNs = emitter.topNamespace.children[0];
            } else if (emitter.topNamespace.children.length == 0) onlyNs = emitter.topNamespace;
            //namespace writer
            var writeNamespace = (ns: Namespace, wrap: bool, first = false) => {
                if (wrap) ns.code = ns.code.replace('\n', '\n' + emitter.options.indent).trim();
                else ns.code = ns.code.trim();
                if (ns.code == '' && ns.types.length == 0) return false;
                file.contents += '\n';
                if (wrap) file.contents += 'namespace ' + ns.getPhpName() + ' {\n';
                //write use decls
                file.contents += this.emitUseDeclarations(ns, wrap ? emitter.options.indent : null);
                //composer require
                if (bootstrap && first && this.options.composer) {
                    file.contents += emitter.options.indent + "require('vendor/autoload.php');\n";
                }
                //type decls before code
                ns.types.forEach((value: TypeDecl, index: number) => {
                    if (wrap) value.code = value.code.replace('\n', '\n' + emitter.options.indent).trim();
                    else value.code = value.code.trim();
                    if (index > 0) file.contents += '\n';
                    if (wrap) file.contents += emitter.options.indent;
                    file.contents += value.code + '\n';
                });
                //now code
                if (ns.code.trim() != '') {
                    file.contents += '\n';
                    if (wrap) file.contents += emitter.options.indent;
                    file.contents += ns.code + '\n';
                }
                if (wrap) file.contents += '}\n';
                return true;
            };
            //if only one, it is a tad different
            if (onlyNs != null) {
                if (onlyNs.name != '') {
                    file.contents += 'namespace ' + onlyNs.getPhpName() + ';\n';
                }
                writeNamespace(onlyNs, false, true);
            } else {
                var hasTop = emitter.topNamespace.code.trim().length != 0 || emitter.topNamespace.types.length > 0;
                var first = !hasTop;
                var writeChildren = (ns: Namespace) => {
                    //me if not top
                    if (ns.name != '') {
                        first = !writeNamespace(ns, true, first) && first;
                    }
                    //my children
                    ns.children.forEach(writeChildren);
                };
                //write children before top
                writeChildren(emitter.topNamespace);
                //write top if there
                if (hasTop) writeNamespace(emitter.topNamespace, true, false);
            }
            //return the file
            return file;
        }

        emitUseDeclarations(decl: Declaration, indent?: string) {
            var ret = '';
            decl.uses.forEach((use: UseDecl) => {
                if (indent != null) ret += indent;
                ret += 'use ' + use.phpName;
                if (use.alias != null) ret += ' as ' + use.alias;
                ret += ';\n';
            });
            if (decl instanceof Namespace) {
                (<Namespace>decl).types.forEach((type: TypeDecl) => {
                    ret += this.emitUseDeclarations(type, indent);
                });
            }
            return ret;
        }

        outputResults(results: Results) {
            //errors and warnings
            results.errors.forEach((error: FileError) => {
                error.details.forEach((value: EmitterError) => {
                    this.io.writeErr('ERROR: ' + error.filename + '(' + value.line + ',' + 
                        value.col + ') - ' + value.message + '\n');
                });
            });
            results.warnings.forEach((warning: FileError) => {
                warning.details.forEach((value: EmitterError) => {
                    this.io.writeErr('WARN: ' + warning.filename + '(' + value.line + ',' + 
                        value.col + ') - ' + value.message + '\n');
                });
            });
            //we don't write with errors or just linting
            if (results.errors.length > 0 || this.options.lint) return;
            var isOutFile = this.options.out.indexOf('.php') != -1;
            var dir = isOutFile ? this.io.dirPath(this.options.out) : this.options.out;
            results.files.forEach((value: OutputFile, index: number) => {
                //first file can be specified by out
                var file = isOutFile && index == 0 ? this.options.out : this.io.joinPaths(dir, value.path);
                var fileDir = this.io.dirPath(file);
                if (!this.io.exists(fileDir)) {
                    this.debug('Creating directory: ' + fileDir);
                    this.io.mkdirs(fileDir);
                }
                this.debug('Writing file: ' + file);
                this.io.writeFile(file, '<?php\n' + value.contents);
            });
        }

        run(files: string[]) {
            var err = new StringWriter();
            var compiler = this.compile(files, err);
            if (err.contents.length > 0) {
                this.io.writeErr(err.contents);
                return;
            }
            var emitter = this.buildEmitter(compiler);
            var results = this.emit(compiler, emitter);
            this.outputResults(results);
        }
    }

    export class StringWriter implements ITextWriter {
        contents: string = '';
        Write(s: string) { this.contents += s; }
        WriteLine(s: string) { this.Write(s + '\n'); }
        Close() { }
    }

    export class OutputFile {
        contents = '';
        constructor(public path: string) { }
    }

    export interface FileError {
        filename: string;
        details: EmitterError[];
    }

    export class Results {
        files: OutputFile[] = [];
        errors: FileError[] = [];
        warnings: FileError[] = [];
    }
}