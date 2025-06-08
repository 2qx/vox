import template_json from './future-v2.template.json' with { type: "json" };

import {
  importWalletTemplate,
} from '@bitauth/libauth';

import { getLibauthCompiler } from '@unspent/tau';

export default class Future {


  static compiler = getLibauthCompiler(template_json)

  static generateTests() {
    const template = importWalletTemplate(template_json);
    if (typeof template == 'string') {
      /* c8 ignore next */
      throw new Error(`Failed import libauth template (future), error: ${template}`);
    };
    //const config = walletTemplateToCompilerConfiguration(template)
    if (template!.scripts) {
      
    }
  }

  //   const setupTx = compiler.generateScenario({
  //   debug: true,
  //   scenarioId: 'setupTx',
  //   unlockingScriptId: 'p2pkhUnlock',
  // });

}