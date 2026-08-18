import fs from 'fs';
const base = {
  compilerOptions: {
    incremental: true,
    isolatedModules: true,
    lib: ['es2022', 'dom', 'dom.iterable'],
    module: 'esnext',
    moduleResolution: 'bundler',
    noEmitOnError: true,
    noFallthroughCasesInSwitch: true,
    noImplicitOverride: false,
    noImplicitReturns: true,
    noUnusedLocals: false,
    noImplicitAny: true,
    noImplicitThis: true,
    strictNullChecks: true,
    strictFunctionTypes: false,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    useUnknownInCatchVariables: true,
    alwaysStrict: true,
    skipLibCheck: true,
    target: 'es2022',
    types: [],
    noEmit: true,
    jsx: 'preserve',
    resolveJsonModule: true,
    allowImportingTsExtensions: true,
    paths: { '@/*': ['./src/*'] }
  }
};
fs.writeFileSync('tsconfig.base.json', JSON.stringify(base, null, 2));
const ext = {
  extends: './tsconfig.base.json',
  include: ['src/**/*'],
  exclude: ['node_modules', 'build', 'dist', '**/*.test.ts']
};
fs.writeFileSync('tsconfig.json', JSON.stringify(ext, null, 2));
console.log('tsconfig files generated');
