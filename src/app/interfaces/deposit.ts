import {Param} from "./param";

export interface Deposit {
  code: string;
  name: string;
  param: Array<Param>;
}
