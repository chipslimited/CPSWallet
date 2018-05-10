import VuePlugin from 'rollup-plugin-vue'
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import replace from 'rollup-plugin-replace';

export default {
  entry: 'src/main.js',
  format: 'iife',
  dest: 'dist/build.js', // 输出文件
  plugins: [
      VuePlugin(/* VuePluginOptions */),
      json({
          // All JSON files will be parsed by default,
          // but you can also specifically include/exclude files
          include: 'node_modules/**',

          // for tree-shaking, properties will be declared as
          // variables, using either `var` or `const`
          preferConst: true, // Default: false

          // specify indentation for the generated default export —
          // defaults to '\t'
          indent: '  '
      }),
      commonjs({extensions: [ '.js',], exclude: [
          'node_modules/rollup-plugin-node-builtins/**',
               'node_modules/bitcore-lib/**',
               'node_modules/secp256k1/**',
               'node_modules/elliptic/**',
          ]}),//secp256k1,elliptic,bitcore-lib
      resolve({extensions: [ '.js','.json'], browser: true, jsnext: true,main: true, preferBuiltins:true}),
      globals(),
      builtins(),
      replace({
          "process.env.NODE_ENV": '"production"'
      }),
      uglify(),
  ]
};
