(window.MINDMAP = window.MINDMAP || {})['algo-4'] = {
  name: '고급 그래프 · 자료구조',
  groups: [
    { name: '그래프 심화', items: [
      { t: '프림', deep: true,
        d: '임의의 정점 하나에서 시작해, 지금까지 만든 트리와 연결된 간선 중 가장 가벼운 간선을 하나씩 붙여 최소 신장 트리(MST)를 만드는 그리디 알고리즘이다.',
        why: '모든 정점을 최소 비용으로 연결해야 하는 문제(도로·전선·네트워크 설치)에서, 간선이 정점 수에 비해 매우 많은 조밀한 그래프는 간선 전체를 정렬하는 크루스칼보다 정점 중심으로 확장하는 방식이 유리하다.',
        how: [
          '1) 시작 정점을 트리에 넣고, 그 정점에 붙은 간선을 모두 우선순위 큐에 넣는다.',
          '2) 큐에서 가장 가벼운 간선을 꺼낸다. 도착 정점이 이미 트리에 있으면 사이클이 생기므로 버린다.',
          '3) 도착 정점이 새 정점이면 트리에 넣고 비용을 더한 뒤, 그 정점의 간선을 큐에 넣는다.',
          '4) 트리에 정점이 V개 들어가면(간선 V-1개) 끝난다.',
          '- 시간 복잡도: 우선순위 큐를 쓰면 O(E log E) = O(E log V). 인접 행렬과 배열로 매번 최솟값을 찾으면 O(V²)로, 완전 그래프에 가까울 때 더 빠르다.',
          '- 정당성: 트리와 나머지를 가르는 경계(cut)를 지나는 가장 가벼운 간선은 항상 어떤 MST에 포함된다(cut property).',
          '다익스트라와 코드 모양이 거의 같지만, 큐에 넣는 값이 다르다. 다익스트라는 시작점부터의 누적 거리, 프림은 간선 하나의 가중치다.'
        ],
        code: `// 프림: O(E log V). graph.get(u) = List<int[]{v, w}>
long prim(int n, List<List<int[]>> graph) {
    boolean[] inTree = new boolean[n + 1];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
    pq.add(new int[]{1, 0});
    long total = 0;
    int picked = 0;
    while (!pq.isEmpty() && picked < n) {
        int[] cur = pq.poll();
        int u = cur[0];
        if (inTree[u]) continue;          // 이미 트리에 있으면 사이클
        inTree[u] = true;
        total += cur[1];
        picked++;
        for (int[] e : graph.get(u)) {
            if (!inTree[e[0]]) pq.add(new int[]{e[0], e[1]});
        }
    }
    return picked == n ? total : -1;     // -1이면 연결 그래프가 아니다
}`,
        warn: [
          '그래프가 연결되어 있지 않으면 트리가 모든 정점을 덮지 못한다. 고른 정점 수로 확인한다.',
          '가중치 합이 int 범위를 넘을 수 있으므로 합계는 long으로 둔다.',
          '방향 그래프의 최소 비용 신장 트리(최소 유향 신장 트리)는 프림으로 풀 수 없다.'
        ],
        qa: ['프림과 크루스칼은 언제 각각 쓰나요?',
          '둘 다 MST를 구하는 그리디 알고리즘입니다. 크루스칼은 간선을 가중치순으로 정렬해 유니온 파인드로 사이클을 피하며 붙이므로 O(E log E)이고 간선이 적은 희소 그래프에서 구현이 간단합니다. 프림은 한 정점에서 시작해 우선순위 큐로 가장 가벼운 인접 간선을 붙여 가므로 O(E log V)이고, 간선이 많은 조밀한 그래프에서는 배열 버전 O(V²)가 더 빠릅니다.'],
        rel: ['크루스칼', '유니온 파인드', '다익스트라', 'PriorityQueue 활용', '그리디 알고리즘'] },
      { t: '사이클 판별', deep: true,
        d: '그래프에 시작점으로 되돌아오는 경로(사이클)가 있는지 확인하는 기법으로, 무방향 그래프와 방향 그래프에서 방법이 다르다.',
        why: '의존 관계에 순환이 있으면 작업 순서를 정할 수 없고(빌드, 선수 과목), 트리인지 확인하거나 MST에서 간선을 붙일지 정할 때도 사이클 여부가 핵심 조건이 된다.',
        how: [
          '- 무방향 + 유니온 파인드: 간선 (u, v)를 볼 때 u와 v가 이미 같은 집합이면 사이클이다. 간선 목록만 있을 때 가장 간단하다.',
          '- 무방향 + DFS: 방문한 이웃 중 바로 직전 부모가 아닌 정점을 다시 만나면 사이클이다.',
          '- 방향 + DFS 3색: 방문 안 함(0), 탐색 중(1), 탐색 끝(2)으로 표시한다. 탐색 중(1)인 정점을 다시 만나면 현재 경로로 되돌아온 역방향 간선이므로 사이클이다. 탐색 끝(2)인 정점은 다른 경로에서 이미 다 본 곳이라 사이클이 아니다.',
          '- 방향 + 위상 정렬: 진입 차수 0인 정점을 꺼내 가며 처리한 정점 수가 V보다 작으면 사이클이 있다.',
          '시간 복잡도는 모두 O(V + E)다(유니온 파인드는 거의 O(E)).',
          '방향 그래프에서 방문 여부(true/false) 두 상태만 쓰면, 서로 다른 경로로 같은 정점에 도착한 경우를 사이클로 잘못 판단한다. 그래서 3색이 필요하다.'
        ],
        code: `// 방향 그래프 사이클 판별: 0=미방문, 1=탐색 중, 2=탐색 끝
int[] state;
boolean hasCycle(int u, List<List<Integer>> g) {
    state[u] = 1;
    for (int v : g.get(u)) {
        if (state[v] == 1) return true;              // 현재 경로로 되돌아옴
        if (state[v] == 0 && hasCycle(v, g)) return true;
    }
    state[u] = 2;
    return false;
}

// 무방향 그래프: 유니온 파인드
boolean cycleUndirected(int n, int[][] edges) {
    int[] parent = new int[n + 1];
    for (int i = 0; i <= n; i++) parent[i] = i;
    for (int[] e : edges) {
        int a = find(parent, e[0]), b = find(parent, e[1]);
        if (a == b) return true;                     // 이미 연결된 두 점을 또 잇는다
        parent[a] = b;
    }
    return false;
}
int find(int[] p, int x) { return p[x] == x ? x : (p[x] = find(p, p[x])); }`,
        warn: [
          '무방향 그래프에서 같은 두 정점 사이에 간선이 두 개(다중 간선) 있으면 부모 정점 비교만으로는 사이클을 놓친다. 정점 대신 간선 번호로 부모를 기억한다.',
          '정점이 10만 개 이상이고 일자로 이어진 그래프는 재귀 DFS가 스택 오버플로를 낸다. 반복문 DFS나 위상 정렬 방식을 쓴다.'
        ],
        qa: ['방향 그래프에서 사이클을 어떻게 찾나요?',
          'DFS를 하면서 정점을 미방문, 탐색 중, 탐색 끝 세 상태로 표시합니다. 탐색 중인 정점을 다시 만나면 현재 재귀 경로로 되돌아온 것이므로 사이클입니다. 다른 방법으로 위상 정렬을 돌려 처리된 정점 수가 전체보다 적으면 사이클이 있다고 판단할 수 있습니다. 둘 다 O(V + E)입니다.'],
        rel: ['위상 정렬', '유니온 파인드', 'DFS', '강한 연결 요소'] },
      { t: '이분 그래프 판별', deep: false,
        d: '정점을 두 그룹으로 나눠 모든 간선이 서로 다른 그룹을 잇게 만들 수 있는지 확인하는 기법으로, 인접한 정점을 두 색으로 번갈아 칠해 본다.',
        how: [
          '1) 색이 없는 정점에서 BFS나 DFS를 시작해 색 1을 칠한다.',
          '2) 이웃에는 반대 색을 칠한다.',
          '3) 이미 칠해진 이웃의 색이 현재 정점과 같으면 이분 그래프가 아니다.',
          '4) 연결 요소가 여러 개일 수 있으므로 모든 정점에서 시작을 시도한다.',
          '- 성질: 이분 그래프 ⇔ 홀수 길이 사이클이 없다.',
          '- 시간 복잡도: O(V + E).',
          '두 팀으로 나누기, 서로 싫어하는 사람 분리하기, 체스판 칸 칠하기 같은 문제가 이 유형이다.'
        ],
        code: `// BFS 색칠: color 0=미정, 1, -1
boolean isBipartite(int n, List<List<Integer>> g) {
    int[] color = new int[n + 1];
    ArrayDeque<Integer> q = new ArrayDeque<>();
    for (int s = 1; s <= n; s++) {
        if (color[s] != 0) continue;           // 연결 요소마다 시작
        color[s] = 1;
        q.add(s);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : g.get(u)) {
                if (color[v] == 0) { color[v] = -color[u]; q.add(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
        warn: ['그래프가 여러 조각으로 나뉘어 있으면 첫 정점에서만 시작했을 때 나머지 조각을 검사하지 못한다.'],
        rel: ['BFS', 'DFS', '사이클 판별'] },
      { t: '강한 연결 요소', deep: false,
        d: '방향 그래프에서 서로가 서로에게 도달할 수 있는 정점들의 최대 묶음(SCC)을 찾는 기법으로, 코사라주나 타잔 알고리즘을 쓴다.',
        how: [
          '같은 SCC 안의 어떤 두 정점 u, v도 u→v, v→u 경로가 모두 있다. SCC를 하나의 정점으로 줄이면 사이클이 없는 DAG가 된다(축약 그래프).',
          '- 코사라주: 1) 원래 그래프에서 DFS를 돌려 끝난 순서대로 스택에 쌓는다. 2) 간선 방향을 뒤집은 그래프에서 스택 위부터 DFS를 돌린다. 한 번의 DFS로 닿는 정점들이 하나의 SCC다.',
          '- 타잔: DFS 한 번으로 각 정점의 방문 순서와 도달 가능한 가장 이른 순서(low)를 구해, low가 자기 순서와 같은 정점을 SCC의 대표로 잡는다.',
          '- 시간 복잡도: 둘 다 O(V + E).',
          '2-SAT, 순환 의존 묶기, 도미노 넘어뜨리기(SCC 축약 후 진입 차수 0인 묶음 개수) 문제에 쓴다.'
        ],
        code: `// 코사라주 SCC: 정방향 DFS로 종료 순서 → 역방향 그래프에서 DFS
List<List<Integer>> g, rg;
boolean[] visited;
Deque<Integer> order = new ArrayDeque<>();
int[] comp;

void dfs1(int u) {
    visited[u] = true;
    for (int v : g.get(u)) if (!visited[v]) dfs1(v);
    order.push(u);                       // 끝난 순서대로 쌓기
}
void dfs2(int u, int id) {
    comp[u] = id;
    for (int v : rg.get(u)) if (comp[v] == 0) dfs2(v, id);
}
int scc(int n) {
    visited = new boolean[n + 1];
    comp = new int[n + 1];
    for (int i = 1; i <= n; i++) if (!visited[i]) dfs1(i);
    int id = 0;
    while (!order.isEmpty()) {
        int u = order.pop();
        if (comp[u] == 0) dfs2(u, ++id);
    }
    return id;                           // SCC 개수
}`,
        warn: ['역방향 그래프를 따로 만들어야 한다(코사라주). 메모리가 빠듯하면 타잔을 쓴다.', '재귀 깊이가 V까지 갈 수 있다. 큰 입력에서는 스레드 스택 크기를 늘리거나 반복문으로 바꾼다.'],
        rel: ['사이클 판별', '위상 정렬', 'DFS'] }
    ]},
    { name: '특수 최단 경로', items: [
      { t: '0-1 BFS', deep: false,
        d: '간선 가중치가 0 또는 1뿐인 그래프에서 덱(Deque)으로 최단 거리를 O(V + E)에 구하는 기법이다.',
        why: '가중치가 모두 같으면 BFS, 제각각이면 다익스트라를 쓰지만, 0과 1 두 종류뿐이면 우선순위 큐 없이도 거리 순서를 지킬 수 있어 다익스트라의 log를 없앨 수 있다.',
        how: [
          '1) 시작점을 덱에 넣고 거리를 0으로 둔다.',
          '2) 덱 앞에서 정점을 꺼낸다.',
          '3) 가중치 0 간선으로 거리가 줄면 덱 앞에 넣는다(같은 거리 층).',
          '4) 가중치 1 간선으로 거리가 줄면 덱 뒤에 넣는다(다음 거리 층).',
          '덱 안에는 항상 거리 d와 d+1인 정점만 앞뒤로 정렬되어 있으므로, 우선순위 큐처럼 가장 가까운 정점이 먼저 나온다.',
          '- 시간 복잡도: O(V + E).',
          '순간이동은 0초, 걷기는 1초(숨바꼭질 3), 벽 부수기 횟수 최소화(빈 칸 0, 벽 1) 같은 문제가 대표적이다.'
        ],
        code: `// 0-1 BFS: 가중치 0은 앞에, 1은 뒤에
int[] zeroOneBfs(int n, int start, List<List<int[]>> g) {
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;
    ArrayDeque<Integer> dq = new ArrayDeque<>();
    dq.add(start);
    while (!dq.isEmpty()) {
        int u = dq.pollFirst();
        for (int[] e : g.get(u)) {
            int v = e[0], w = e[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.addFirst(v); else dq.addLast(v);
            }
        }
    }
    return dist;
}`,
        warn: ['방문 체크를 넣을 때가 아니라 거리가 줄어들 때마다 갱신해야 한다. 일반 BFS처럼 처음 방문만 인정하면 0 간선으로 더 짧아지는 경우를 놓친다.'],
        rel: ['BFS', '다익스트라', 'ArrayDeque 활용', '다중 시작점 BFS'] },
      { t: '다중 시작점 BFS', deep: true,
        d: '시작점이 여러 개일 때 모두를 처음부터 큐에 넣고 한 번의 BFS로 각 칸까지 가장 가까운 시작점과의 거리를 구하는 기법이다.',
        why: '시작점마다 BFS를 따로 돌리면 시작점이 K개일 때 O(K × (V + E))가 되어 시간 초과가 난다. 동시에 퍼져 나가는 상황(익는 토마토, 번지는 불)은 한 번의 BFS로 끝낼 수 있다.',
        how: [
          '1) 모든 시작점을 거리 0으로 표시하고 큐에 한꺼번에 넣는다.',
          '2) 평소 BFS처럼 큐에서 꺼내 이웃의 거리를 현재 + 1로 정한다.',
          '3) 큐가 층별로 처리되므로 각 칸에는 가장 가까운 시작점에서 온 거리가 처음으로 기록된다.',
          '가상의 출발점 S를 하나 만들어 모든 시작점과 가중치 0으로 이었다고 생각하면 일반 BFS와 같다.',
          '- 시간 복잡도: O(V + E). 격자라면 O(R × C).',
          '- 두 종류가 동시에 퍼지는 문제(불과 사람이 동시에 움직이는 탈출)는 불 BFS를 먼저 돌려 칸마다 불이 붙는 시각을 구한 뒤, 사람 BFS에서 그보다 먼저 도착할 수 있는 칸만 지나간다.'
        ],
        code: `// 토마토: 익은 토마토(1) 모두에서 동시에 퍼진다. 0=안 익음, -1=빈 칸
int ripenDays(int[][] box) {
    int r = box.length, c = box[0].length;
    int[][] dist = new int[r][c];
    ArrayDeque<int[]> q = new ArrayDeque<>();
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) {
            dist[i][j] = -1;
            if (box[i][j] == 1) { dist[i][j] = 0; q.add(new int[]{i, j}); }
        }
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    while (!q.isEmpty()) {
        int[] cur = q.poll();
        for (int d = 0; d < 4; d++) {
            int nr = cur[0] + dr[d], nc = cur[1] + dc[d];
            if (nr < 0 || nc < 0 || nr >= r || nc >= c) continue;
            if (box[nr][nc] != 0 || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[cur[0]][cur[1]] + 1;
            q.add(new int[]{nr, nc});
        }
    }
    int ans = 0;
    for (int i = 0; i < r; i++)
        for (int j = 0; j < c; j++) {
            if (box[i][j] == 0 && dist[i][j] == -1) return -1;   // 끝내 안 익는 칸
            ans = Math.max(ans, Math.max(dist[i][j], 0));
        }
    return ans;
}`,
        warn: [
          '시작점을 하나씩 넣고 BFS를 반복하는 실수가 가장 흔하다. 반드시 처음에 전부 넣는다.',
          '방문 표시는 큐에 넣을 때 한다. 꺼낼 때 하면 같은 칸이 여러 번 들어가 메모리와 시간이 폭증한다.'
        ],
        qa: ['시작점이 여러 개인 최단 거리는 어떻게 구하나요?',
          '모든 시작점을 거리 0으로 큐에 한꺼번에 넣고 BFS를 한 번만 돌립니다. BFS는 거리 순서로 퍼지므로 각 칸에는 가장 가까운 시작점에서 온 거리가 처음 기록됩니다. 시작점마다 BFS를 돌리면 O(K(V+E))지만 이렇게 하면 O(V+E)입니다. 가상의 출발점 하나가 모든 시작점과 연결된 그래프로 생각하면 됩니다.'],
        rel: ['BFS', '0-1 BFS', 'ArrayDeque 활용', '문제 유형 판별 신호'] }
    ]},
    { name: '트리 질의', items: [
      { t: '최소 공통 조상 (LCA)', deep: true,
        d: '루트가 있는 트리에서 두 정점의 공통 조상 중 가장 깊은 정점을 찾는 문제로, 희소 배열(binary lifting)로 질의 하나를 O(log N)에 답한다.',
        why: '트리에서 두 정점 사이 거리, 경로 위 최댓값 같은 질의가 수만 개 들어오면 매번 부모를 하나씩 타고 올라가는 O(N) 방식으로는 시간 초과가 난다.',
        how: [
          '- 단순 방법: 깊이를 맞춘 뒤 두 정점을 동시에 한 칸씩 올린다. 질의당 O(N). 질의가 적을 때만 쓴다.',
          '- 희소 배열: `parent[k][v]` = v의 2^k번째 조상. `parent[k][v] = parent[k-1][ parent[k-1][v] ]`로 O(N log N)에 채운다.',
          '1) BFS나 DFS로 각 정점의 깊이와 바로 위 부모(parent[0])를 구한다.',
          '2) 더 깊은 정점을 깊이 차이의 이진수 비트만큼 점프해 깊이를 맞춘다.',
          '3) 두 정점이 같으면 그 정점이 LCA다.',
          '4) 아니면 큰 k부터 내려오며 parent[k]가 서로 다를 때만 둘 다 점프한다. 끝나면 둘의 바로 위 부모가 LCA다.',
          '- 활용: 두 정점 거리 = depth[u] + depth[v] - 2 × depth[lca]. 가중치 트리면 루트까지 거리 배열로 같은 식을 쓴다.',
          '- 복잡도: 전처리 O(N log N), 질의 O(log N), 메모리 O(N log N).'
        ],
        code: `// 희소 배열 LCA. LOG = 17이면 N ≤ 131072
static final int LOG = 17;
int[][] up;   // up[k][v] = v의 2^k번째 조상
int[] depth;

void build(int n, List<List<Integer>> tree) {
    up = new int[LOG][n + 1];
    depth = new int[n + 1];
    boolean[] seen = new boolean[n + 1];
    ArrayDeque<Integer> q = new ArrayDeque<>();
    q.add(1); seen[1] = true; up[0][1] = 1;            // 루트의 부모는 자기 자신
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : tree.get(u)) if (!seen[v]) {
            seen[v] = true; depth[v] = depth[u] + 1; up[0][v] = u; q.add(v);
        }
    }
    for (int k = 1; k < LOG; k++)
        for (int v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
}

int lca(int a, int b) {
    if (depth[a] < depth[b]) { int t = a; a = b; b = t; }
    int diff = depth[a] - depth[b];
    for (int k = 0; k < LOG; k++) if ((diff >> k & 1) == 1) a = up[k][a];
    if (a == b) return a;
    for (int k = LOG - 1; k >= 0; k--)
        if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
    return up[0][a];
}`,
        warn: [
          'LOG는 2^LOG가 N보다 크게 잡는다. 너무 작으면 깊은 정점에서 답이 틀린다.',
          '루트의 부모를 0으로 두면 up 배열이 0번 정점을 가리켜 엉뚱한 값이 나올 수 있다. 루트 자신을 가리키게 한다.'
        ],
        qa: ['LCA를 빠르게 구하는 방법을 설명해 주세요.',
          '각 정점의 2의 거듭제곱 번째 조상을 미리 저장하는 희소 배열을 O(N log N)에 만듭니다. 질의가 오면 더 깊은 정점을 깊이 차이의 이진 표현대로 점프해 깊이를 맞추고, 큰 점프부터 두 정점의 조상이 다를 때만 함께 올립니다. 마지막에 남은 정점의 부모가 LCA이고 질의 하나에 O(log N)입니다.'],
        rel: ['트리 DP', 'BFS', '비트마스킹', '세그먼트 트리'] }
    ]},
    { name: '구간 자료구조', items: [
      { t: '세그먼트 트리', deep: true,
        d: '배열을 구간으로 반씩 나눈 이진 트리에 각 구간의 합·최솟값 같은 결과를 저장해, 값 변경과 구간 질의를 모두 O(log N)에 처리하는 자료구조다.',
        why: '누적합은 구간 합을 O(1)에 주지만 값이 하나 바뀌면 O(N)을 다시 계산해야 한다. 변경과 질의가 섞여 수만~수십만 번 들어오는 문제에서는 둘 다 빠른 구조가 필요하다.',
        how: [
          '- 구조: 노드 1이 전체 구간 [0, N-1]을 맡고, 노드 i의 자식 2i, 2i+1이 왼쪽 절반과 오른쪽 절반을 맡는다. 배열 크기는 4N이면 충분하다.',
          '- 빌드: 리프에 원소를 넣고 부모는 두 자식 값을 합친다. O(N).',
          '- 점 갱신: 바뀐 원소가 속한 리프에서 루트까지 올라가며 다시 합친다. 경로 길이 O(log N).',
          '- 구간 질의: 노드 구간이 질의 구간에 완전히 들어가면 그 값을 쓰고, 완전히 벗어나면 무시하고, 걸치면 두 자식으로 내려간다. 방문 노드가 O(log N)개다.',
          '합 대신 최솟값, 최댓값, 최대공약수, XOR처럼 결합 법칙이 성립하는 연산이면 무엇이든 넣을 수 있다. 빈 구간의 값(합은 0, 최솟값은 무한대)을 정확히 정해야 한다.',
          '구간 전체에 값을 더하는 갱신까지 필요하면 느리게 갱신되는 세그먼트 트리(lazy propagation)로 확장한다.'
        ],
        code: `// 구간 합 세그먼트 트리 (재귀)
long[] tree;
int n;

void build(long[] a, int node, int l, int r) {
    if (l == r) { tree[node] = a[l]; return; }
    int m = (l + r) / 2;
    build(a, node * 2, l, m);
    build(a, node * 2 + 1, m + 1, r);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
}
void update(int node, int l, int r, int idx, long val) {
    if (l == r) { tree[node] = val; return; }
    int m = (l + r) / 2;
    if (idx <= m) update(node * 2, l, m, idx, val);
    else update(node * 2 + 1, m + 1, r, idx, val);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
}
long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;              // 완전히 벗어남
    if (ql <= l && r <= qr) return tree[node];   // 완전히 포함
    int m = (l + r) / 2;
    return query(node * 2, l, m, ql, qr) + query(node * 2 + 1, m + 1, r, ql, qr);
}
// 사용: tree = new long[4 * n]; build(a, 1, 0, n - 1); query(1, 0, n - 1, L, R);`,
        warn: [
          '배열 크기를 2N으로 잡으면 N이 2의 거듭제곱이 아닐 때 인덱스가 넘친다. 재귀 구현은 4N을 쓴다.',
          '질의 구간 [L, R]이 L > R로 들어오는 입력이 있으면 미리 바꿔 준다.',
          '합이 int를 넘기 쉽다. 값과 트리는 long으로 둔다.'
        ],
        qa: ['세그먼트 트리는 언제 쓰고 시간 복잡도는 어떻게 되나요?',
          '배열의 값 변경과 구간 합·최솟값 질의가 섞여 많이 들어올 때 씁니다. 구간을 반씩 나눈 이진 트리에 구간별 결과를 저장하므로 빌드는 O(N), 점 갱신과 구간 질의는 트리 높이만큼인 O(log N)입니다. 누적합은 질의가 O(1)이지만 갱신이 O(N)이라 변경이 잦으면 세그먼트 트리가 필요합니다.'],
        rel: ['펜윅 트리', '느리게 갱신되는 세그먼트 트리', '누적합', '좌표 압축'] },
      { t: '펜윅 트리', deep: false,
        d: '인덱스의 가장 낮은 1비트(i & -i)를 이용해 접두사 합을 저장하는 배열로, 점 갱신과 접두사 합 질의를 O(log N)에 처리한다. BIT(Binary Indexed Tree)라고도 한다.',
        how: [
          '- `tree[i]`는 (i - (i & -i), i] 구간의 합을 맡는다. 예: tree[12]는 9~12, tree[8]은 1~8.',
          '- 갱신: i에서 시작해 `i += i & -i`로 그 원소를 포함하는 구간들을 모두 올린다.',
          '- 접두사 합: i에서 시작해 `i -= i & -i`로 내려가며 더한다.',
          '- 구간 합 [l, r] = sum(r) - sum(l - 1).',
          '- 1-based 인덱스를 써야 한다. 0에서는 `i & -i`가 0이라 무한 루프가 된다.',
          '세그먼트 트리보다 코드가 10줄 안팎으로 짧고 메모리가 N + 1이며 상수가 작다. 대신 최솟값처럼 뺄셈으로 되돌릴 수 없는 연산의 임의 구간 질의에는 쓰기 어렵다.',
          '역순 쌍(inversion) 개수 세기는 값을 좌표 압축한 뒤 앞에서부터 보며 자기보다 큰 값의 개수를 펜윅 트리로 세면 O(N log N)이다.'
        ],
        code: `// 펜윅 트리 (1-based)
long[] bit;
void add(int i, long delta) {
    for (; i < bit.length; i += i & -i) bit[i] += delta;
}
long sum(int i) {                 // 1..i 합
    long s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
}
long rangeSum(int l, int r) { return sum(r) - sum(l - 1); }
// 값을 v로 바꾸려면: add(i, v - arr[i]); arr[i] = v;`,
        warn: ['값을 바꾸는 연산이 아니라 더하는 연산이다. 새 값으로 바꾸려면 원래 배열을 따로 들고 차이만큼 더한다.'],
        rel: ['세그먼트 트리', '누적합', '좌표 압축', '비트마스킹'] },
      { t: '느리게 갱신되는 세그먼트 트리', deep: false,
        d: '구간 전체에 값을 더하거나 바꾸는 갱신을, 아래 노드에 바로 반영하지 않고 lazy 배열에 미뤄 두었다가 필요할 때 내려보내 O(log N)에 처리하는 세그먼트 트리다.',
        how: [
          '일반 세그먼트 트리로 구간 [L, R]에 값을 더하면 원소마다 점 갱신을 해야 해 O(N log N)이 된다.',
          '1) 갱신 구간이 노드 구간을 완전히 덮으면 그 노드 값만 고치고(합이면 값 × 구간 길이를 더함), 자식에게 줄 몫을 lazy[node]에 적어 두고 멈춘다.',
          '2) 나중에 그 노드의 자식을 방문해야 할 때(갱신이든 질의든) 먼저 lazy를 두 자식에게 내려보낸다(propagate).',
          '3) 나머지는 일반 세그먼트 트리와 같다.',
          '- 시간 복잡도: 구간 갱신과 구간 질의 모두 O(log N).',
          '- 더하기와 바꾸기(대입)가 섞이면 lazy에 두 종류를 함께 저장하고 적용 순서를 정의해야 한다.',
          '구간 더하기 + 점 질의만 필요하면 차분 배열을 펜윅 트리에 올리는 더 간단한 방법이 있다.'
        ],
        code: `// 구간 더하기 + 구간 합 (lazy propagation)
long[] tree, lazy;

void push(int node, int l, int r) {
    if (lazy[node] == 0) return;
    int m = (l + r) / 2;
    apply(node * 2, l, m, lazy[node]);
    apply(node * 2 + 1, m + 1, r, lazy[node]);
    lazy[node] = 0;
}
void apply(int node, int l, int r, long v) {
    tree[node] += v * (r - l + 1);
    lazy[node] += v;
}
void update(int node, int l, int r, int ql, int qr, long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { apply(node, l, r, v); return; }
    push(node, l, r);
    int m = (l + r) / 2;
    update(node * 2, l, m, ql, qr, v);
    update(node * 2 + 1, m + 1, r, ql, qr, v);
    tree[node] = tree[node * 2] + tree[node * 2 + 1];
}
long query(int node, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return tree[node];
    push(node, l, r);
    int m = (l + r) / 2;
    return query(node * 2, l, m, ql, qr) + query(node * 2 + 1, m + 1, r, ql, qr);
}`,
        warn: [
          '질의에서도 자식으로 내려가기 전에 push를 해야 한다. 갱신에서만 하면 질의 결과가 틀린다.',
          '합 트리에서 lazy 값을 반영할 때 구간 길이를 곱하는 것을 잊기 쉽다.'
        ],
        rel: ['세그먼트 트리', '차분 배열', '펜윅 트리'] }
    ]}
  ],
  must: [
    'MST는 간선이 적으면 크루스칼(정렬 + 유니온 파인드), 많으면 프림(우선순위 큐)이다.',
    '방향 그래프 사이클은 DFS 3색이나 위상 정렬, 무방향 그래프 사이클은 유니온 파인드로 찾는다.',
    '가중치가 0과 1뿐이면 0-1 BFS, 시작점이 여러 개면 전부 큐에 넣고 BFS 한 번이다.',
    '변경과 구간 질의가 섞이면 세그먼트 트리나 펜윅 트리, 구간 갱신까지 있으면 lazy 세그먼트 트리다.'
  ]
};
