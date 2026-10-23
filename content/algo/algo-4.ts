import type { Topic } from '../types';

const topic: Topic = {
  key: "algo-4",
  name: "고급 그래프 · 자료구조",
  must: [
    "MST는 간선이 적으면 크루스칼(정렬 + 유니온 파인드), 많으면 프림(우선순위 큐)이다.",
    "방향 그래프 사이클은 DFS 3색이나 위상 정렬, 무방향 그래프 사이클은 유니온 파인드로 찾는다.",
    "가중치가 0과 1뿐이면 0-1 BFS, 시작점이 여러 개면 전부 큐에 넣고 BFS 한 번이다.",
    "변경과 구간 질의가 섞이면 세그먼트 트리나 펜윅 트리, 구간 갱신까지 있으면 lazy 세그먼트 트리다."
  ],
  groups: [
    {
      name: "그래프 심화",
      compare: {
        cols: ["기준", "프림", "사이클 판별", "이분 그래프 판별", "강한 연결 요소"],
        rows: [
          ["대상 그래프", "무방향 가중치", "방향·무방향 모두", "무방향", "방향"],
          ["핵심 도구", "우선순위 큐", "DFS 3색, 유니온 파인드", "BFS·DFS 색칠", "DFS 두 번(코사라주)"],
          ["시간 복잡도", "O(E log V)", "O(V + E)", "O(V + E)", "O(V + E)"],
          ["문제 신호", "모두 최소 비용으로 연결", "순환 의존, 트리 여부", "두 그룹으로 나누기", "서로 오가는 묶음, 2-SAT"]
        ]
      },
      concepts: [
        {
          id: "algo/peurim",
          slug: "peurim",
          title: "프림",
          deep: true,
          def: "임의의 정점 하나에서 시작해, 지금까지 만든 트리와 연결된 간선 중 가장 가벼운 간선을 하나씩 붙여 최소 신장 트리(MST)를 만드는 그리디 알고리즘이다.",
          why: "모든 정점을 최소 비용으로 연결해야 하는 문제(도로·전선·네트워크 설치)에서, 간선이 정점 수에 비해 매우 많은 조밀한 그래프는 간선 전체를 정렬하는 크루스칼보다 정점 중심으로 확장하는 방식이 유리하다.",
          how: [
            "1) 시작 정점을 트리에 넣고, 그 정점에 붙은 간선을 모두 우선순위 큐에 넣는다.",
            "2) 큐에서 가장 가벼운 간선을 꺼낸다. 도착 정점이 이미 트리에 있으면 사이클이 생기므로 버린다.",
            "3) 도착 정점이 새 정점이면 트리에 넣고 비용을 더한 뒤, 그 정점의 간선을 큐에 넣는다.",
            "4) 트리에 정점이 V개 들어가면(간선 V-1개) 끝난다.",
            "- 시간 복잡도: 우선순위 큐를 쓰면 O(E log E) = O(E log V). 인접 행렬과 배열로 매번 최솟값을 찾으면 O(V²)로, 완전 그래프에 가까울 때 더 빠르다.",
            "- 정당성: 트리와 나머지를 가르는 경계(cut)를 지나는 가장 가벼운 간선은 항상 어떤 MST에 포함된다(cut property).",
            "다익스트라와 코드 모양이 거의 같지만, 큐에 넣는 값이 다르다. 다익스트라는 시작점부터의 누적 거리, 프림은 간선 하나의 가중치다."
          ],
          flow: ["시작 정점 넣기", "최소 간선 꺼내기", "이미 트리면 버림", "새 정점 추가", "인접 간선 큐에 넣기"],
          code: "// 프림: O(E log V). graph.get(u) = List<int[]{v, w}>\nlong prim(int n, List<List<int[]>> graph) {\n    boolean[] inTree = new boolean[n + 1];\n    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));\n    pq.add(new int[]{1, 0});\n    long total = 0;\n    int picked = 0;\n    while (!pq.isEmpty() && picked < n) {\n        int[] cur = pq.poll();\n        int u = cur[0];\n        if (inTree[u]) continue;          // 이미 트리에 있으면 사이클\n        inTree[u] = true;\n        total += cur[1];\n        picked++;\n        for (int[] e : graph.get(u)) {\n            if (!inTree[e[0]]) pq.add(new int[]{e[0], e[1]});\n        }\n    }\n    return picked == n ? total : -1;     // -1이면 연결 그래프가 아니다\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"모든 도시를 연결하는 최소 비용\", \"네트워크 연결\", \"모든 별을 잇는 최소 길이\"처럼 정점을 빠짐없이 최소 비용으로 잇는 문제.",
            "좌표만 주어지고 모든 점 사이가 연결 가능한 완전 그래프는 간선이 V²개라 정렬이 무거운 크루스칼보다 배열 버전 O(V²) 프림이 빠르다."
          ],
          warn: [
            "그래프가 연결되어 있지 않으면 트리가 모든 정점을 덮지 못한다. 고른 정점 수로 확인한다.",
            "가중치 합이 int 범위를 넘을 수 있으므로 합계는 long으로 둔다.",
            "방향 그래프의 최소 비용 신장 트리(최소 유향 신장 트리)는 프림으로 풀 수 없다."
          ],
          myth: [
            [
              "프림과 다익스트라는 같은 알고리즘이다.",
              "코드 모양은 같지만 큐에 넣는 기준이 다르다. 다익스트라는 시작점부터의 누적 거리, 프림은 트리에 붙일 간선 하나의 가중치로 비교한다."
            ]
          ],
          answer: "프림은 한 정점에서 시작해 지금까지 만든 트리에 붙은 간선 중 가장 가벼운 것을 우선순위 큐로 골라 붙이는 MST 알고리즘입니다. 이미 트리에 있는 정점으로 가는 간선은 사이클이므로 버리고, 정점이 모두 들어오면 끝납니다. O(E log V)이며 간선이 많은 그래프에서 크루스칼보다 유리합니다.",
          analogy: "마을 하나에서 시작해, 이미 전기가 들어온 마을과 아직 안 들어온 마을 사이 전선 중 가장 싼 것부터 하나씩 까는 것과 같습니다.",
          qa: [
            "프림과 크루스칼은 언제 각각 쓰나요?",
            "둘 다 MST를 구하는 그리디 알고리즘입니다. 크루스칼은 간선을 가중치순으로 정렬해 유니온 파인드로 사이클을 피하며 붙이므로 O(E log E)이고 간선이 적은 희소 그래프에서 구현이 간단합니다. 프림은 한 정점에서 시작해 우선순위 큐로 가장 가벼운 인접 간선을 붙여 가므로 O(E log V)이고, 간선이 많은 조밀한 그래프에서는 배열 버전 O(V²)가 더 빠릅니다."
          ],
          followUps: [
            [
              "MST가 유일하지 않을 수 있나요?",
              "같은 가중치 간선이 여러 개면 MST의 모양은 여러 개일 수 있지만 총 비용은 항상 같습니다. 모든 간선 가중치가 서로 다르면 MST는 유일합니다."
            ],
            [
              "두 번째로 작은 신장 트리는 어떻게 구하나요?",
              "MST를 구한 뒤, MST에 없는 간선 (u, v)를 하나 넣고 u-v 경로에서 가장 무거운 간선을 빼는 경우를 모두 비교합니다. 경로 최댓값은 LCA 희소 배열에 최댓값을 함께 저장해 O(log N)에 구합니다."
            ]
          ],
          related: [
            "algo/keuruseukal",
            "algo/yunion-paindeu",
            "algo/daikseuteura",
            "algo/priorityqueue-hwalyong",
            "algo/geuridi-algorijeum"
          ]
        },
        {
          id: "algo/saikeul-panbyeol",
          slug: "saikeul-panbyeol",
          title: "사이클 판별",
          deep: true,
          def: "그래프에 시작점으로 되돌아오는 경로(사이클)가 있는지 확인하는 기법으로, 무방향 그래프와 방향 그래프에서 방법이 다르다.",
          why: "의존 관계에 순환이 있으면 작업 순서를 정할 수 없고(빌드, 선수 과목), 트리인지 확인하거나 MST에서 간선을 붙일지 정할 때도 사이클 여부가 핵심 조건이 된다.",
          how: [
            "- 무방향 + 유니온 파인드: 간선 (u, v)를 볼 때 u와 v가 이미 같은 집합이면 사이클이다. 간선 목록만 있을 때 가장 간단하다.",
            "- 무방향 + DFS: 방문한 이웃 중 바로 직전 부모가 아닌 정점을 다시 만나면 사이클이다.",
            "- 방향 + DFS 3색: 방문 안 함(0), 탐색 중(1), 탐색 끝(2)으로 표시한다. 탐색 중(1)인 정점을 다시 만나면 현재 경로로 되돌아온 역방향 간선이므로 사이클이다. 탐색 끝(2)인 정점은 다른 경로에서 이미 다 본 곳이라 사이클이 아니다.",
            "- 방향 + 위상 정렬: 진입 차수 0인 정점을 꺼내 가며 처리한 정점 수가 V보다 작으면 사이클이 있다.",
            "시간 복잡도는 모두 O(V + E)다(유니온 파인드는 거의 O(E)).",
            "방향 그래프에서 방문 여부(true/false) 두 상태만 쓰면, 서로 다른 경로로 같은 정점에 도착한 경우를 사이클로 잘못 판단한다. 그래서 3색이 필요하다."
          ],
          code: "// 방향 그래프 사이클 판별: 0=미방문, 1=탐색 중, 2=탐색 끝\nint[] state;\nboolean hasCycle(int u, List<List<Integer>> g) {\n    state[u] = 1;\n    for (int v : g.get(u)) {\n        if (state[v] == 1) return true;              // 현재 경로로 되돌아옴\n        if (state[v] == 0 && hasCycle(v, g)) return true;\n    }\n    state[u] = 2;\n    return false;\n}\n\n// 무방향 그래프: 유니온 파인드\nboolean cycleUndirected(int n, int[][] edges) {\n    int[] parent = new int[n + 1];\n    for (int i = 0; i <= n; i++) parent[i] = i;\n    for (int[] e : edges) {\n        int a = find(parent, e[0]), b = find(parent, e[1]);\n        if (a == b) return true;                     // 이미 연결된 두 점을 또 잇는다\n        parent[a] = b;\n    }\n    return false;\n}\nint find(int[] p, int x) { return p[x] == x ? x : (p[x] = find(p, p[x])); }",
          codeLang: "java",
          use: [
            "문제 신호: \"작업 순서를 정할 수 없으면 -1\", \"트리인지 판별\", \"순환 참조가 있는지\".",
            "실무에서는 빌드 도구가 모듈 의존성 순환을, 스프링 컨테이너가 빈 순환 참조를 같은 원리로 찾아 기동 시 오류를 낸다."
          ],
          warn: [
            "무방향 그래프에서 같은 두 정점 사이에 간선이 두 개(다중 간선) 있으면 부모 정점 비교만으로는 사이클을 놓친다. 정점 대신 간선 번호로 부모를 기억한다.",
            "정점이 10만 개 이상이고 일자로 이어진 그래프는 재귀 DFS가 스택 오버플로를 낸다. 반복문 DFS나 위상 정렬 방식을 쓴다."
          ],
          myth: [
            [
              "방향 그래프도 방문 배열 하나로 사이클을 판별할 수 있다.",
              "다른 경로에서 이미 끝난 정점을 다시 만난 것뿐인데 사이클로 오판한다. 현재 재귀 경로에 있는지(탐색 중)를 따로 구분해야 한다."
            ]
          ],
          answer: "무방향 그래프는 간선을 하나씩 보며 두 끝점이 이미 같은 집합이면 사이클이라고 유니온 파인드로 판단합니다. 방향 그래프는 DFS에서 미방문, 탐색 중, 탐색 끝 세 상태를 두고 탐색 중인 정점을 다시 만나면 사이클로 보거나, 위상 정렬로 처리된 정점 수가 전체보다 적은지 확인합니다. 모두 O(V + E)입니다.",
          qa: [
            "방향 그래프에서 사이클을 어떻게 찾나요?",
            "DFS를 하면서 정점을 미방문, 탐색 중, 탐색 끝 세 상태로 표시합니다. 탐색 중인 정점을 다시 만나면 현재 재귀 경로로 되돌아온 것이므로 사이클입니다. 다른 방법으로 위상 정렬을 돌려 처리된 정점 수가 전체보다 적으면 사이클이 있다고 판단할 수 있습니다. 둘 다 O(V + E)입니다."
          ],
          followUps: [
            [
              "사이클에 속한 정점들까지 출력하려면 어떻게 하나요?",
              "DFS에서 부모 배열을 기록해 두고, 탐색 중인 정점 v를 다시 만났을 때 현재 정점에서 부모를 따라 v까지 거슬러 올라가면 사이클 경로를 얻습니다."
            ],
            [
              "트리인지 판별하는 조건은 무엇인가요?",
              "정점이 N개일 때 간선이 정확히 N-1개이고, 모든 정점이 연결되어 있으면(또는 사이클이 없으면) 트리입니다. 세 조건 중 두 개가 성립하면 나머지도 성립합니다."
            ]
          ],
          related: ["algo/wisang-jeongryeol", "algo/yunion-paindeu", "algo/dfs", "algo/ganghan-yeongyeol-yoso"]
        },
        {
          id: "algo/ibun-geuraepeu-panbyeol",
          slug: "ibun-geuraepeu-panbyeol",
          title: "이분 그래프 판별",
          deep: false,
          def: "정점을 두 그룹으로 나눠 모든 간선이 서로 다른 그룹을 잇게 만들 수 있는지 확인하는 기법으로, 인접한 정점을 두 색으로 번갈아 칠해 본다.",
          how: [
            "1) 색이 없는 정점에서 BFS나 DFS를 시작해 색 1을 칠한다.",
            "2) 이웃에는 반대 색을 칠한다.",
            "3) 이미 칠해진 이웃의 색이 현재 정점과 같으면 이분 그래프가 아니다.",
            "4) 연결 요소가 여러 개일 수 있으므로 모든 정점에서 시작을 시도한다.",
            "- 성질: 이분 그래프 ⇔ 홀수 길이 사이클이 없다.",
            "- 시간 복잡도: O(V + E).",
            "두 팀으로 나누기, 서로 싫어하는 사람 분리하기, 체스판 칸 칠하기 같은 문제가 이 유형이다."
          ],
          code: "// BFS 색칠: color 0=미정, 1, -1\nboolean isBipartite(int n, List<List<Integer>> g) {\n    int[] color = new int[n + 1];\n    ArrayDeque<Integer> q = new ArrayDeque<>();\n    for (int s = 1; s <= n; s++) {\n        if (color[s] != 0) continue;           // 연결 요소마다 시작\n        color[s] = 1;\n        q.add(s);\n        while (!q.isEmpty()) {\n            int u = q.poll();\n            for (int v : g.get(u)) {\n                if (color[v] == 0) { color[v] = -color[u]; q.add(v); }\n                else if (color[v] == color[u]) return false;\n            }\n        }\n    }\n    return true;\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"두 팀으로 나눌 수 있는가\", \"서로 원수인 사람은 다른 그룹\", \"체스판처럼 칠할 수 있는가\".",
            "이분 매칭(작업 배정) 문제의 전제 조건을 확인할 때 쓴다."
          ],
          warn: ["그래프가 여러 조각으로 나뉘어 있으면 첫 정점에서만 시작했을 때 나머지 조각을 검사하지 못한다."],
          answer: "이분 그래프 판별은 정점을 BFS나 DFS로 탐색하며 이웃에 반대 색을 칠하고, 같은 색끼리 이어진 간선을 만나면 이분 그래프가 아니라고 판단합니다. 홀수 길이 사이클이 없는 것과 같은 조건이며 O(V + E)입니다. 연결 요소가 여러 개일 수 있으므로 모든 정점에서 시작을 시도해야 합니다.",
          analogy: "모든 학생을 두 반으로 나누는데 싸운 학생끼리는 같은 반이 되면 안 되는 상황입니다. 한 명씩 반을 정하며 싸운 상대는 반대 반에 넣다가, 이미 같은 반에 들어간 상대를 만나면 불가능합니다.",
          followUps: [
            [
              "이분 그래프와 홀수 사이클은 어떤 관계인가요?",
              "이분 그래프에서 사이클을 따라가면 색이 번갈아 바뀌므로 출발 색으로 돌아오려면 길이가 짝수여야 합니다. 반대로 홀수 사이클이 없으면 BFS 깊이의 홀짝으로 두 그룹을 나눌 수 있어 두 조건은 동치입니다."
            ]
          ],
          related: ["algo/bfs", "algo/dfs", "algo/saikeul-panbyeol"]
        },
        {
          id: "algo/ganghan-yeongyeol-yoso",
          slug: "ganghan-yeongyeol-yoso",
          title: "강한 연결 요소",
          deep: false,
          def: "방향 그래프에서 서로가 서로에게 도달할 수 있는 정점들의 최대 묶음(SCC)을 찾는 기법으로, 코사라주나 타잔 알고리즘을 쓴다.",
          how: [
            "같은 SCC 안의 어떤 두 정점 u, v도 u→v, v→u 경로가 모두 있다. SCC를 하나의 정점으로 줄이면 사이클이 없는 DAG가 된다(축약 그래프).",
            "- 코사라주: 1) 원래 그래프에서 DFS를 돌려 끝난 순서대로 스택에 쌓는다. 2) 간선 방향을 뒤집은 그래프에서 스택 위부터 DFS를 돌린다. 한 번의 DFS로 닿는 정점들이 하나의 SCC다.",
            "- 타잔: DFS 한 번으로 각 정점의 방문 순서와 도달 가능한 가장 이른 순서(low)를 구해, low가 자기 순서와 같은 정점을 SCC의 대표로 잡는다.",
            "- 시간 복잡도: 둘 다 O(V + E).",
            "2-SAT, 순환 의존 묶기, 도미노 넘어뜨리기(SCC 축약 후 진입 차수 0인 묶음 개수) 문제에 쓴다."
          ],
          code: "// 코사라주 SCC: 정방향 DFS로 종료 순서 → 역방향 그래프에서 DFS\nList<List<Integer>> g, rg;\nboolean[] visited;\nDeque<Integer> order = new ArrayDeque<>();\nint[] comp;\n\nvoid dfs1(int u) {\n    visited[u] = true;\n    for (int v : g.get(u)) if (!visited[v]) dfs1(v);\n    order.push(u);                       // 끝난 순서대로 쌓기\n}\nvoid dfs2(int u, int id) {\n    comp[u] = id;\n    for (int v : rg.get(u)) if (comp[v] == 0) dfs2(v, id);\n}\nint scc(int n) {\n    visited = new boolean[n + 1];\n    comp = new int[n + 1];\n    for (int i = 1; i <= n; i++) if (!visited[i]) dfs1(i);\n    int id = 0;\n    while (!order.isEmpty()) {\n        int u = order.pop();\n        if (comp[u] == 0) dfs2(u, ++id);\n    }\n    return id;                           // SCC 개수\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"서로 오갈 수 있는 그룹\", \"최소 몇 개를 넘어뜨려야 모두 넘어지나(도미노)\", 2-SAT 만족 가능성.",
            "SCC로 축약한 DAG에서 진입 차수 0인 SCC 개수가 \"최소 시작점 개수\"의 답이 되는 경우가 많다."
          ],
          warn: [
            "역방향 그래프를 따로 만들어야 한다(코사라주). 메모리가 빠듯하면 타잔을 쓴다.",
            "재귀 깊이가 V까지 갈 수 있다. 큰 입력에서는 스레드 스택 크기를 늘리거나 반복문으로 바꾼다."
          ],
          answer: "강한 연결 요소는 방향 그래프에서 서로 도달 가능한 정점들의 최대 묶음입니다. 코사라주 알고리즘은 원래 그래프 DFS로 종료 순서를 구하고, 간선을 뒤집은 그래프에서 그 역순으로 DFS를 해 한 번에 닿는 정점들을 하나의 SCC로 묶습니다. O(V + E)이고 SCC를 하나로 줄이면 DAG가 되어 위상 정렬을 쓸 수 있습니다.",
          followUps: [
            [
              "2-SAT은 SCC로 어떻게 푸나요?",
              "각 변수 x와 not x를 정점으로 두고 (a 또는 b) 절을 not a → b, not b → a 간선으로 바꿉니다. 어떤 x와 not x가 같은 SCC에 있으면 만족할 수 없고, 아니면 해가 있습니다."
            ]
          ],
          related: ["algo/saikeul-panbyeol", "algo/wisang-jeongryeol", "algo/dfs"]
        }
      ]
    },
    {
      name: "특수 최단 경로",
      compare: {
        cols: ["기준", "BFS", "0-1 BFS", "다중 시작점 BFS", "다익스트라"],
        rows: [
          ["가중치", "모두 같음", "0 또는 1", "모두 같음", "0 이상 아무 값"],
          ["자료구조", "큐", "덱", "큐(시작점 전부 넣음)", "우선순위 큐"],
          ["시간 복잡도", "O(V + E)", "O(V + E)", "O(V + E)", "O(E log V)"],
          ["대표 문제", "미로 최단 거리", "순간이동·벽 부수기", "토마토, 불 번지기", "도로 최단 시간"]
        ]
      },
      concepts: [
        {
          id: "algo/0-1-bfs",
          slug: "0-1-bfs",
          title: "0-1 BFS",
          deep: false,
          def: "간선 가중치가 0 또는 1뿐인 그래프에서 덱(Deque)으로 최단 거리를 O(V + E)에 구하는 기법이다.",
          why: "가중치가 모두 같으면 BFS, 제각각이면 다익스트라를 쓰지만, 0과 1 두 종류뿐이면 우선순위 큐 없이도 거리 순서를 지킬 수 있어 다익스트라의 log를 없앨 수 있다.",
          how: [
            "1) 시작점을 덱에 넣고 거리를 0으로 둔다.",
            "2) 덱 앞에서 정점을 꺼낸다.",
            "3) 가중치 0 간선으로 거리가 줄면 덱 앞에 넣는다(같은 거리 층).",
            "4) 가중치 1 간선으로 거리가 줄면 덱 뒤에 넣는다(다음 거리 층).",
            "덱 안에는 항상 거리 d와 d+1인 정점만 앞뒤로 정렬되어 있으므로, 우선순위 큐처럼 가장 가까운 정점이 먼저 나온다.",
            "- 시간 복잡도: O(V + E).",
            "순간이동은 0초, 걷기는 1초(숨바꼭질 3), 벽 부수기 횟수 최소화(빈 칸 0, 벽 1) 같은 문제가 대표적이다."
          ],
          code: "// 0-1 BFS: 가중치 0은 앞에, 1은 뒤에\nint[] zeroOneBfs(int n, int start, List<List<int[]>> g) {\n    int[] dist = new int[n + 1];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[start] = 0;\n    ArrayDeque<Integer> dq = new ArrayDeque<>();\n    dq.add(start);\n    while (!dq.isEmpty()) {\n        int u = dq.pollFirst();\n        for (int[] e : g.get(u)) {\n            int v = e[0], w = e[1];\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                if (w == 0) dq.addFirst(v); else dq.addLast(v);\n            }\n        }\n    }\n    return dist;\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"순간이동은 0초, 걷기는 1초\", \"벽을 최소 몇 개 부수고 도착\", \"거울 최소 개수\".",
            "가중치가 0, 1 외에 2 이상도 있으면 다익스트라로 돌아간다."
          ],
          warn: ["방문 체크를 넣을 때가 아니라 거리가 줄어들 때마다 갱신해야 한다. 일반 BFS처럼 처음 방문만 인정하면 0 간선으로 더 짧아지는 경우를 놓친다."],
          myth: [["0-1 BFS도 일반 BFS처럼 처음 방문만 기록하면 된다.", "0 간선으로 나중에 더 짧은 거리가 발견될 수 있다. 거리가 줄어들 때마다 갱신하고 다시 넣어야 한다."]],
          answer: "0-1 BFS는 간선 가중치가 0과 1뿐일 때 덱을 써서 가중치 0 간선은 덱 앞에, 1 간선은 덱 뒤에 넣는 최단 경로 기법입니다. 덱 안의 거리가 항상 d와 d+1만 정렬된 상태로 유지되므로 우선순위 큐 없이 다익스트라와 같은 결과를 O(V + E)에 얻습니다.",
          followUps: [
            [
              "다익스트라 대신 0-1 BFS를 쓰면 얼마나 빨라지나요?",
              "우선순위 큐 연산의 log V가 사라져 O(E log V)가 O(V + E)가 됩니다. 정점이 수십만 개인 격자 문제에서 차이가 체감될 정도입니다."
            ]
          ],
          related: ["algo/bfs", "algo/daikseuteura", "algo/arraydeque-hwalyong", "algo/dajung-sijakjeom-bfs"]
        },
        {
          id: "algo/dajung-sijakjeom-bfs",
          slug: "dajung-sijakjeom-bfs",
          title: "다중 시작점 BFS",
          deep: true,
          def: "시작점이 여러 개일 때 모두를 처음부터 큐에 넣고 한 번의 BFS로 각 칸까지 가장 가까운 시작점과의 거리를 구하는 기법이다.",
          why: "시작점마다 BFS를 따로 돌리면 시작점이 K개일 때 O(K × (V + E))가 되어 시간 초과가 난다. 동시에 퍼져 나가는 상황(익는 토마토, 번지는 불)은 한 번의 BFS로 끝낼 수 있다.",
          how: [
            "1) 모든 시작점을 거리 0으로 표시하고 큐에 한꺼번에 넣는다.",
            "2) 평소 BFS처럼 큐에서 꺼내 이웃의 거리를 현재 + 1로 정한다.",
            "3) 큐가 층별로 처리되므로 각 칸에는 가장 가까운 시작점에서 온 거리가 처음으로 기록된다.",
            "가상의 출발점 S를 하나 만들어 모든 시작점과 가중치 0으로 이었다고 생각하면 일반 BFS와 같다.",
            "- 시간 복잡도: O(V + E). 격자라면 O(R × C).",
            "- 두 종류가 동시에 퍼지는 문제(불과 사람이 동시에 움직이는 탈출)는 불 BFS를 먼저 돌려 칸마다 불이 붙는 시각을 구한 뒤, 사람 BFS에서 그보다 먼저 도착할 수 있는 칸만 지나간다."
          ],
          flow: ["시작점 전부 큐에 넣기", "거리 0 표시", "층별로 BFS 확장", "처음 기록된 거리가 최솟값"],
          code: "// 토마토: 익은 토마토(1) 모두에서 동시에 퍼진다. 0=안 익음, -1=빈 칸\nint ripenDays(int[][] box) {\n    int r = box.length, c = box[0].length;\n    int[][] dist = new int[r][c];\n    ArrayDeque<int[]> q = new ArrayDeque<>();\n    for (int i = 0; i < r; i++)\n        for (int j = 0; j < c; j++) {\n            dist[i][j] = -1;\n            if (box[i][j] == 1) { dist[i][j] = 0; q.add(new int[]{i, j}); }\n        }\n    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};\n    while (!q.isEmpty()) {\n        int[] cur = q.poll();\n        for (int d = 0; d < 4; d++) {\n            int nr = cur[0] + dr[d], nc = cur[1] + dc[d];\n            if (nr < 0 || nc < 0 || nr >= r || nc >= c) continue;\n            if (box[nr][nc] != 0 || dist[nr][nc] != -1) continue;\n            dist[nr][nc] = dist[cur[0]][cur[1]] + 1;\n            q.add(new int[]{nr, nc});\n        }\n    }\n    int ans = 0;\n    for (int i = 0; i < r; i++)\n        for (int j = 0; j < c; j++) {\n            if (box[i][j] == 0 && dist[i][j] == -1) return -1;   // 끝내 안 익는 칸\n            ans = Math.max(ans, Math.max(dist[i][j], 0));\n        }\n    return ans;\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"모든 익은 토마토가 동시에\", \"불이 여러 곳에서 번진다\", \"가장 가까운 상점까지 거리를 모든 칸에 대해\".",
            "불과 사람이 동시에 움직이는 탈출 문제는 불 BFS로 칸마다 불이 닿는 시간을 먼저 구한 뒤 사람 BFS를 돌린다."
          ],
          warn: [
            "시작점을 하나씩 넣고 BFS를 반복하는 실수가 가장 흔하다. 반드시 처음에 전부 넣는다.",
            "방문 표시는 큐에 넣을 때 한다. 꺼낼 때 하면 같은 칸이 여러 번 들어가 메모리와 시간이 폭증한다."
          ],
          answer: "다중 시작점 BFS는 시작점이 여러 개일 때 모두를 거리 0으로 큐에 미리 넣고 BFS를 한 번만 돌리는 기법입니다. BFS가 거리 순서로 퍼지기 때문에 각 칸에는 가장 가까운 시작점에서의 거리가 기록되고, 시간은 시작점 수와 상관없이 O(V + E)입니다.",
          analogy: "연못 여러 곳에 동시에 돌을 던지면 물결이 함께 퍼져 나가고, 각 지점에는 가장 가까운 돌에서 온 물결이 먼저 도착하는 것과 같습니다.",
          qa: [
            "시작점이 여러 개인 최단 거리는 어떻게 구하나요?",
            "모든 시작점을 거리 0으로 큐에 한꺼번에 넣고 BFS를 한 번만 돌립니다. BFS는 거리 순서로 퍼지므로 각 칸에는 가장 가까운 시작점에서 온 거리가 처음 기록됩니다. 시작점마다 BFS를 돌리면 O(K(V+E))지만 이렇게 하면 O(V+E)입니다. 가상의 출발점 하나가 모든 시작점과 연결된 그래프로 생각하면 됩니다."
          ],
          followUps: [
            [
              "시작점별 BFS를 따로 돌리면 왜 안 되나요?",
              "시작점이 K개면 O(K(V+E))가 됩니다. 격자 1000×1000에 시작점이 수천 개면 수십억 연산이라 시간 초과가 납니다."
            ],
            [
              "어느 시작점에서 왔는지도 알아야 하면 어떻게 하나요?",
              "거리 배열과 함께 출발점 번호 배열을 두고, 이웃으로 퍼질 때 현재 칸의 출발점 번호를 그대로 물려줍니다. 경계에서 서로 다른 번호가 만나는 지점이 두 영역의 경계입니다."
            ]
          ],
          related: ["algo/bfs", "algo/0-1-bfs", "algo/arraydeque-hwalyong", "algo/munje-yuhyeong-panbyeol-sinho"]
        }
      ]
    },
    {
      name: "트리 질의",
      compare: {
        cols: ["기준", "단순 올라가기", "최소 공통 조상 (LCA)"],
        rows: [
          ["전처리", "O(N)", "O(N log N)"],
          ["질의 하나", "O(N)", "O(log N)"],
          ["메모리", "O(N)", "O(N log N)"],
          ["쓰는 때", "질의가 몇 개뿐", "질의가 수만 개 이상"]
        ]
      },
      concepts: [
        {
          id: "algo/choeso-gongtong-josang-lca",
          slug: "choeso-gongtong-josang-lca",
          title: "최소 공통 조상 (LCA)",
          deep: true,
          def: "루트가 있는 트리에서 두 정점의 공통 조상 중 가장 깊은 정점을 찾는 문제로, 희소 배열(binary lifting)로 질의 하나를 O(log N)에 답한다.",
          why: "트리에서 두 정점 사이 거리, 경로 위 최댓값 같은 질의가 수만 개 들어오면 매번 부모를 하나씩 타고 올라가는 O(N) 방식으로는 시간 초과가 난다.",
          how: [
            "- 단순 방법: 깊이를 맞춘 뒤 두 정점을 동시에 한 칸씩 올린다. 질의당 O(N). 질의가 적을 때만 쓴다.",
            "- 희소 배열: `parent[k][v]` = v의 2^k번째 조상. `parent[k][v] = parent[k-1][ parent[k-1][v] ]`로 O(N log N)에 채운다.",
            "1) BFS나 DFS로 각 정점의 깊이와 바로 위 부모(parent[0])를 구한다.",
            "2) 더 깊은 정점을 깊이 차이의 이진수 비트만큼 점프해 깊이를 맞춘다.",
            "3) 두 정점이 같으면 그 정점이 LCA다.",
            "4) 아니면 큰 k부터 내려오며 parent[k]가 서로 다를 때만 둘 다 점프한다. 끝나면 둘의 바로 위 부모가 LCA다.",
            "- 활용: 두 정점 거리 = depth[u] + depth[v] - 2 × depth[lca]. 가중치 트리면 루트까지 거리 배열로 같은 식을 쓴다.",
            "- 복잡도: 전처리 O(N log N), 질의 O(log N), 메모리 O(N log N)."
          ],
          code: "// 희소 배열 LCA. LOG = 17이면 N ≤ 131072\nstatic final int LOG = 17;\nint[][] up;   // up[k][v] = v의 2^k번째 조상\nint[] depth;\n\nvoid build(int n, List<List<Integer>> tree) {\n    up = new int[LOG][n + 1];\n    depth = new int[n + 1];\n    boolean[] seen = new boolean[n + 1];\n    ArrayDeque<Integer> q = new ArrayDeque<>();\n    q.add(1); seen[1] = true; up[0][1] = 1;            // 루트의 부모는 자기 자신\n    while (!q.isEmpty()) {\n        int u = q.poll();\n        for (int v : tree.get(u)) if (!seen[v]) {\n            seen[v] = true; depth[v] = depth[u] + 1; up[0][v] = u; q.add(v);\n        }\n    }\n    for (int k = 1; k < LOG; k++)\n        for (int v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];\n}\n\nint lca(int a, int b) {\n    if (depth[a] < depth[b]) { int t = a; a = b; b = t; }\n    int diff = depth[a] - depth[b];\n    for (int k = 0; k < LOG; k++) if ((diff >> k & 1) == 1) a = up[k][a];\n    if (a == b) return a;\n    for (int k = LOG - 1; k >= 0; k--)\n        if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }\n    return up[0][a];\n}",
          codeLang: "java",
          use: [
            "문제 신호: \"트리에서 두 정점 사이 거리 질의 M개\", \"경로 위 최대·최소 간선\", \"가장 가까운 공통 상사\".",
            "M이 1만 이상이면 질의마다 O(N)으로 올라가는 단순 방법은 시간 초과다."
          ],
          warn: [
            "LOG는 2^LOG가 N보다 크게 잡는다. 너무 작으면 깊은 정점에서 답이 틀린다.",
            "루트의 부모를 0으로 두면 up 배열이 0번 정점을 가리켜 엉뚱한 값이 나올 수 있다. 루트 자신을 가리키게 한다."
          ],
          answer: "LCA는 트리에서 두 정점의 공통 조상 중 가장 깊은 정점입니다. 각 정점의 2^k번째 조상을 희소 배열로 O(N log N)에 미리 구하고, 질의마다 깊이를 맞춘 뒤 큰 점프부터 조상이 다를 때만 함께 올라가면 O(log N)에 답합니다. 두 정점 사이 거리는 깊이 합에서 LCA 깊이의 두 배를 빼서 구합니다.",
          analogy: "두 사람의 족보를 따라 올라가 처음 만나는 공통 조상을 찾는데, 한 세대씩이 아니라 1, 2, 4, 8세대씩 건너뛰며 찾는 것입니다.",
          qa: [
            "LCA를 빠르게 구하는 방법을 설명해 주세요.",
            "각 정점의 2의 거듭제곱 번째 조상을 미리 저장하는 희소 배열을 O(N log N)에 만듭니다. 질의가 오면 더 깊은 정점을 깊이 차이의 이진 표현대로 점프해 깊이를 맞추고, 큰 점프부터 두 정점의 조상이 다를 때만 함께 올립니다. 마지막에 남은 정점의 부모가 LCA이고 질의 하나에 O(log N)입니다."
          ],
          followUps: [
            [
              "경로 위 간선 최댓값은 어떻게 같이 구하나요?",
              "희소 배열에 조상과 함께 그 구간 간선 최댓값 배열 max[k][v]도 저장합니다. LCA를 구하며 점프할 때마다 지나는 구간의 최댓값을 함께 갱신하면 됩니다."
            ],
            [
              "오일러 투어로도 LCA를 구할 수 있나요?",
              "DFS 방문 순서를 기록한 오일러 투어 배열에서 두 정점 첫 등장 위치 사이 깊이가 가장 작은 정점이 LCA입니다. 구간 최솟값을 희소 테이블로 구하면 질의가 O(1)입니다."
            ]
          ],
          related: ["algo/teuri-dp", "algo/bfs", "algo/biteumaseuking", "algo/segeumeonteu-teuri"]
        }
      ]
    },
    {
      name: "구간 자료구조",
      compare: {
        cols: ["기준", "누적합", "펜윅 트리", "세그먼트 트리", "느리게 갱신되는 세그먼트 트리"],
        rows: [
          ["점 갱신", "O(N)", "O(log N)", "O(log N)", "O(log N)"],
          ["구간 갱신", "O(N)", "차분으로 가능", "O(N log N)", "O(log N)"],
          ["구간 질의", "O(1)", "O(log N) (합처럼 뺄 수 있는 연산)", "O(log N)", "O(log N)"],
          ["메모리", "N", "N", "4N", "8N (lazy 포함)"],
          ["구현 난이도", "매우 쉬움", "쉬움", "보통", "어려움"]
        ]
      },
      concepts: [
        {
          id: "algo/segeumeonteu-teuri",
          slug: "segeumeonteu-teuri",
          title: "세그먼트 트리",
          deep: true,
          def: "배열을 구간으로 반씩 나눈 이진 트리에 각 구간의 합·최솟값 같은 결과를 저장해, 값 변경과 구간 질의를 모두 O(log N)에 처리하는 자료구조다.",
          why: "누적합은 구간 합을 O(1)에 주지만 값이 하나 바뀌면 O(N)을 다시 계산해야 한다. 변경과 질의가 섞여 수만~수십만 번 들어오는 문제에서는 둘 다 빠른 구조가 필요하다.",
          how: [
            "- 구조: 노드 1이 전체 구간 [0, N-1]을 맡고, 노드 i의 자식 2i, 2i+1이 왼쪽 절반과 오른쪽 절반을 맡는다. 배열 크기는 4N이면 충분하다.",
            "- 빌드: 리프에 원소를 넣고 부모는 두 자식 값을 합친다. O(N).",
            "- 점 갱신: 바뀐 원소가 속한 리프에서 루트까지 올라가며 다시 합친다. 경로 길이 O(log N).",
            "- 구간 질의: 노드 구간이 질의 구간에 완전히 들어가면 그 값을 쓰고, 완전히 벗어나면 무시하고, 걸치면 두 자식으로 내려간다. 방문 노드가 O(log N)개다.",
            "합 대신 최솟값, 최댓값, 최대공약수, XOR처럼 결합 법칙이 성립하는 연산이면 무엇이든 넣을 수 있다. 빈 구간의 값(합은 0, 최솟값은 무한대)을 정확히 정해야 한다.",
            "구간 전체에 값을 더하는 갱신까지 필요하면 느리게 갱신되는 세그먼트 트리(lazy propagation)로 확장한다."
          ],
          flow: ["구간을 반씩 나눠 빌드", "갱신: 리프→루트 재계산", "질의: 포함·제외·걸침 판단", "걸친 노드만 자식으로"],
          code: "// 구간 합 세그먼트 트리 (재귀)\nlong[] tree;\nint n;\n\nvoid build(long[] a, int node, int l, int r) {\n    if (l == r) { tree[node] = a[l]; return; }\n    int m = (l + r) / 2;\n    build(a, node * 2, l, m);\n    build(a, node * 2 + 1, m + 1, r);\n    tree[node] = tree[node * 2] + tree[node * 2 + 1];\n}\nvoid update(int node, int l, int r, int idx, long val) {\n    if (l == r) { tree[node] = val; return; }\n    int m = (l + r) / 2;\n    if (idx <= m) update(node * 2, l, m, idx, val);\n    else update(node * 2 + 1, m + 1, r, idx, val);\n    tree[node] = tree[node * 2] + tree[node * 2 + 1];\n}\nlong query(int node, int l, int r, int ql, int qr) {\n    if (qr < l || r < ql) return 0;              // 완전히 벗어남\n    if (ql <= l && r <= qr) return tree[node];   // 완전히 포함\n    int m = (l + r) / 2;\n    return query(node * 2, l, m, ql, qr) + query(node * 2 + 1, m + 1, r, ql, qr);\n}\n// 사용: tree = new long[4 * n]; build(a, 1, 0, n - 1); query(1, 0, n - 1, L, R);",
          codeLang: "java",
          use: [
            "문제 신호: \"N, M ≤ 100,000이고 값 변경과 구간 합(최소/최대) 질의가 섞여 있다\".",
            "좌표 압축과 함께 쓰면 \"자기보다 앞에 있으면서 큰 수의 개수\" 같은 질의를 O(N log N)에 푼다."
          ],
          warn: [
            "배열 크기를 2N으로 잡으면 N이 2의 거듭제곱이 아닐 때 인덱스가 넘친다. 재귀 구현은 4N을 쓴다.",
            "질의 구간 [L, R]이 L > R로 들어오는 입력이 있으면 미리 바꿔 준다.",
            "합이 int를 넘기 쉽다. 값과 트리는 long으로 둔다."
          ],
          myth: [
            [
              "세그먼트 트리 배열은 2N이면 충분하다.",
              "재귀 구현에서 N이 2의 거듭제곱이 아니면 2N을 넘는 인덱스를 쓴다. 안전하게 4N을 잡는다. 2N으로 되는 것은 반복문(bottom-up) 구현이다."
            ]
          ],
          answer: "세그먼트 트리는 배열을 구간으로 반씩 나눈 이진 트리에 구간별 합이나 최솟값을 저장하는 자료구조입니다. 점 갱신은 리프에서 루트까지 다시 계산하고, 구간 질의는 완전히 포함되는 노드 값만 모으므로 둘 다 O(log N)입니다. 값 변경과 구간 질의가 섞여 많이 들어오는 문제에 씁니다.",
          analogy: "반 → 학년 → 전교로 점수 합계를 계층별로 미리 적어 두면, 한 학생 점수가 바뀌어도 그 학생의 반, 학년, 전교 합계만 고치면 되는 것과 같습니다.",
          qa: [
            "세그먼트 트리는 언제 쓰고 시간 복잡도는 어떻게 되나요?",
            "배열의 값 변경과 구간 합·최솟값 질의가 섞여 많이 들어올 때 씁니다. 구간을 반씩 나눈 이진 트리에 구간별 결과를 저장하므로 빌드는 O(N), 점 갱신과 구간 질의는 트리 높이만큼인 O(log N)입니다. 누적합은 질의가 O(1)이지만 갱신이 O(N)이라 변경이 잦으면 세그먼트 트리가 필요합니다."
          ],
          followUps: [
            [
              "누적합과 세그먼트 트리는 어떻게 고르나요?",
              "값이 바뀌지 않으면 누적합으로 질의 O(1)에 충분합니다. 값이 자주 바뀌면 누적합은 갱신이 O(N)이라 세그먼트 트리나 펜윅 트리를 씁니다."
            ],
            ["구간 최솟값의 위치도 알아야 하면?", "노드에 값 대신 (값, 인덱스) 쌍을 저장하고, 합칠 때 값이 작은 쪽(같으면 인덱스가 작은 쪽)을 고르면 됩니다."]
          ],
          related: [
            "algo/penwik-teuri",
            "algo/neurige-gaengsindoeneun-segeumeonteu-teuri",
            "algo/nujeokhap",
            "algo/jwapyo-apchuk"
          ]
        },
        {
          id: "algo/penwik-teuri",
          slug: "penwik-teuri",
          title: "펜윅 트리",
          deep: false,
          def: "인덱스의 가장 낮은 1비트(i & -i)를 이용해 접두사 합을 저장하는 배열로, 점 갱신과 접두사 합 질의를 O(log N)에 처리한다. BIT(Binary Indexed Tree)라고도 한다.",
          how: [
            "- `tree[i]`는 (i - (i & -i), i] 구간의 합을 맡는다. 예: tree[12]는 9~12, tree[8]은 1~8.",
            "- 갱신: i에서 시작해 `i += i & -i`로 그 원소를 포함하는 구간들을 모두 올린다.",
            "- 접두사 합: i에서 시작해 `i -= i & -i`로 내려가며 더한다.",
            "- 구간 합 [l, r] = sum(r) - sum(l - 1).",
            "- 1-based 인덱스를 써야 한다. 0에서는 `i & -i`가 0이라 무한 루프가 된다.",
            "세그먼트 트리보다 코드가 10줄 안팎으로 짧고 메모리가 N + 1이며 상수가 작다. 대신 최솟값처럼 뺄셈으로 되돌릴 수 없는 연산의 임의 구간 질의에는 쓰기 어렵다.",
            "역순 쌍(inversion) 개수 세기는 값을 좌표 압축한 뒤 앞에서부터 보며 자기보다 큰 값의 개수를 펜윅 트리로 세면 O(N log N)이다."
          ],
          code: "// 펜윅 트리 (1-based)\nlong[] bit;\nvoid add(int i, long delta) {\n    for (; i < bit.length; i += i & -i) bit[i] += delta;\n}\nlong sum(int i) {                 // 1..i 합\n    long s = 0;\n    for (; i > 0; i -= i & -i) s += bit[i];\n    return s;\n}\nlong rangeSum(int l, int r) { return sum(r) - sum(l - 1); }\n// 값을 v로 바꾸려면: add(i, v - arr[i]); arr[i] = v;",
          codeLang: "java",
          use: [
            "문제 신호: 구간 합 + 점 갱신만 필요할 때, 역순 쌍(inversion) 개수, 실시간 순위(내 앞에 나보다 큰 값 몇 개).",
            "차분 배열을 펜윅 트리에 올리면 구간 더하기 + 점 질의도 O(log N)에 된다."
          ],
          warn: ["값을 바꾸는 연산이 아니라 더하는 연산이다. 새 값으로 바꾸려면 원래 배열을 따로 들고 차이만큼 더한다."],
          myth: [
            [
              "펜윅 트리로 구간 최솟값도 자유롭게 구할 수 있다.",
              "접두사 합의 차로 구간을 만드는 구조라 뺄셈이 안 되는 최솟값의 임의 구간 질의는 어렵다. 이때는 세그먼트 트리를 쓴다."
            ]
          ],
          answer: "펜윅 트리는 인덱스의 가장 낮은 1비트인 i & -i 크기만큼의 구간 합을 각 칸에 저장하는 배열입니다. 갱신은 i에 i & -i를 더해 가며, 접두사 합은 빼 가며 구하므로 둘 다 O(log N)이고, 구간 합은 두 접두사 합의 차로 구합니다. 세그먼트 트리보다 코드가 짧고 메모리가 N만큼만 듭니다.",
          followUps: [
            [
              "i & -i는 왜 가장 낮은 1비트인가요?",
              "2의 보수에서 -i는 i의 비트를 뒤집고 1을 더한 값이라, 가장 낮은 1비트 아래는 모두 0이 되고 그 비트만 i와 겹칩니다. 그래서 AND하면 그 비트 하나만 남습니다."
            ]
          ],
          related: ["algo/segeumeonteu-teuri", "algo/nujeokhap", "algo/jwapyo-apchuk", "algo/biteumaseuking"]
        },
        {
          id: "algo/neurige-gaengsindoeneun-segeumeonteu-teuri",
          slug: "neurige-gaengsindoeneun-segeumeonteu-teuri",
          title: "느리게 갱신되는 세그먼트 트리",
          deep: false,
          def: "구간 전체에 값을 더하거나 바꾸는 갱신을, 아래 노드에 바로 반영하지 않고 lazy 배열에 미뤄 두었다가 필요할 때 내려보내 O(log N)에 처리하는 세그먼트 트리다.",
          how: [
            "일반 세그먼트 트리로 구간 [L, R]에 값을 더하면 원소마다 점 갱신을 해야 해 O(N log N)이 된다.",
            "1) 갱신 구간이 노드 구간을 완전히 덮으면 그 노드 값만 고치고(합이면 값 × 구간 길이를 더함), 자식에게 줄 몫을 lazy[node]에 적어 두고 멈춘다.",
            "2) 나중에 그 노드의 자식을 방문해야 할 때(갱신이든 질의든) 먼저 lazy를 두 자식에게 내려보낸다(propagate).",
            "3) 나머지는 일반 세그먼트 트리와 같다.",
            "- 시간 복잡도: 구간 갱신과 구간 질의 모두 O(log N).",
            "- 더하기와 바꾸기(대입)가 섞이면 lazy에 두 종류를 함께 저장하고 적용 순서를 정의해야 한다.",
            "구간 더하기 + 점 질의만 필요하면 차분 배열을 펜윅 트리에 올리는 더 간단한 방법이 있다."
          ],
          code: "// 구간 더하기 + 구간 합 (lazy propagation)\nlong[] tree, lazy;\n\nvoid push(int node, int l, int r) {\n    if (lazy[node] == 0) return;\n    int m = (l + r) / 2;\n    apply(node * 2, l, m, lazy[node]);\n    apply(node * 2 + 1, m + 1, r, lazy[node]);\n    lazy[node] = 0;\n}\nvoid apply(int node, int l, int r, long v) {\n    tree[node] += v * (r - l + 1);\n    lazy[node] += v;\n}\nvoid update(int node, int l, int r, int ql, int qr, long v) {\n    if (qr < l || r < ql) return;\n    if (ql <= l && r <= qr) { apply(node, l, r, v); return; }\n    push(node, l, r);\n    int m = (l + r) / 2;\n    update(node * 2, l, m, ql, qr, v);\n    update(node * 2 + 1, m + 1, r, ql, qr, v);\n    tree[node] = tree[node * 2] + tree[node * 2 + 1];\n}\nlong query(int node, int l, int r, int ql, int qr) {\n    if (qr < l || r < ql) return 0;\n    if (ql <= l && r <= qr) return tree[node];\n    push(node, l, r);\n    int m = (l + r) / 2;\n    return query(node * 2, l, m, ql, qr) + query(node * 2 + 1, m + 1, r, ql, qr);\n}",
          codeLang: "sql",
          use: [
            "문제 신호: \"구간 [L, R]의 모든 값에 v를 더한다\"와 \"구간 [L, R]의 합을 구한다\"가 섞여 10만 번 이상.",
            "구간 뒤집기(0↔1 토글), 구간 대입처럼 lazy로 합칠 수 있는 갱신이면 모두 적용 가능하다."
          ],
          warn: [
            "질의에서도 자식으로 내려가기 전에 push를 해야 한다. 갱신에서만 하면 질의 결과가 틀린다.",
            "합 트리에서 lazy 값을 반영할 때 구간 길이를 곱하는 것을 잊기 쉽다."
          ],
          answer: "느리게 갱신되는 세그먼트 트리는 구간 갱신이 노드 구간을 완전히 덮으면 그 노드 값만 고치고 자식에게 줄 몫은 lazy 배열에 적어 둔 뒤, 나중에 그 자식을 방문할 때 내려보내는 방식입니다. 그래서 구간 갱신과 구간 질의가 모두 O(log N)입니다. 일반 세그먼트 트리로 구간 갱신을 하면 원소마다 갱신해 O(N log N)이 됩니다.",
          analogy: "반 전체에 가산점을 줄 때 학생 명부를 다 고치지 않고 반 출석부 표지에 \"+5점\"이라고 메모해 두었다가, 누군가 개별 학생 점수를 볼 때 그제야 반영하는 것과 같습니다.",
          followUps: [
            [
              "lazy 값을 내려보내는 시점은 언제인가요?",
              "그 노드의 자식으로 내려가야 할 때, 즉 갱신이든 질의든 노드 구간이 요청 구간에 걸쳐 있을 때 자식 방문 직전에 내려보냅니다. 완전히 포함되거나 완전히 벗어나는 노드에서는 내려보낼 필요가 없습니다."
            ]
          ],
          related: ["algo/segeumeonteu-teuri", "algo/chabun-baeyeol", "algo/penwik-teuri"]
        }
      ]
    }
  ]
};

export default topic;
