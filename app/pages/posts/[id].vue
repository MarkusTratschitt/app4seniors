<script lang="ts">
import type { RouteLocationNormalized } from "vue-router";
import { useRoute } from "vue-router";

type RouteParams = { id?: string | string[] };
type PageRoute = RouteLocationNormalized & {
  params: RouteParams;
};

/**
 * Minimal runtime implementation of Nuxt's compile-time helper.
 * At build-time Nuxt/TS transforms calls to definePageMeta, but at runtime
 * returning the meta object is harmless and keeps TypeScript happy.
 */
export function definePageMeta<T extends Record<string, any>>(meta: T): T {
  return meta;
}
// When accessing /posts/1, route.params.id will be 1
const route = useRoute();
console.log(route.params.id);
console.log(route.params.id);
</script>
