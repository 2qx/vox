import template_json from './future-v2.template.json' with { type: "json" };

import {
  type CompilerBCH,
} from '@bitauth/libauth';

import { getLibauthCompiler } from '@unspent/tau';

export default class Future {

  static compiler: CompilerBCH = getLibauthCompiler(template_json)

}