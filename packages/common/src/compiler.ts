import {
  // createCompilerBch,
  // compilerOperationsBCH,
  CompilerBch,
  // CompilerConfiguration,
  // CompilationContextBCH,
  importWalletTemplate,
  walletTemplateToCompilerBch,
  //walletTemplateToCompilerConfiguration,
} from '@bitauth/libauth';

export function getLibauthCompiler(template_json: any): CompilerBch {
  const template = importWalletTemplate(template_json);
  
  if (typeof template == 'string') {
    /* c8 ignore next */
    throw new Error(`Failed import libauth template, error: ${template}`);
  };
  return walletTemplateToCompilerBch(template)
  // return createCompilerBch({
  //   ...walletTemplateToCompilerConfiguration(template),
  //   operations: {
  //     ...compilerOperationsBCH,
  //   }
  // } as CompilerConfiguration<CompilationContextBCH>);
}