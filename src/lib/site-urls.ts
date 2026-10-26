import { HTMT_API_SUBDOMAIN, ORG_DOMAIN } from "@behindthemusictree/brand";
import { buildBackendBaseUrl } from "@behindthemusictree/app-kit/transport";

/**
 * HearTheMusicTree API base URL. Coolify (both prod and staging) always sets
 * `NEXT_PUBLIC_BACKEND_BASE_URL` as a buildtime var, which short-circuits everything below; the
 * subdomain-derived fallback only fires for local dev run without it, so it always targets staging.
 */
export function getBackendBaseUrl(): string {
  const overrideUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (overrideUrl) return overrideUrl;
  if (!HTMT_API_SUBDOMAIN) throw new Error("HTMT_API_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  const apiRootSegment = process.env.NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT;
  if (!apiRootSegment) throw new Error("NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT is required");
  return buildBackendBaseUrl({
    apiSubdomain: HTMT_API_SUBDOMAIN,
    orgDomain: ORG_DOMAIN,
    apiRootSegment,
    isProduction: false,
  });
}
