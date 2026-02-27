import {
  CompilerBch,
  importWalletTemplate,
  walletTemplateToCompilerBch,
} from '@bitauth/libauth';

export function getLibauthCompiler(template_json: any): CompilerBch {
  const template = importWalletTemplate(template_json);

  if (typeof template == 'string') {
    /* c8 ignore next */
    throw new Error(`Failed import libauth template, error: ${template}`);
  };
  return walletTemplateToCompilerBch(template)
}