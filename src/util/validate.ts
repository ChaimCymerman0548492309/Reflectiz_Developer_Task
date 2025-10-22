import validator from "validator";
export function isValidDomain(domain: string) {
  return validator.isFQDN(domain);
}
