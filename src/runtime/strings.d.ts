///<reference path="array.d.ts" />
///<reference path="pct.d.ts" />

declare var HTML_ENTITIES: number;
declare var HTML_SPECIALCHARS: number;

declare var ENT_COMPAT: number;
declare var ENT_QUOTES: number;
declare var ENT_NOQUOTES: number;
declare var ENT_IGNORE: number;
declare var ENT_SUBSTITUTE: number;
declare var ENT_DISALLOWED: number;
declare var ENT_HTML401: number;
declare var ENT_XML1: number;
declare var ENT_XHTML: number;
declare var ENT_HTML5: number;

declare var LC_ALL: number;
declare var LC_COLLATE: number;
declare var LC_CTYPE: number;
declare var LC_MONETARY: number;
declare var LC_NUMERIC: number;
declare var LC_TIME: number;
declare var LC_MESSAGES: number;

declare var STR_PAD_RIGHT: number;
declare var STR_PAD_LEFT: number;
declare var STR_PAD_BOTH: number;

declare function addcslashes(str: string, charlist: string): string;
declare function addslashes(str: string): string;
declare function bin2hex(str: string): string;
declare function chr(ascii: number): string;
declare function chunk_split(body: string, chunklen?: number, end?: string): string;
declare function convert_cyr_string(str: string, from: string, to: string): string;
declare function convert_uudecode(data: string): string;
declare function convert_uuencode(data: string): string;
declare function count_chars(string: string, mode?: number): any;
declare function crc32(str: string): number;
declare function crypt(str: string, salt: string): string;
declare function echo(...str: any[]): string;
declare function explode(delimiter: string, string: string, limit?: number): string[];
declare function fprintf(handle: Pct.PhpResource, format: string, ...args: any[]): number;
declare function get_html_translation_table(table?: number, flags?: number, encoding?: string): PhpAssocArray;
declare function hebrev(hebrew_text: string, max_chars_per_line?: number): string;
declare function hebrevc(hebrew_text: string, max_chars_per_line?: number): string;
declare function hex2bin(data: string): string;
declare function html_entity_decode(string: string, flags?: number, encoding?: string): string;
declare function htmlentities(string: string, flags?: number, encoding?: string, double_encode?: bool): string;
declare function htmlspecialchars(string: string, flags?: number, encoding?: string, double_encode?: bool): string;
declare function htmlspecialchars_decode(string: string, flags?: number): string;
declare function implode(glue: string, pieces: Array): string;
declare function implode(pieces: Array): string;
declare function lcfirst(str: string): string;
declare function levenshtein(str1: string, str2: string): number;
declare function levenshtein(str1: string, str2: string, const_ins: number, cost_rep: number, cost_del: number);
declare function localconv(): PhpAssocArray;
declare function ltrim(str: string, charlist?: string): string;
declare function md5(str: string, raw_output?: bool): string;
declare function md5_file(filename: string, raw_output?: bool): string;
declare function metaphone(str: string, phonemes?: number): string;
declare function money_format(format: string, number: number): string;
declare function nl_langinfo(item: number): string; //TODO enum for last param
declare function nl2br(string: string, is_xhtml?: bool): string;
declare function number_format(number: number, decimals?: number, dec_point?: string, thousands_sep?: string): string;
declare function ord(string: string): number;
declare function parse_str(str: string, $arr: PhpAssocArray); //we require an array because we don't have ability to set var in current scope and don't want it
declare function print(arg: any): number;
declare function printf(format: string, ...args: any[]): number;
declare function quoted_printable_decode(str: string): string;
declare function quoted_printable_encode(str: string): string;
declare function quotemeta(str: string): string;
declare function rtrim(str: string, charlist?: string): string;
declare function setlocale(category: number, locale: string, ...settings: string[]): string;
declare function setlocale(category: number, locale: Array): string;
declare function sha1(str: string, raw_output?: bool): string;
declare function sha1_file(filename: string, raw_output?: bool): string;
declare function similar_text(first: string, second: string, $percent?: number): number;
declare function soundex(str: string): string;
declare function sprintf(format: string, ...args: any[]): string;
declare function sscanf(str: string, format: string, ...$vars: any[]): any;
declare function str_getcsv(input: string, delimiter?: string, enclosure?: string, escape?: string): string[];
declare function str_ireplace(search: string, replace: string, subject: string, $count?: number): string;
declare function str_ireplace(search: any[], replace: string, subject: string, $count?: number): string;
declare function str_ireplace(search: any[], replace: any[], subject: string, $count?: number): string;
declare function str_ireplace(search: any[], replace: any[], subject: any[], $count?: number): string[];
declare function str_ireplace(search: string, replace: any[], subject: string, $count?: number): string;
declare function str_ireplace(search: string, replace: any[], subject: any[], $count?: number): string;
declare function str_ireplace(search: string, replace: string, subject: any[], $count?: number): string;
declare function str_pad(input: string, pad_length: number, pad_string?: string, pad_type?: number): string;
declare function str_repeat(input: string, multiplier: number): string;
declare function str_replace(search: string, replace: string, subject: string, $count?: number): string;
declare function str_replace(search: any[], replace: string, subject: string, $count?: number): string;
declare function str_replace(search: any[], replace: any[], subject: string, $count?: number): string;
declare function str_replace(search: any[], replace: any[], subject: any[], $count?: number): string[];
declare function str_replace(search: string, replace: any[], subject: string, $count?: number): string;
declare function str_replace(search: string, replace: any[], subject: any[], $count?: number): string;
declare function str_replace(search: string, replace: string, subject: any[], $count?: number): string;
declare function str_rot13(str: string): string;
declare function str_shuffle(str: string): string;
declare function str_split(str: string, split_length?: number): string[];
declare function str_word_count(string: string, format?: number, charlist?: string): any; //number or array
declare function strcasecmp(str1: string, str2: string): number;
declare function strcmp(str1: string, str2: string): number;
declare function strcoll(str1: string, str2: string): number;
declare function strcspn(str1: string, str2: string, start?: number, length?: number): number;
declare function strip_tags(str: string, allowable_tags?: string): string;
declare function stripcslashes(str: string): string;
declare function stripos(haystack: string, needle: string, offset?: number): number;
declare function stripos(haystack: string, needle: number, offset?: number): number;
declare function stripslashes(str: string): string;
declare function stristr(haystack: string, needle: string, before_needle?: bool): string;
declare function stristr(haystack: string, needle: number, before_needle?: bool): string;
declare function strlen(string: string): number;
declare function strnatcasecmp(str1: string, str2: string): number;
declare function strnatcmp(str1: string, str2: string): number;
declare function strncasecmp(str1: string, str2: string, len: number): number;
declare function strncmp(str1: string, str2: string, len: number): number;
declare function strpbrk(haystack: string, char_list: string): string;
declare function strpos(haystack: string, needle: string, offset?: number): number;
declare function strpos(haystack: string, needle: number, offset?: number): number;
declare function strrchr(haystack: string, needle: string): string;
declare function strrchr(haystack: string, needle: number): string;
declare function strrev(string: string): string;
declare function strripos(haystack: string, needle: string, offset?: number): number;
declare function strripos(haystack: string, needle: number, offset?: number): number;
declare function strrpos(haystack: string, needle: string, offset?: number): number;
declare function strrpos(haystack: string, needle: number, offset?: number): number;
declare function strspn(subject: string, mask: string, start?: number, length?: number): number;
declare function strstr(haystack: string, needle: string, before_needle?: bool): string;
declare function strstr(haystack: string, needle: number, before_needle?: bool): string;
declare function strtok(str: string, token: string): string;
declare function strtok(token: string): string;
declare function strtolower(str: string): string;
declare function strtoupper(string: string): string;
declare function strtr(str: string, from: string, to: string): string;
declare function strtr(str: string, replace_pairs: PhpAssocArray): string;
declare function substr(string: string, start: number, length?: number): string;
declare function substr_compare(main_str: string, str: string, offset: number, length?: number, case_sensitivity?: bool): number;
declare function substr_count(haystack: string, needle: string, offset?: number, length?: number): number;
declare function substr_replace(string: string, replacement: string, start: number, length?: number): string;
declare function substr_replace(string: string[], replacement: string, start: number, length?: number): string[];
declare function substr_replace(string: string[], replacement: string[], start: number, length?: number): string[];
declare function substr_replace(string: string[], replacement: string, start: number[], length?: number): string[];
declare function substr_replace(string: string[], replacement: string[], start: number[], length?: number): string[];
declare function substr_replace(string: string[], replacement: string, start: number, length?: number[]): string[];
declare function substr_replace(string: string[], replacement: string[], start: number, length?: number[]): string[];
declare function substr_replace(string: string[], replacement: string, start: number[], length?: number[]): string[];
declare function substr_replace(string: string[], replacement: string[], start: number[], length?: number[]): string[];
declare function trim(str: string, charlist?: string): string;
declare function ucfirst(str: string): string;
declare function ucwords(str: string): string;
declare function vfprintf(handle: Pct.PhpResource, format: string, args: Array): number;
declare function vprintf(format: string, args: Array): number;
declare function vsprintf(format: string, args: Array): string;
declare function wordwrap(str: string, width?: number, break_?: string, cut?: bool): string;