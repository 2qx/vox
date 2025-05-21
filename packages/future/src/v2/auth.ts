import templateV3 from './future-v2.template.json' with { type: "json" };

import {
    createCompilerBCH,
    compilerOperationsBCH,
    CompilerBCH,
    CompilerConfiguration,
    CompilationContextBCH,
    importWalletTemplate,
    walletTemplateToCompilerConfiguration,
  } from '@bitauth/libauth';

export default class Future {

  static compiler(): CompilerBCH {
    const future_template = importWalletTemplate(templateV3);
    if (typeof future_template == 'string') {
      /* c8 ignore next */
      throw new Error(`Failed import libauth template (future), error: ${future_template}`);
    };
    return createCompilerBCH({
      ...walletTemplateToCompilerConfiguration(future_template),
      operations: {
        ...compilerOperationsBCH,
      }
    } as CompilerConfiguration<CompilationContextBCH>);
  }

}