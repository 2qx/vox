import template_json from './template.v2.json' with { type: "json" };

import {
  type CompilerBCH,
} from '@bitauth/libauth';

import { getLibauthCompiler } from '@unspent/tau';

export default class Future {

  static compiler: CompilerBCH = getLibauthCompiler(template_json)

}