import type { Topic } from '../types';

const topic: Topic = {
  key: "algo-5",
  name: "코딩테스트 실전",
  must: [
    "입력 크기로 허용 복잡도를 먼저 정한다. N ≤ 20이면 2^N, N ≤ 10만이면 O(N log N) 이하다.",
    "입력이 많으면 BufferedReader + StringTokenizer, 출력은 StringBuilder에 모아 한 번에 낸다.",
    "합·곱이 21억을 넘을 수 있으면 long을 쓰고, 비교자는 빼기 대신 `Integer.compare`를 쓴다.",
    "스택과 큐는 ArrayDeque, 정렬된 상태의 이웃 값 조회는 TreeMap, 최솟값 반복 추출은 PriorityQueue다."
  ],
  groups: [
    {
      name: "문제 접근",
      compare: {
        cols: ["기준", "완전 탐색", "시뮬레이션 · 구현", "순열 · 조합 생성"],
        rows: [
          ["핵심", "모든 경우 확인", "규칙을 그대로 구현", "경우를 빠짐없이 나열"],
          ["가능한 입력 크기", "경우의 수 × 확인 비용 ≤ 약 10^8", "보통 작음(격자 50 × 50 등)", "nPr·nCr 개수가 작을 때"],
          ["주로 쓰는 도구", "반복문, 비트마스크, 재귀", "방향 배열, 함수 분리", "재귀, 방문 배열, 시작 인덱스"],
          ["흔한 실수", "경우의 수를 세지 않음", "동시 갱신, 회전·경계 처리", "결과 배열을 복사하지 않음"]
        ]
      },
      concepts: [
        {
          id: "algo/munje-yuhyeong-panbyeol-sinho",
          slug: "munje-yuhyeong-panbyeol-sinho",
          title: "문제 유형 판별 신호",
          deep: true,
          def: "문제 문장과 입력 크기에 들어 있는 단서를 보고 어떤 알고리즘을 쓸지 빠르게 좁히는 방법이다.",
          why: "코딩테스트는 시간이 제한되어 있어 풀이 방향을 늦게 잡으면 구현할 시간이 없다. 자주 나오는 표현과 기법의 짝을 외워 두면 처음 5분 안에 방향을 정할 수 있다.",
          how: [
            "먼저 입력 크기(N)로 허용되는 복잡도를 정하고, 그다음 문장 속 표현으로 기법을 고른다.",
            "- N ≤ 10: 순열 완전 탐색 O(N!)이 가능하다.",
            "- N ≤ 20: 부분집합 완전 탐색 O(2^N)이나 비트마스크 DP가 가능하다.",
            "- N ≤ 500: O(N^3). 플로이드-워셜, 구간 DP.",
            "- N ≤ 5,000: O(N^2) DP나 이중 반복문.",
            "- N ≤ 100,000~1,000,000: O(N log N) 이하. 정렬, 이분 탐색, 힙, 투 포인터, 누적합.",
            "- 값의 범위가 10^9 이상: 값 자체를 기준으로 이분 탐색(파라메트릭 서치)하거나 좌표 압축.",
            "문장 표현과 기법의 대응은 다음과 같다.",
            "- \"최솟값의 최댓값\", \"최대값의 최솟값\", \"조건을 만족하는 최소 X\": 파라메트릭 서치.",
            "- \"연속 부분 배열의 합\", \"구간 합 질의\": 누적합. 원소가 모두 양수면 투 포인터.",
            "- \"길이 K인 연속 구간\": 슬라이딩 윈도우.",
            "- \"가중치 없는 최단 거리\", \"최소 이동 횟수\": BFS. 가중치가 0과 1뿐이면 0-1 BFS.",
            "- \"가중치 있는 최단 거리\"(음수 없음): 다익스트라.",
            "- \"여러 곳에서 동시에 퍼진다\": 다중 시작점 BFS.",
            "- \"모든 경우를 나열\", \"가능한 조합\": 백트래킹.",
            "- \"경우의 수\", \"최대 이익\"에서 같은 부분 문제가 반복: DP. 결과를 1,000,000,007로 나눈 나머지를 요구하면 거의 DP다.",
            "- \"매 순간 가장 좋은 선택\"이 증명되면: 그리디. 보통 정렬과 함께 쓴다.",
            "- \"구간 합/최솟값 + 값 갱신\"이 섞여 있음: 세그먼트 트리나 펜윅 트리.",
            "- \"다음으로 큰 수\", \"오른쪽에서 처음 만나는 더 큰 값\": 모노토닉 스택.",
            "- \"선후 관계\", \"작업 순서\": 위상 정렬.",
            "- \"그룹으로 묶기\", \"같은 집합인가\": 유니온 파인드.",
            "- \"등장 횟수\", \"중복 확인\": 해시맵으로 빈도 세기."
          ],
          flow: ["입력 크기 확인", "허용 복잡도 결정", "문장 표현으로 후보 기법 선택", "작은 예제로 손 검증", "구현"],
          code: "// 풀이 전 체크리스트를 주석으로 적고 시작한다\n// 1) N 최대 = 100,000 → O(N log N) 이하\n// 2) 값 범위 = 10^9 → 합은 long\n// 3) 표현: \"최소 비용으로 K개 이상\" → 파라메트릭 서치 후보\n// 4) 판정 함수 check(mid)가 단조(mid가 커지면 계속 true)인지 확인\nlong lo = 0, hi = 2_000_000_000L;\nwhile (lo < hi) {\n    long mid = (lo + hi) / 2;\n    if (check(mid)) hi = mid;   // 조건 만족 → 더 작은 값도 되는지 본다\n    else lo = mid + 1;\n}\nSystem.out.println(lo);",
          codeLang: "java",
          use: [
            "풀이를 시작하기 전에 N 범위, 값 범위, 후보 기법을 주석 세 줄로 적어 두면 방향을 잃었을 때 돌아갈 기준이 된다.",
            "틀린 문제를 복습할 때 \"어떤 표현을 보고 이 기법을 떠올려야 했는가\"를 정리해 두면 신호 목록이 쌓인다."
          ],
          warn: [
            "신호는 후보를 좁힐 뿐 정답을 보장하지 않는다. 그리디는 반례를 하나 떠올려 보고, 안 되면 DP로 바꾼다.",
            "입력 크기를 확인하지 않고 익숙한 풀이부터 짜면 시간 초과로 처음부터 다시 쓰게 된다."
          ],
          myth: [["어려운 문제일수록 복잡한 알고리즘이 필요하다.", "대부분은 정렬, 이분 탐색, BFS, DP 같은 기본 기법의 조합이다. 신호를 놓쳐서 어렵게 느껴지는 경우가 많다."]],
          answer: "문제 유형은 입력 크기와 문장 표현으로 판별합니다. 입력 크기로 허용 복잡도를 정하고, \"최솟값의 최댓값\"이면 파라메트릭 서치, \"연속 부분합\"이면 누적합이나 투 포인터, \"가중치 없는 최단 거리\"면 BFS, 경우의 수에 나머지 연산이 붙으면 DP처럼 표현과 기법을 짝지어 후보를 좁힙니다.",
          analogy: "의사가 증상을 보고 검사 항목을 고르는 것과 같습니다. 열과 기침이면 폐렴 검사부터 하듯, 표현을 보고 맞을 가능성이 높은 기법부터 시도합니다.",
          qa: [
            "처음 보는 문제를 어떻게 접근하나요?",
            "먼저 입력 크기로 허용 가능한 시간 복잡도를 정합니다. N이 10만이면 O(N log N) 이하여야 하므로 정렬, 이분 탐색, 투 포인터, 힙 같은 후보로 좁힙니다. 그다음 \"최솟값의 최댓값\"이면 파라메트릭 서치, \"가중치 없는 최단 거리\"면 BFS처럼 문장의 표현으로 기법을 고르고, 작은 예제로 손으로 검증한 뒤 구현합니다."
          ],
          followUps: [
            [
              "그리디로 풀어도 되는지 어떻게 확인하나요?",
              "작은 반례를 직접 만들어 봅니다. 동전 문제처럼 그리디 선택이 최적을 놓치는 경우가 하나라도 있으면 DP로 바꿉니다. 정렬 기준을 바꿔 가며 교환 논증(두 원소의 순서를 바꾸면 손해인지)으로 정당성을 확인할 수도 있습니다."
            ],
            [
              "N이 10만인데 O(N^2) 풀이밖에 떠오르지 않으면?",
              "이중 반복문의 안쪽이 무엇을 반복 계산하는지 봅니다. 구간 합이면 누적합, 범위 안의 값 찾기면 정렬 후 이분 탐색, 양 끝이 한 방향으로만 움직이면 투 포인터, 최솟값 반복 추출이면 힙으로 안쪽을 O(1)이나 O(log N)으로 줄입니다."
            ]
          ],
          related: [
            "algo/ipryeok-keugiro-algorijeum-goreugi",
            "algo/parameteurik-seochi",
            "algo/nujeokhap",
            "algo/bfs",
            "algo/wanjeon-tamsaek"
          ]
        },
        {
          id: "algo/wanjeon-tamsaek",
          slug: "wanjeon-tamsaek",
          title: "완전 탐색",
          deep: true,
          def: "가능한 모든 경우를 하나도 빠짐없이 확인해 답을 찾는 방법으로, 브루트 포스라고도 한다.",
          why: "정답을 확실히 찾는 가장 단순한 방법이고, 입력이 작으면 그대로 정답 풀이가 된다. 입력이 클 때도 작은 입력용 완전 탐색을 만들어 최적화한 풀이의 정답을 검증할 수 있다.",
          how: [
            "1) 경우의 수를 센다. 1억(10^8) 번 안쪽이면 대체로 1초 안에 끝난다.",
            "2) 탐색 방식을 고른다.",
            "- 반복문: 경우가 고정된 개수의 선택이면 중첩 for 문으로 충분하다.",
            "- 순열: 순서가 중요하면 N! 가지. N ≤ 10 정도까지.",
            "- 부분집합: 고를지 말지 두 가지 선택이면 2^N 가지. N ≤ 20 정도까지. 비트마스크로 나열하면 간단하다.",
            "- 재귀(백트래킹): 조건에 맞지 않는 가지를 일찍 잘라 내면 실제 탐색량이 크게 줄어든다.",
            "- BFS/DFS: 상태를 정점으로 보고 상태 공간을 탐색한다.",
            "3) 각 경우마다 조건을 확인하고 최댓값·최솟값·개수를 갱신한다.",
            "경우의 수를 세 보면 완전 탐색이 되는지, 다른 기법이 필요한지 바로 판단할 수 있다."
          ],
          code: "// 부분집합 완전 탐색: N ≤ 20일 때 합이 S인 부분집합 개수\nint count = 0;\nfor (int mask = 1; mask < (1 << n); mask++) {\n    long sum = 0;\n    for (int i = 0; i < n; i++) {\n        if ((mask & (1 << i)) != 0) sum += arr[i];\n    }\n    if (sum == s) count++;\n}\nSystem.out.println(count);",
          codeLang: "java",
          use: [
            "최적화한 풀이가 의심스러울 때 작은 입력용 완전 탐색과 결과를 비교하는 스트레스 테스트로 반례를 찾는다.",
            "N이 작은 부분 점수(서브태스크)를 완전 탐색으로 먼저 확보한다."
          ],
          warn: [
            "경우의 수를 세지 않고 짜면 N이 조금만 커져도 시간 초과가 난다. 2^25나 12!은 이미 3천만~5억 단위다.",
            "재귀 완전 탐색은 깊이가 깊으면 StackOverflowError가 날 수 있다."
          ],
          myth: [["완전 탐색은 하수의 풀이다.", "입력이 작으면 가장 빠르고 확실한 정답이다. 문제 출제자가 의도적으로 N을 작게 준 경우가 많다."]],
          answer: "완전 탐색은 가능한 모든 경우를 확인하는 방법으로, 경우의 수와 확인 비용의 곱이 약 1억 이하이면 그대로 정답 풀이가 됩니다. 반복문, 순열·조합, 비트마스크, 백트래킹으로 경우를 나열하고, 입력이 크면 가지치기나 DP로 바꾸는 출발점으로 씁니다.",
          analogy: "자물쇠 비밀번호를 0000부터 9999까지 모두 돌려 보는 것과 같습니다. 1만 가지면 금방이지만 자릿수가 늘면 순식간에 불가능해집니다.",
          qa: [
            "완전 탐색이 가능한지 어떻게 판단하나요?",
            "전체 경우의 수와 경우 하나를 확인하는 비용을 곱해 대략 1억 번 이하인지 봅니다. 예를 들어 N이 20이고 부분집합마다 O(N)으로 확인하면 2^20 × 20, 약 2천만 번이라 충분합니다. 이 값을 넘으면 백트래킹으로 가지를 자르거나, 중복되는 부분 문제를 DP로 바꾸는 등 다른 방법을 찾습니다."
          ],
          followUps: [
            [
              "백트래킹과 완전 탐색은 무엇이 다른가요?",
              "백트래킹도 완전 탐색의 한 방식이지만, 진행 중에 조건을 만족할 수 없는 가지를 발견하면 더 내려가지 않고 되돌아갑니다. 최악 복잡도는 같아도 실제 탐색량이 크게 줄어듭니다."
            ],
            [
              "완전 탐색 다음 단계로 무엇을 생각하나요?",
              "같은 부분 문제를 반복 계산하는지 봅니다. 반복된다면 메모이제이션이나 DP로 바꾸고, 답의 범위가 단조라면 이분 탐색으로 탐색 공간을 줄입니다."
            ]
          ],
          related: [
            "algo/sunyeol-johap-saengseong",
            "algo/baekteuraeking",
            "algo/biteumaseuking",
            "algo/ipryeok-keugiro-algorijeum-goreugi"
          ]
        },
        {
          id: "algo/simyulreisyeon-guhyeon",
          slug: "simyulreisyeon-guhyeon",
          title: "시뮬레이션 · 구현",
          deep: false,
          def: "문제에서 설명한 규칙을 그대로 코드로 옮겨 단계별로 상태를 바꿔 가는 유형이다.",
          how: [
            "특별한 알고리즘보다 정확하고 실수 없이 구현하는 능력을 본다. 격자 이동, 회전, 게임 규칙 문제가 대표적이다.",
            "- 방향 배열: 상하좌우 이동을 `dx`, `dy` 배열로 두면 if 문 네 개가 반복문 하나로 줄어든다.",
            "- 범위 검사 함수: `inRange(x, y)`를 따로 만들어 경계 검사 실수를 줄인다.",
            "- 상태 분리: 한 턴에 여러 칸이 동시에 바뀌면 새 배열에 결과를 쓰고 마지막에 교체한다. 같은 배열을 바로 고치면 앞에서 바뀐 값이 뒤 계산에 섞인다.",
            "- 2차원 배열 회전: 시계 방향 90도는 `new[j][n - 1 - i] = old[i][j]`다.",
            "- 함수 분리: 이동, 충돌 처리, 점수 계산을 각각 함수로 나누면 디버깅이 쉽다."
          ],
          code: "int[] dx = {-1, 0, 1, 0}; // 상, 우, 하, 좌 (시계 방향)\nint[] dy = {0, 1, 0, -1};\n\nint dir = 0, x = 0, y = 0;\nfor (char cmd : commands) {\n    if (cmd == 'R') dir = (dir + 1) % 4;        // 오른쪽으로 회전\n    else if (cmd == 'L') dir = (dir + 3) % 4;   // 왼쪽 회전: -1 대신 +3\n    else {\n        int nx = x + dx[dir], ny = y + dy[dir];\n        if (inRange(nx, ny) && map[nx][ny] != WALL) { x = nx; y = ny; }\n    }\n}\n\nboolean inRange(int x, int y) { return 0 <= x && x < n && 0 <= y && y < m; }",
          codeLang: "java",
          use: [
            "로봇 청소기, 뱀 게임, 톱니바퀴 회전처럼 삼성 SW 역량 테스트에서 자주 나온다.",
            "구현 전에 상태(위치, 방향, 격자)와 한 턴의 처리 순서를 번호로 적어 두고 그 순서대로 함수를 만든다."
          ],
          warn: [
            "`(dir - 1) % 4`는 자바에서 음수가 될 수 있다. `(dir + 3) % 4`처럼 양수로 만든다.",
            "행(x)과 열(y), 가로(W)와 세로(H)를 문제마다 다르게 부르므로 처음에 기준을 정하고 주석으로 적는다."
          ],
          answer: "시뮬레이션은 문제의 규칙을 그대로 코드로 옮겨 상태를 단계별로 바꾸는 유형입니다. 방향 배열과 범위 검사 함수로 반복 코드를 줄이고, 동시에 바뀌는 상태는 새 배열에 쓴 뒤 교체하며, 기능별로 함수를 나눠 실수를 줄이는 것이 핵심입니다.",
          followUps: [
            [
              "격자의 모든 칸이 동시에 바뀌는 규칙은 어떻게 구현하나요?",
              "현재 격자를 읽어 다음 상태를 새 배열에 쓰고, 한 턴이 끝나면 배열을 교체합니다. 같은 배열을 바로 고치면 앞에서 바뀐 칸이 뒤 칸 계산에 영향을 줍니다."
            ],
            ["디버깅은 어떻게 하나요?", "턴마다 격자를 출력하는 함수를 만들어 예제의 중간 상태와 비교합니다. 함수가 작게 나뉘어 있으면 어느 단계에서 어긋났는지 바로 보입니다."]
          ],
          related: ["algo/wanjeon-tamsaek", "algo/gyeonggyegap-yeoe-keiseu", "algo/bfs"]
        },
        {
          id: "algo/sunyeol-johap-saengseong",
          slug: "sunyeol-johap-saengseong",
          title: "순열 · 조합 생성",
          deep: false,
          def: "원소들 중 일부 또는 전부를 골라 순서를 고려한 배열(순열)이나 순서 없는 묶음(조합)을 빠짐없이 나열하는 방법이다.",
          how: [
            "자바에는 파이썬의 itertools 같은 표준 도구가 없어 재귀로 직접 만든다.",
            "- 순열 nPr: 방문 배열로 이미 쓴 원소를 건너뛰며 깊이 r까지 고른다. 개수는 n!/(n-r)!.",
            "- 조합 nCr: 시작 인덱스를 넘겨 앞에서 고른 원소보다 뒤만 고르게 하면 중복 없이 나열된다. 개수는 n!/(r!(n-r)!).",
            "- 중복 순열: 방문 배열 없이 매번 전체에서 고른다. n^r.",
            "- 중복 조합: 다음 시작 인덱스를 i+1이 아니라 i로 넘긴다.",
            "- 다음 순열(next permutation): 사전순 다음 순열을 반복으로 구한다. 재귀 없이 순열을 나열하고, 같은 값이 섞여 있어도 중복 없이 나열된다.",
            "부분집합(모든 크기의 조합)은 비트마스크 반복문이 더 간단하다."
          ],
          flow: ["깊이가 r이면 결과 처리", "후보 원소 순회", "선택 표시", "다음 깊이 재귀", "선택 해제"],
          code: "// 조합 nCr: start 이후만 골라 중복을 막는다\nint[] picked = new int[r];\nvoid comb(int depth, int start) {\n    if (depth == r) { process(picked); return; }\n    for (int i = start; i < n; i++) {\n        picked[depth] = arr[i];\n        comb(depth + 1, i + 1);   // 중복 조합이면 i\n    }\n}\n\n// 순열 nPr: 방문 배열로 이미 쓴 원소를 건너뛴다\nboolean[] used = new boolean[n];\nvoid perm(int depth) {\n    if (depth == r) { process(picked); return; }\n    for (int i = 0; i < n; i++) {\n        if (used[i]) continue;\n        used[i] = true;\n        picked[depth] = arr[i];\n        perm(depth + 1);\n        used[i] = false;          // 되돌리기\n    }\n}",
          codeLang: "java",
          use: ["팀 나누기, 치킨집 M개 고르기처럼 \"N개 중 M개 선택\" 문제에 조합을 쓴다.", "연산자 끼워 넣기처럼 순서가 의미 있는 배치에는 순열이나 중복 순열을 쓴다."],
          warn: [
            "결과를 리스트에 저장할 때 `picked` 배열을 그대로 넣으면 모두 같은 배열을 가리킨다. `picked.clone()`으로 복사한다.",
            "10! = 362만, 11! = 약 4천만이다. 순열 완전 탐색은 N이 10 근처가 한계다."
          ],
          answer: "순열은 방문 배열로 이미 고른 원소를 건너뛰며 재귀로 만들고, 조합은 시작 인덱스를 넘겨 앞에서 고른 원소 뒤에서만 고르게 해 중복을 막습니다. 개수가 n!이나 nCr로 빠르게 늘어나므로 순열은 N이 10 정도, 부분집합은 20 정도가 한계입니다.",
          followUps: [
            [
              "같은 값이 여러 개 있는 순열에서 중복 결과를 없애려면?",
              "입력을 정렬한 뒤, 같은 깊이에서 직전에 쓴 값과 같은 값은 건너뜁니다. 또는 다음 순열(next permutation) 알고리즘을 쓰면 중복 없이 사전순으로 나열됩니다."
            ],
            ["조합 개수가 너무 많으면 어떻게 하나요?", "조합 자체를 나열하지 말고 개수만 필요하면 파스칼의 삼각형 DP나 팩토리얼 역원으로 nCr을 계산합니다."]
          ],
          related: ["algo/wanjeon-tamsaek", "algo/baekteuraeking", "algo/biteumaseuking"]
        }
      ]
    },
    {
      name: "자바 도구",
      compare: {
        cols: ["기준", "PriorityQueue 활용", "ArrayDeque 활용", "TreeMap · TreeSet 활용"],
        rows: [
          ["내부 구조", "이진 힙(배열)", "원형 배열", "레드블랙 트리"],
          ["꺼내는 원소", "우선순위가 가장 높은 것", "앞 또는 뒤", "정렬 순서상 아무 위치"],
          ["주요 연산 비용", "넣기·꺼내기 O(log N)", "양쪽 넣기·꺼내기 O(1)", "삽입·삭제·이웃 조회 O(log N)"],
          ["대표 사용처", "다익스트라, 스케줄링", "BFS, 스택, 0-1 BFS", "가장 가까운 값, 멀티셋"]
        ]
      },
      concepts: [
        {
          id: "algo/ppareun-ipchulryeok",
          slug: "ppareun-ipchulryeok",
          title: "빠른 입출력",
          deep: true,
          def: "`Scanner`와 `System.out.println` 대신 버퍼를 쓰는 `BufferedReader`, `StringTokenizer`, `StringBuilder`로 입출력 시간을 줄이는 방법이다.",
          why: "입력이 수십만 줄이면 알고리즘이 맞아도 입출력만으로 시간 초과가 난다. `Scanner`는 정규식으로 토큰을 나눠 느리고, `println`을 반복하면 매번 출력 스트림을 비워 느리다.",
          how: [
            "- BufferedReader: 큰 버퍼에 한꺼번에 읽어 두고 `readLine()`으로 한 줄씩 꺼낸다. Scanner보다 수 배 빠르다.",
            "- StringTokenizer: 한 줄을 공백 기준으로 나눈다. `split(\" \")`보다 빠르고 배열을 만들지 않는다.",
            "- StringBuilder: 출력할 내용을 모아 두었다가 마지막에 한 번만 출력한다.",
            "- BufferedWriter: 출력이 매우 많으면 `write` 후 마지막에 `flush`한다.",
            "- 숫자 변환: `Integer.parseInt`, `Long.parseLong`. 입력 값 범위가 int를 넘는지 먼저 확인한다.",
            "입력 크기가 10만 줄을 넘으면 처음부터 이 템플릿을 쓴다."
          ],
          code: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        int q = Integer.parseInt(st.nextToken());\n\n        long[] arr = new long[n];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) arr[i] = Long.parseLong(st.nextToken());\n\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < q; i++) {\n            // ... 질의 처리\n            sb.append(answer).append('\\n');\n        }\n        System.out.print(sb);   // 한 번만 출력한다\n    }\n}",
          codeLang: "java",
          use: [
            "백준처럼 표준 입출력을 쓰는 사이트에서는 처음부터 입출력 템플릿을 붙여 놓고 시작한다.",
            "출력 줄이 수십만 개인 질의 문제는 StringBuilder 하나로 모아 마지막에 출력한다."
          ],
          warn: [
            "한 줄에 숫자가 몇 개인지 정해지지 않았거나 여러 줄에 걸쳐 오면 `st.hasMoreTokens()`가 false일 때 다음 줄을 읽는다.",
            "`System.out.println`을 반복문 안에서 수십만 번 부르면 출력만으로 시간 초과가 날 수 있다.",
            "프로그래머스처럼 함수만 구현하는 환경에서는 입출력 최적화가 필요 없다."
          ],
          myth: [
            [
              "BufferedReader는 숫자를 읽을 수 없어 불편하다.",
              "`StringTokenizer`로 나누고 `Integer.parseInt`로 바꾸면 된다. 템플릿으로 만들어 두면 Scanner와 사용 난도가 같다."
            ]
          ],
          answer: "대량 입출력에서는 BufferedReader와 StringTokenizer로 입력을 읽고, 출력은 StringBuilder에 모아 한 번에 냅니다. Scanner는 정규식 해석 때문에 느리고 println 반복은 출력 비용이 커서, 입력이 10만 줄을 넘으면 알고리즘이 맞아도 시간 초과가 날 수 있습니다.",
          analogy: "마트에서 물건을 하나씩 계산대에 가져가는 대신 카트에 모아 한 번에 계산하는 것과 같습니다.",
          qa: [
            "Scanner 대신 BufferedReader를 쓰는 이유는?",
            "Scanner는 입력을 읽을 때마다 정규식으로 토큰을 해석하고 버퍼도 작아 대량 입력에서 느립니다. BufferedReader는 큰 버퍼로 한꺼번에 읽고 줄 단위로 문자열을 돌려주며, StringTokenizer로 공백을 나누면 훨씬 빠릅니다. 출력도 StringBuilder에 모아 한 번에 내보내면 입출력 때문에 시간 초과가 나는 일을 막을 수 있습니다."
          ],
          followUps: [
            [
              "split과 StringTokenizer는 무엇이 다른가요?",
              "split은 정규식으로 나누고 결과 배열을 만들어 상대적으로 느립니다. StringTokenizer는 구분자 문자만 보고 필요할 때마다 토큰을 꺼내 더 빠릅니다. 입력이 크지 않으면 차이가 거의 없습니다."
            ]
          ],
          related: ["algo/sigan-chogwa-dibeoging", "algo/jaba-yeonsan-sokdo-gamgak"]
        },
        {
          id: "algo/priorityqueue-hwalyong",
          slug: "priorityqueue-hwalyong",
          title: "PriorityQueue 활용",
          deep: false,
          def: "자바의 힙 기반 우선순위 큐로, 넣은 순서와 상관없이 우선순위가 가장 높은 원소를 O(log N)에 꺼낸다.",
          how: [
            "- 기본은 최소 힙이다. `poll()`이 가장 작은 값을 꺼낸다.",
            "- 최대 힙: `new PriorityQueue<>(Collections.reverseOrder())`.",
            "- 객체·배열: Comparator로 기준을 정한다. `(a, b) -> Integer.compare(a[1], b[1])`.",
            "- 연산 비용: `offer`, `poll` O(log N), `peek` O(1). `remove(Object)`와 `contains`는 O(N)이다.",
            "- 쓰임: 다익스트라, K번째로 작은 값, 회의실 배정, 작업 스케줄링, 두 힙으로 중앙값 유지.",
            "- 갱신이 필요하면 값을 바꾸지 말고 새 원소를 넣는다. 꺼낼 때 이미 처리했거나 오래된 값이면 건너뛴다(lazy deletion)."
          ],
          code: "// [정점, 거리]를 거리 오름차순으로\nPriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));\npq.offer(new int[]{start, 0});\nwhile (!pq.isEmpty()) {\n    int[] cur = pq.poll();\n    if (cur[1] > dist[cur[0]]) continue;   // 오래된 항목은 건너뛴다\n    // ...\n}\n\n// 잘못된 비교: 값이 크면 빼기에서 오버플로가 나 순서가 뒤집힌다\n// (a, b) -> a[1] - b[1]",
          codeLang: "java",
          use: [
            "다익스트라에서 [정점, 거리]를 거리 순으로 꺼낸다.",
            "최대 힙과 최소 힙 두 개로 실시간 중앙값을 유지한다.",
            "크기 K인 최소 힙으로 상위 K개를 O(N log K)에 구한다."
          ],
          warn: [
            "`a - b` 비교자는 값이 음수와 큰 양수로 섞이면 int 오버플로로 부호가 뒤집힌다. `Integer.compare`나 `Long.compare`를 쓴다.",
            "큐에 넣은 객체의 비교 필드를 나중에 바꾸면 힙 순서가 깨진다. 바꿀 값이면 새 객체를 넣는다.",
            "for-each로 순회하면 정렬 순서가 아니다. 순서대로 보려면 `poll`로 꺼내야 한다."
          ],
          myth: [["PriorityQueue를 for-each로 돌리면 정렬 순서로 나온다.", "내부 배열 순서(힙 순서)로 나온다. 정렬 순서는 poll로 꺼낼 때만 보장된다."]],
          answer: "PriorityQueue는 힙 기반으로 가장 우선순위가 높은 원소를 O(log N)에 꺼내는 자료구조이고, 기본은 최소 힙입니다. 비교자는 오버플로를 피하려고 빼기 대신 Integer.compare를 쓰고, 값을 갱신할 때는 새 원소를 넣고 꺼낼 때 오래된 항목을 건너뜁니다.",
          followUps: [
            [
              "큐 안의 원소 우선순위를 바꿔야 하면 어떻게 하나요?",
              "remove(obj)는 O(N)이라 느립니다. 바뀐 값으로 새 원소를 넣고, 꺼냈을 때 이미 처리됐거나 최신 값이 아니면 무시하는 지연 삭제를 씁니다."
            ]
          ],
          related: [
            "algo/daikseuteura",
            "algo/comparator-jeongryeol",
            "algo/jeongsu-obeopeulro",
            "algo/geuridi-algorijeum"
          ]
        },
        {
          id: "algo/arraydeque-hwalyong",
          slug: "arraydeque-hwalyong",
          title: "ArrayDeque 활용",
          deep: false,
          def: "배열 기반 원형 버퍼로 구현된 덱으로, 자바에서 스택과 큐를 모두 대신하는 기본 자료구조다.",
          how: [
            "- 큐로 쓰기: `offer`(뒤에 넣기), `poll`(앞에서 꺼내기). BFS의 기본 큐다.",
            "- 스택으로 쓰기: `push`, `pop`, `peek`. 모두 앞쪽에서 동작한다.",
            "- 덱으로 쓰기: `offerFirst`, `offerLast`, `pollFirst`, `pollLast`. 0-1 BFS, 슬라이딩 윈도우 최댓값에 쓴다.",
            "- Stack보다 빠르다: `Stack`은 `Vector`를 상속해 모든 메서드가 synchronized다.",
            "- LinkedList보다 빠르다: 노드 객체를 만들지 않아 메모리 할당과 캐시 미스가 적다.",
            "- null을 넣을 수 없다. 빈 덱에서 `poll`은 null, `pop`·`remove`는 예외를 던진다."
          ],
          code: "// BFS 큐\nArrayDeque<int[]> q = new ArrayDeque<>();\nq.offer(new int[]{sx, sy});\n\n// 스택: 괄호 검사\nArrayDeque<Character> stack = new ArrayDeque<>();\nfor (char c : s.toCharArray()) {\n    if (c == '(') stack.push(c);\n    else if (stack.isEmpty()) return false;\n    else stack.pop();\n}\nreturn stack.isEmpty();\n\n// 0-1 BFS: 비용 0이면 앞에, 1이면 뒤에\nif (w == 0) dq.offerFirst(next); else dq.offerLast(next);",
          codeLang: "java",
          use: ["BFS의 큐, DFS·괄호 검사의 스택, 0-1 BFS와 슬라이딩 윈도우 최댓값의 덱으로 쓴다."],
          warn: [
            "`push`는 앞에 넣고 `offer`는 뒤에 넣는다. 한 덱에서 섞어 쓰면 순서가 꼬인다.",
            "빈 덱에서 `pop()`은 `NoSuchElementException`을 던진다. 꺼내기 전에 `isEmpty()`를 확인한다."
          ],
          myth: [["스택은 Stack 클래스로 만들어야 한다.", "자바 공식 문서도 Stack 대신 Deque 구현체(ArrayDeque) 사용을 권장한다."]],
          answer: "ArrayDeque는 원형 배열 기반 덱으로, 자바에서 스택과 큐를 모두 대신하는 기본 선택입니다. Stack은 동기화 비용이 있고 LinkedList는 노드 할당과 캐시 미스가 많아 둘 다 ArrayDeque보다 느립니다.",
          followUps: [
            [
              "ArrayDeque에 null을 넣을 수 없는 이유는?",
              "poll과 peek이 빈 덱일 때 null을 돌려주는데, null 원소를 허용하면 \"비어 있음\"과 \"null 원소\"를 구분할 수 없기 때문입니다."
            ]
          ],
          related: ["algo/bfs", "algo/0-1-bfs", "algo/monotonik-seutaek", "algo/seulraiding-windou"]
        },
        {
          id: "algo/treemap-treeset-hwalyong",
          slug: "treemap-treeset-hwalyong",
          title: "TreeMap · TreeSet 활용",
          deep: false,
          def: "레드블랙 트리로 키를 정렬된 상태로 유지하는 맵과 셋으로, 삽입·삭제·검색과 함께 \"가장 가까운 키\" 조회를 O(log N)에 한다.",
          how: [
            "HashMap은 순서가 없지만 TreeMap은 키가 항상 정렬되어 있어, 값이 계속 추가·삭제되는 상황에서 이웃 값을 찾을 때 쓴다.",
            "- `floorKey(x)`: x 이하 중 가장 큰 키. 없으면 null.",
            "- `ceilingKey(x)`: x 이상 중 가장 작은 키.",
            "- `lowerKey(x)`, `higherKey(x)`: x 미만·초과.",
            "- `firstKey()`, `lastKey()`, `pollFirstEntry()`: 최솟값·최댓값 조회와 제거.",
            "- `headMap`, `tailMap`, `subMap`: 범위 조회.",
            "- 중복 값을 다루려면 TreeMap<값, 개수>로 멀티셋을 만든다.",
            "정렬된 배열 + 이분 탐색은 값이 바뀌지 않을 때, TreeMap은 값이 계속 바뀔 때 쓴다."
          ],
          code: "// 멀티셋: 최솟값·최댓값을 넣고 빼는 이중 우선순위 큐\nTreeMap<Integer, Integer> ms = new TreeMap<>();\nvoid add(int x) { ms.merge(x, 1, Integer::sum); }\nvoid remove(int x) {\n    if (ms.merge(x, -1, Integer::sum) == 0) ms.remove(x);\n}\nint min = ms.firstKey(), max = ms.lastKey();\n\n// 가장 가까운 값\nInteger lo = ms.floorKey(target);     // target 이하 최대 (없으면 null)\nInteger hi = ms.ceilingKey(target);   // target 이상 최소",
          codeLang: "java",
          use: ["이중 우선순위 큐 문제를 TreeMap<값, 개수> 멀티셋으로 푼다.", "좌석·구간 배정에서 요청 위치와 가장 가까운 빈 자리를 floor/ceiling으로 찾는다."],
          warn: [
            "`floorKey` 결과를 바로 `int`에 넣으면 null일 때 NullPointerException이 난다. `Integer`로 받고 null을 확인한다.",
            "HashMap보다 상수 배가 크다. 순서가 필요 없으면 HashMap을 쓴다."
          ],
          answer: "TreeMap과 TreeSet은 키를 정렬된 상태로 유지해 삽입, 삭제, 검색과 floorKey·ceilingKey 같은 이웃 조회를 O(log N)에 합니다. 값이 계속 추가·삭제되면서 가장 가까운 값이나 최솟값·최댓값을 함께 다뤄야 할 때 씁니다.",
          followUps: [
            [
              "정렬된 배열 + 이분 탐색 대신 TreeMap을 쓰는 때는?",
              "값이 바뀌지 않으면 정렬된 배열이 더 빠르고 메모리도 적습니다. 중간에 삽입·삭제가 계속 일어나면 배열은 O(N)이 들기 때문에 TreeMap을 씁니다."
            ]
          ],
          related: ["algo/lower-bound-upper-bound", "algo/priorityqueue-hwalyong", "algo/haesiro-bindo-segi"]
        },
        {
          id: "algo/comparator-jeongryeol",
          slug: "comparator-jeongryeol",
          title: "Comparator 정렬",
          deep: false,
          def: "`Arrays.sort`와 `Collections.sort`에 비교 규칙을 넘겨 여러 기준으로 정렬하는 방법이다.",
          how: [
            "- 여러 기준: `Comparator.comparingInt(...).thenComparing(...)`으로 1차, 2차 기준을 이어 붙인다.",
            "- 내림차순: `.reversed()` 또는 비교 순서를 바꾼 `Integer.compare(b, a)`.",
            "- 기본형 배열(`int[]`): `Arrays.sort`는 듀얼 피벗 퀵 정렬이라 Comparator를 받지 않는다. 내림차순이 필요하면 오름차순 정렬 후 뒤집거나 `Integer[]`로 바꾼다.",
            "- 객체 배열·리스트: TimSort라 안정 정렬이다. 같은 키끼리는 입력 순서가 유지된다.",
            "- 2차원 배열: `Arrays.sort(arr, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]))`.",
            "- 문자열: 기본은 사전순. 길이 우선이면 `comparingInt(String::length).thenComparing(Comparator.naturalOrder())`."
          ],
          code: "// 점수 내림차순, 같으면 이름 오름차순\nlist.sort(Comparator.comparingInt(Student::score).reversed()\n        .thenComparing(Student::name));\n\n// 회의실 배정: 끝나는 시간, 같으면 시작 시간 오름차순\nArrays.sort(meetings, (a, b) -> a[1] != b[1]\n        ? Integer.compare(a[1], b[1])\n        : Integer.compare(a[0], b[0]));",
          codeLang: "java",
          use: ["회의실 배정은 끝나는 시간 오름차순, 같으면 시작 시간 오름차순으로 정렬한 뒤 그리디로 고른다.", "점수 내림차순, 동점이면 이름 오름차순 같은 순위표 정렬에 쓴다."],
          warn: [
            "`(a, b) -> a - b`는 오버플로로 순서가 틀릴 수 있다. `Integer.compare`를 쓴다.",
            "람다에서 `comparingInt(...).reversed()`를 쓰면 타입 추론이 실패하는 경우가 있다. `Comparator.<Student>comparingInt(...)`처럼 타입을 적는다.",
            "기본형 int[] 정렬은 최악 O(N^2)를 유도하는 테스트(안티 퀵소트)가 이론상 가능하다. 걱정되면 섞은 뒤 정렬하거나 Integer[]를 쓴다."
          ],
          answer: "Comparator로 여러 기준 정렬을 할 때는 comparingInt와 thenComparing을 이어 붙이고, 직접 비교할 때는 빼기 대신 Integer.compare를 씁니다. 객체 정렬은 TimSort라 안정 정렬이고, 기본형 배열은 퀵 정렬 계열이라 Comparator를 받지 않는다는 점도 알아 둡니다.",
          followUps: [
            [
              "안정 정렬이 필요한 경우는?",
              "이미 한 기준으로 정렬된 데이터를 다른 기준으로 다시 정렬하면서 앞의 순서를 유지하고 싶을 때입니다. 자바의 객체 정렬은 안정 정렬이라 이 성질을 믿고 써도 됩니다."
            ]
          ],
          related: [
            "algo/jabaui-jeongryeol-timsort",
            "algo/anjeong-jeongryeol",
            "algo/geuridi-algorijeum",
            "algo/priorityqueue-hwalyong"
          ]
        }
      ]
    },
    {
      name: "실수 방지",
      compare: {
        cols: ["기준", "정수 오버플로", "경계값 · 예외 케이스", "시간 초과 디버깅"],
        rows: [
          ["증상", "일부 케이스만 오답, 음수 출력", "특정 입력에서 오답·런타임 에러", "시간 초과"],
          ["첫 확인 대상", "합·곱의 최대 크기", "N = 0·1, 최댓값, 답 없음", "최대 N에서 연산 횟수"],
          ["대표 해결", "long, (long) 형변환, 나머지 연산", "경계 체크리스트, 초기화", "알고리즘 교체, 빠른 입출력"]
        ]
      },
      concepts: [
        {
          id: "algo/jeongsu-obeopeulro",
          slug: "jeongsu-obeopeulro",
          title: "정수 오버플로",
          deep: true,
          def: "계산 결과가 자료형이 담을 수 있는 범위를 넘어 엉뚱한 값(주로 음수)으로 바뀌는 현상이다.",
          why: "자바는 정수 오버플로가 나도 예외를 던지지 않고 조용히 값이 돌아간다. 로직이 맞아도 일부 테스트만 틀리는 \"맞왜틀\"의 가장 흔한 원인이다.",
          how: [
            "- int 범위: 약 ±21억(2^31 - 1 = 2,147,483,647).",
            "- long 범위: 약 ±9.2 × 10^18.",
            "- 위험 신호: 값이 10^9이고 두 개를 더하거나, 10^5개를 모두 더하거나, 두 값을 곱하는 경우. 10^5 × 10^5 = 10^10이라 int를 넘는다.",
            "- 곱셈 순서: `long x = a * b;`는 int끼리 먼저 곱해 이미 넘친 값을 long에 넣는다. `(long) a * b`로 한쪽을 먼저 long으로 바꾼다.",
            "- 이분 탐색 중간값: `(lo + hi) / 2`는 lo와 hi가 크면 넘친다. `lo + (hi - lo) / 2`나 long을 쓴다.",
            "- 나머지 연산: \"1,000,000,007로 나눈 나머지\"는 덧셈·곱셈마다 나머지를 취한다. 곱셈은 long으로 한 뒤 나머지를 구한다.",
            "- 무한대 초깃값: `Integer.MAX_VALUE`에 1을 더하면 음수가 된다. 거리 배열 초깃값은 `1e9`나 `Long.MAX_VALUE / 2`처럼 여유를 둔다.",
            "- 래퍼 비교: `Integer`끼리 `==`는 -128~127만 캐시되어 같은 객체다. 그 밖의 값은 같은 숫자여도 false가 나므로 `equals`나 `intValue()`로 비교한다."
          ],
          code: "int a = 100_000, b = 100_000;\nlong wrong = a * b;          // 1410065408 (int에서 이미 넘침)\nlong right = (long) a * b;   // 10000000000\n\nfinal int MOD = 1_000_000_007;\nlong ans = 1;\nfor (int x : arr) ans = ans * x % MOD;   // ans가 long이라 곱셈이 안전하다\n\nint INF = 1_000_000_000;     // 더해도 넘치지 않는 무한대\nif (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n\nInteger p = 1000, q = 1000;\nSystem.out.println(p == q);       // false (캐시 범위 밖)\nSystem.out.println(p.equals(q));  // true",
          codeLang: "java",
          use: ["누적합 배열, 거리 합, 경우의 수는 기본으로 long으로 선언한다.", "이분 탐색 상한이 10^9 이상이면 lo, hi, mid를 모두 long으로 둔다."],
          warn: [
            "`Math.abs(Integer.MIN_VALUE)`는 여전히 음수다.",
            "Map<Integer, Integer>의 값을 꺼내 `==`로 비교하는 코드는 작은 예제에서는 맞고 큰 값에서만 틀린다.",
            "`Math.addExact`, `Math.multiplyExact`를 쓰면 오버플로 시 예외가 나서 디버깅에 도움이 된다."
          ],
          myth: [
            [
              "결과를 long 변수에 담으면 안전하다.",
              "`long x = a * b`는 int끼리 먼저 곱해 넘친 값을 담는다. 계산 전에 `(long) a * b`로 바꿔야 한다."
            ]
          ],
          answer: "정수 오버플로는 계산 결과가 자료형 범위를 넘어 값이 돌아가는 현상이고, 자바는 예외 없이 조용히 틀린 값을 냅니다. 합이나 곱이 약 21억을 넘을 수 있으면 long을 쓰고, int끼리 곱할 때는 한쪽을 먼저 long으로 바꾸며, Integer 객체는 ==가 아니라 equals로 비교합니다.",
          analogy: "자동차 주행 거리계가 999999 다음에 000000으로 돌아가는 것과 같습니다. 고장 신호 없이 숫자만 돌아갑니다.",
          qa: [
            "정답 로직인데 일부 케이스만 틀리면 무엇부터 확인하나요?",
            "가장 먼저 정수 오버플로를 의심합니다. 합이나 곱이 21억을 넘을 수 있으면 long을 쓰고, int끼리 곱한 결과를 long에 담는 코드는 한쪽을 먼저 long으로 바꿉니다. 그다음 Integer 객체를 ==로 비교한 곳, 무한대 초깃값에 더하기를 한 곳, 빈 입력이나 N이 1인 경계 케이스를 차례로 확인합니다."
          ],
          followUps: [
            [
              "Integer끼리 ==가 어떤 때는 true, 어떤 때는 false인 이유는?",
              "Integer.valueOf는 -128부터 127까지 미리 만든 객체를 재사용하므로 이 범위에서는 같은 객체라 ==가 true입니다. 범위를 벗어나면 새 객체가 만들어져 값이 같아도 false가 됩니다."
            ],
            [
              "나머지 연산 문제에서 뺄셈은 어떻게 처리하나요?",
              "`(a - b) % MOD`는 음수가 될 수 있으므로 `((a - b) % MOD + MOD) % MOD`로 양수로 맞춥니다."
            ]
          ],
          related: [
            "algo/gyeonggyegap-yeoe-keiseu",
            "algo/priorityqueue-hwalyong",
            "algo/ibun-tamsaek",
            "algo/daikseuteura"
          ]
        },
        {
          id: "algo/gyeonggyegap-yeoe-keiseu",
          slug: "gyeonggyegap-yeoe-keiseu",
          title: "경계값 · 예외 케이스",
          deep: false,
          def: "입력의 최솟값·최댓값, 빈 입력, 모두 같은 값처럼 일반적인 예제에서 드러나지 않는 극단적인 입력이다.",
          how: [
            "예제 입력만 통과하고 제출하면 숨은 테스트에서 틀리는 경우가 많다. 제출 전에 다음 목록을 확인한다.",
            "- 크기: N = 0, N = 1, N이 최대일 때.",
            "- 값: 0, 음수, 최댓값(10^9), 모두 같은 값, 이미 정렬된 입력과 역순 입력.",
            "- 그래프: 정점 1개, 간선 0개, 연결되지 않은 그래프, 자기 자신으로 가는 간선, 같은 두 정점 사이의 중복 간선.",
            "- 격자: 1 × 1, 1 × M처럼 한 줄인 격자, 시작과 도착이 같은 경우.",
            "- 답이 없는 경우: 도달 불가면 -1을 출력하라는 조건을 놓치기 쉽다.",
            "- 문자열: 빈 문자열, 길이 1, 모두 같은 문자.",
            "- 인덱스: 배열 끝 처리, 반복문 `<`와 `<=`, 1-indexed 입력을 0-indexed 배열에 넣을 때."
          ],
          code: "// 도달 불가 처리와 시작 = 도착\nif (sx == ex && sy == ey) { System.out.println(0); return; }\nint ans = bfs();\nSystem.out.println(ans == INF ? -1 : ans);\n\n// 1-indexed 입력: 크기를 n + 1로 잡으면 변환 실수가 줄어든다\nList<Integer>[] graph = new ArrayList[n + 1];\nfor (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();",
          codeLang: "java",
          use: ["제출 전 체크리스트를 템플릿 주석으로 넣어 두고 매번 확인한다.", "직접 만든 극단 입력(N = 1, 모두 같은 값, 최댓값)을 돌려 본 뒤 제출한다."],
          warn: [
            "최대 입력에서 재귀 깊이가 10만을 넘으면 StackOverflowError가 난다. 반복문이나 명시적 스택으로 바꾼다.",
            "다중 테스트 케이스 문제에서 전역 배열·컬렉션을 초기화하지 않으면 두 번째 케이스부터 틀린다."
          ],
          answer: "경계값은 N이 0이나 1일 때, 값이 최대일 때, 답이 없을 때처럼 예제에 잘 드러나지 않는 입력입니다. 제출 전에 크기, 값, 그래프 연결성, 답 없음, 인덱스 기준을 체크리스트로 확인하고, 다중 테스트 케이스에서는 전역 상태를 매번 초기화합니다.",
          followUps: [
            [
              "재귀 DFS가 최대 입력에서 런타임 에러가 나면?",
              "재귀 깊이가 커서 StackOverflowError가 난 것입니다. 명시적인 스택으로 반복 DFS를 만들거나, 새 Thread를 큰 스택 크기로 만들어 그 안에서 실행합니다."
            ]
          ],
          related: ["algo/jeongsu-obeopeulro", "algo/simyulreisyeon-guhyeon", "algo/jaegwiwa-hochul-seutaek"]
        },
        {
          id: "algo/sigan-chogwa-dibeoging",
          slug: "sigan-chogwa-dibeoging",
          title: "시간 초과 디버깅",
          deep: false,
          def: "제출 결과가 시간 초과일 때 원인이 복잡도인지, 입출력이나 자바 구현의 상수 배인지 좁혀 고치는 과정이다.",
          how: [
            "1) 복잡도 재계산: 최대 N을 넣어 연산 횟수를 다시 센다. 1억을 크게 넘으면 알고리즘 자체를 바꿔야 한다.",
            "2) 입출력 확인: Scanner, 반복 println, 문자열 `+=` 이어 붙이기를 BufferedReader와 StringBuilder로 바꾼다.",
            "3) 숨은 O(N) 연산 찾기: 반복문 안의 `list.contains`, `list.remove(0)`, `ArrayList.indexOf`, `String.substring` 반복, `pq.remove(obj)`.",
            "4) 무한 루프 확인: BFS에서 방문 표시를 큐에 넣을 때가 아니라 꺼낼 때 하면 같은 정점이 여러 번 들어가 폭발한다.",
            "5) 박싱 줄이기: `List<Integer>`, `HashMap<Integer, Integer>`를 수백만 번 다루면 느리다. 가능하면 기본형 배열을 쓴다.",
            "6) 최대 입력 직접 만들기: 랜덤으로 최대 크기 입력을 생성해 로컬에서 시간을 재 본다."
          ],
          flow: ["연산 횟수 재계산", "입출력 교체", "숨은 O(N) 제거", "방문 처리 확인", "최대 입력으로 측정"],
          code: "// 숨은 O(N): 리스트 앞에서 빼기 → 전체 O(N^2)\nList<Integer> list = new ArrayList<>();\nwhile (!list.isEmpty()) list.remove(0);      // 매번 원소를 당긴다\n\n// O(1)로 바꾸기\nArrayDeque<Integer> dq = new ArrayDeque<>();\nwhile (!dq.isEmpty()) dq.pollFirst();\n\n// BFS 방문 표시는 넣을 때 한다\nif (!visited[next]) { visited[next] = true; q.offer(next); }\n\n// 최대 입력 만들어 시간 재기\nlong t0 = System.nanoTime();\nsolve();\nSystem.err.println((System.nanoTime() - t0) / 1_000_000 + \"ms\");",
          codeLang: "java",
          use: ["랜덤 최대 입력 생성기를 만들어 두고, 풀이를 바꿀 때마다 실행 시간을 비교한다."],
          warn: [
            "자바는 처음 몇백 ms가 JVM 기동과 JIT 워밍업에 쓰인다. 시간 제한이 빡빡하면 상수 최적화도 효과가 크다.",
            "`String s += x`를 반복하면 매번 새 문자열을 만들어 O(N^2)이 된다."
          ],
          myth: [
            [
              "시간 초과는 무조건 알고리즘이 틀렸다는 뜻이다.",
              "자바에서는 Scanner, println 반복, 박싱처럼 상수 배 문제로도 시간 초과가 난다. 복잡도가 맞으면 구현부터 점검한다."
            ]
          ],
          answer: "시간 초과가 나면 최대 입력에서 연산 횟수를 다시 세어 알고리즘 문제인지 먼저 판단하고, 아니라면 입출력 방식, 반복문 안의 숨은 O(N) 연산, BFS 방문 표시 위치, 박싱 비용 순으로 확인합니다. 최대 크기 입력을 직접 만들어 로컬에서 시간을 재면 원인을 빠르게 좁힐 수 있습니다.",
          followUps: [
            [
              "HashMap이 느릴 수 있나요?",
              "키가 Integer라 박싱이 계속 일어나고, 해시 충돌을 유도한 입력이면 버킷이 몰려 느려질 수 있습니다. 키 범위가 작으면 배열로 바꾸는 것이 가장 빠릅니다."
            ]
          ],
          related: [
            "algo/ppareun-ipchulryeok",
            "algo/jaba-yeonsan-sokdo-gamgak",
            "algo/big-o-pyogibeop",
            "algo/arraydeque-hwalyong"
          ]
        }
      ]
    }
  ]
};

export default topic;
