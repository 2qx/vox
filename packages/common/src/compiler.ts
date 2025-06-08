import {
  createCompilerBCH,
  compilerOperationsBCH,
  CompilerBCH,
  CompilerConfiguration,
  CompilationContextBCH,
  importWalletTemplate,
  walletTemplateToCompilerConfiguration,
} from '@bitauth/libauth';

export function getLibauthCompiler(template_json: any): CompilerBCH {
  const template = importWalletTemplate(template_json);
  if (typeof template == 'string') {
    /* c8 ignore next */
    throw new Error(`Failed import libauth template, error: ${template}`);
  };
  return createCompilerBCH({
    ...walletTemplateToCompilerConfiguration(template),
    operations: {
      ...compilerOperationsBCH,
    }
  } as CompilerConfiguration<CompilationContextBCH>);
}