export function isValidRedirectUrl(url: string): boolean {
  try {
    if (url.startsWith("/")) {
      return !url.startsWith("//");
    }
    const redirect = new URL(url);
    const domainMode = process.env.DOMAIN_MODE;
    let allowedDomains: string[];
    if (domainMode === "local") {
      allowedDomains = ["example.com:3000", "www.example.com:3000"];
    } else {
      allowedDomains = ["sevenpreneur.net", "www.sevenpreneur.net"];
    }

    return allowedDomains.includes(redirect.host);
  } catch {
    return false;
  }
}
