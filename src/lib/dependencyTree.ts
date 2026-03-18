import { Plugin } from '@typedefs/steps/deploymentStepTypes';
import { getPluginName } from './pluginNames';

export type DependencyEdge = { from: string; to: string };

export function computeDependencyTree(plugins: Plugin[]): {
    edges: DependencyEdge[];
    hasCycle: boolean;
} {
    const edges: DependencyEdge[] = [];
    const seen = new Set<string>();

    plugins.forEach((plugin, index) => {
        if (!('dynamicEnvVars' in plugin)) {
            return;
        }

        const consumerName = getPluginName(plugin, index);

        for (const entry of plugin.dynamicEnvVars) {
            for (const pair of entry.values) {
                if ((pair.source === 'container_ip' || pair.source === 'plugin_value') && pair.provider) {
                    const providerName = pair.provider;
                    const edgeKey = `${consumerName}->${providerName}`;
                    if (!seen.has(edgeKey)) {
                        seen.add(edgeKey);
                        edges.push({ from: consumerName, to: providerName });
                    }
                }
            }
        }
    });

    const hasCycle = detectCycle(edges);

    return { edges, hasCycle };
}

function detectCycle(edges: DependencyEdge[]): boolean {
    const graph = new Map<string, string[]>();

    for (const edge of edges) {
        if (!graph.has(edge.from)) {
            graph.set(edge.from, []);
        }
        graph.get(edge.from)!.push(edge.to);
    }

    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map<string, number>();

    for (const node of graph.keys()) {
        color.set(node, WHITE);
    }

    function dfs(node: string): boolean {
        color.set(node, GRAY);
        for (const neighbor of graph.get(node) ?? []) {
            const c = color.get(neighbor) ?? WHITE;
            if (c === GRAY) return true;
            if (c === WHITE && dfs(neighbor)) return true;
        }
        color.set(node, BLACK);
        return false;
    }

    for (const node of graph.keys()) {
        if ((color.get(node) ?? WHITE) === WHITE) {
            if (dfs(node)) return true;
        }
    }

    return false;
}
