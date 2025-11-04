import template_json from './template.v2.json' with { type: "json" };

import {
  type CompilerBch,
} from '@bitauth/libauth';

import { getLibauthCompiler } from '@unspent/tau';

export default class Future {

  static compiler: CompilerBch = getLibauthCompiler(template_json)

}