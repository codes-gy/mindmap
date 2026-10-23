(window.MINDMAP = window.MINDMAP || {})['algo-5'] = {
  name: '코딩테스트 실전',
  groups: [
    { name: '문제 접근', items: [
      { t: '문제 유형 판별 신호', deep: true,
        d: '문제 문장과 입력 크기에 들어 있는 단서를 보고 어떤 알고리즘을 쓸지 빠르게 좁히는 방법이다.',
        why: '코딩테스트는 시간이 제한되어 있어 풀이 방향을 늦게 잡으면 구현할 시간이 없다. 자주 나오는 표현과 기법의 짝을 외워 두면 처음 5분 안에 방향을 정할 수 있다.',
        how: [
          '먼저 입력 크기(N)로 허용되는 복잡도를 정하고, 그다음 문장 속 표현으로 기법을 고른다.',
          '- N ≤ 10: 순열 완전 탐색 O(N!)이 가능하다.',
          '- N ≤ 20: 부분집합 완전 탐색 O(2^N)이나 비트마스크 DP가 가능하다.',
          '- N ≤ 500: O(N^3). 플로이드-워셜, 구간 DP.',
          '- N ≤ 5,000: O(N^2) DP나 이중 반복문.',
          '- N ≤ 100,000~1,000,000: O(N log N) 이하. 정렬, 이분 탐색, 힙, 투 포인터, 누적합.',
          '- 값의 범위가 10^9 이상: 값 자체를 기준으로 이분 탐색(파라메트릭 서치)하거나 좌표 압축.',
          '문장 표현과 기법의 대응은 다음과 같다.',
          '- "최솟값의 최댓값", "최대값의 최솟값", "조건을 만족하는 최소 X": 파라메트릭 서치.',
          '- "연속 부분 배열의 합", "구간 합 질의": 누적합. 원소가 모두 양수면 투 포인터.',
          '- "길이 K인 연속 구간": 슬라이딩 윈도우.',
          '- "가중치 없는 최단 거리", "최소 이동 횟수": BFS. 가중치가 0과 1뿐이면 0-1 BFS.',
          '- "가중치 있는 최단 거리"(음수 없음): 다익스트라.',
          '- "여러 곳에서 동시에 퍼진다": 다중 시작점 BFS.',
          '- "모든 경우를 나열", "가능한 조합": 백트래킹.',
          '- "경우의 수", "최대 이익"에서 같은 부분 문제가 반복: DP. 결과를 1,000,000,007로 나눈 나머지를 요구하면 거의 DP다.',
          '- "매 순간 가장 좋은 선택"이 증명되면: 그리디. 보통 정렬과 함께 쓴다.',
          '- "구간 합/최솟값 + 값 갱신"이 섞여 있음: 세그먼트 트리나 펜윅 트리.',
          '- "다음으로 큰 수", "오른쪽에서 처음 만나는 더 큰 값": 모노토닉 스택.',
          '- "선후 관계", "작업 순서": 위상 정렬.',
          '- "그룹으로 묶기", "같은 집합인가": 유니온 파인드.',
          '- "등장 횟수", "중복 확인": 해시맵으로 빈도 세기.'
        ],
        code: `// 풀이 전 체크리스트를 주석으로 적고 시작한다
// 1) N 최대 = 100,000 → O(N log N) 이하
// 2) 값 범위 = 10^9 → 합은 long
// 3) 표현: "최소 비용으로 K개 이상" → 파라메트릭 서치 후보
// 4) 판정 함수 check(mid)가 단조(mid가 커지면 계속 true)인지 확인
long lo = 0, hi = 2_000_000_000L;
while (lo < hi) {
    long mid = (lo + hi) / 2;
    if (check(mid)) hi = mid;   // 조건 만족 → 더 작은 값도 되는지 본다
    else lo = mid + 1;
}
System.out.println(lo);`,
        warn: [
          '신호는 후보를 좁힐 뿐 정답을 보장하지 않는다. 그리디는 반례를 하나 떠올려 보고, 안 되면 DP로 바꾼다.',
          '입력 크기를 확인하지 않고 익숙한 풀이부터 짜면 시간 초과로 처음부터 다시 쓰게 된다.'
        ],
        qa: ['처음 보는 문제를 어떻게 접근하나요?',
          '먼저 입력 크기로 허용 가능한 시간 복잡도를 정합니다. N이 10만이면 O(N log N) 이하여야 하므로 정렬, 이분 탐색, 투 포인터, 힙 같은 후보로 좁힙니다. 그다음 "최솟값의 최댓값"이면 파라메트릭 서치, "가중치 없는 최단 거리"면 BFS처럼 문장의 표현으로 기법을 고르고, 작은 예제로 손으로 검증한 뒤 구현합니다.'],
        rel: ['입력 크기로 알고리즘 고르기', '파라메트릭 서치', '누적합', 'BFS', '완전 탐색'] },
      { t: '완전 탐색', deep: true,
        d: '가능한 모든 경우를 하나도 빠짐없이 확인해 답을 찾는 방법으로, 브루트 포스라고도 한다.',
        why: '정답을 확실히 찾는 가장 단순한 방법이고, 입력이 작으면 그대로 정답 풀이가 된다. 입력이 클 때도 작은 입력용 완전 탐색을 만들어 최적화한 풀이의 정답을 검증할 수 있다.',
        how: [
          '1) 경우의 수를 센다. 1억(10^8) 번 안쪽이면 대체로 1초 안에 끝난다.',
          '2) 탐색 방식을 고른다.',
          '- 반복문: 경우가 고정된 개수의 선택이면 중첩 for 문으로 충분하다.',
          '- 순열: 순서가 중요하면 N! 가지. N ≤ 10 정도까지.',
          '- 부분집합: 고를지 말지 두 가지 선택이면 2^N 가지. N ≤ 20 정도까지. 비트마스크로 나열하면 간단하다.',
          '- 재귀(백트래킹): 조건에 맞지 않는 가지를 일찍 잘라 내면 실제 탐색량이 크게 줄어든다.',
          '- BFS/DFS: 상태를 정점으로 보고 상태 공간을 탐색한다.',
          '3) 각 경우마다 조건을 확인하고 최댓값·최솟값·개수를 갱신한다.',
          '경우의 수를 세 보면 완전 탐색이 되는지, 다른 기법이 필요한지 바로 판단할 수 있다.'
        ],
        code: `// 부분집합 완전 탐색: N ≤ 20일 때 합이 S인 부분집합 개수
int count = 0;
for (int mask = 1; mask < (1 << n); mask++) {
    long sum = 0;
    for (int i = 0; i < n; i++) {
        if ((mask & (1 << i)) != 0) sum += arr[i];
    }
    if (sum == s) count++;
}
System.out.println(count);`,
        warn: [
          '경우의 수를 세지 않고 짜면 N이 조금만 커져도 시간 초과가 난다. 2^25나 12!은 이미 3천만~5억 단위다.',
          '재귀 완전 탐색은 깊이가 깊으면 StackOverflowError가 날 수 있다.'
        ],
        qa: ['완전 탐색이 가능한지 어떻게 판단하나요?',
          '전체 경우의 수와 경우 하나를 확인하는 비용을 곱해 대략 1억 번 이하인지 봅니다. 예를 들어 N이 20이고 부분집합마다 O(N)으로 확인하면 2^20 × 20, 약 2천만 번이라 충분합니다. 이 값을 넘으면 백트래킹으로 가지를 자르거나, 중복되는 부분 문제를 DP로 바꾸는 등 다른 방법을 찾습니다.'],
        rel: ['순열 · 조합 생성', '백트래킹', '비트마스킹', '입력 크기로 알고리즘 고르기'] },
      { t: '시뮬레이션 · 구현', deep: false,
        d: '문제에서 설명한 규칙을 그대로 코드로 옮겨 단계별로 상태를 바꿔 가는 유형이다.',
        how: [
          '특별한 알고리즘보다 정확하고 실수 없이 구현하는 능력을 본다. 격자 이동, 회전, 게임 규칙 문제가 대표적이다.',
          '- 방향 배열: 상하좌우 이동을 `dx`, `dy` 배열로 두면 if 문 네 개가 반복문 하나로 줄어든다.',
          '- 범위 검사 함수: `inRange(x, y)`를 따로 만들어 경계 검사 실수를 줄인다.',
          '- 상태 분리: 한 턴에 여러 칸이 동시에 바뀌면 새 배열에 결과를 쓰고 마지막에 교체한다. 같은 배열을 바로 고치면 앞에서 바뀐 값이 뒤 계산에 섞인다.',
          '- 2차원 배열 회전: 시계 방향 90도는 `new[j][n - 1 - i] = old[i][j]`다.',
          '- 함수 분리: 이동, 충돌 처리, 점수 계산을 각각 함수로 나누면 디버깅이 쉽다.'
        ],
        code: `int[] dx = {-1, 0, 1, 0}; // 상, 우, 하, 좌 (시계 방향)
int[] dy = {0, 1, 0, -1};

int dir = 0, x = 0, y = 0;
for (char cmd : commands) {
    if (cmd == 'R') dir = (dir + 1) % 4;        // 오른쪽으로 회전
    else if (cmd == 'L') dir = (dir + 3) % 4;   // 왼쪽 회전: -1 대신 +3
    else {
        int nx = x + dx[dir], ny = y + dy[dir];
        if (inRange(nx, ny) && map[nx][ny] != WALL) { x = nx; y = ny; }
    }
}

boolean inRange(int x, int y) { return 0 <= x && x < n && 0 <= y && y < m; }`,
        warn: [
          '`(dir - 1) % 4`는 자바에서 음수가 될 수 있다. `(dir + 3) % 4`처럼 양수로 만든다.',
          '행(x)과 열(y), 가로(W)와 세로(H)를 문제마다 다르게 부르므로 처음에 기준을 정하고 주석으로 적는다.'
        ],
        rel: ['완전 탐색', '경계값 · 예외 케이스', 'BFS'] },
      { t: '순열 · 조합 생성', deep: false,
        d: '원소들 중 일부 또는 전부를 골라 순서를 고려한 배열(순열)이나 순서 없는 묶음(조합)을 빠짐없이 나열하는 방법이다.',
        how: [
          '자바에는 파이썬의 itertools 같은 표준 도구가 없어 재귀로 직접 만든다.',
          '- 순열 nPr: 방문 배열로 이미 쓴 원소를 건너뛰며 깊이 r까지 고른다. 개수는 n!/(n-r)!.',
          '- 조합 nCr: 시작 인덱스를 넘겨 앞에서 고른 원소보다 뒤만 고르게 하면 중복 없이 나열된다. 개수는 n!/(r!(n-r)!).',
          '- 중복 순열: 방문 배열 없이 매번 전체에서 고른다. n^r.',
          '- 중복 조합: 다음 시작 인덱스를 i+1이 아니라 i로 넘긴다.',
          '- 다음 순열(next permutation): 사전순 다음 순열을 반복으로 구한다. 재귀 없이 순열을 나열하고, 같은 값이 섞여 있어도 중복 없이 나열된다.',
          '부분집합(모든 크기의 조합)은 비트마스크 반복문이 더 간단하다.'
        ],
        code: `// 조합 nCr: start 이후만 골라 중복을 막는다
int[] picked = new int[r];
void comb(int depth, int start) {
    if (depth == r) { process(picked); return; }
    for (int i = start; i < n; i++) {
        picked[depth] = arr[i];
        comb(depth + 1, i + 1);   // 중복 조합이면 i
    }
}

// 순열 nPr: 방문 배열로 이미 쓴 원소를 건너뛴다
boolean[] used = new boolean[n];
void perm(int depth) {
    if (depth == r) { process(picked); return; }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = true;
        picked[depth] = arr[i];
        perm(depth + 1);
        used[i] = false;          // 되돌리기
    }
}`,
        warn: [
          '결과를 리스트에 저장할 때 `picked` 배열을 그대로 넣으면 모두 같은 배열을 가리킨다. `picked.clone()`으로 복사한다.',
          '10! = 362만, 11! = 약 4천만이다. 순열 완전 탐색은 N이 10 근처가 한계다.'
        ],
        rel: ['완전 탐색', '백트래킹', '비트마스킹'] }
    ]},
    { name: '자바 도구', items: [
      { t: '빠른 입출력', deep: true,
        d: '`Scanner`와 `System.out.println` 대신 버퍼를 쓰는 `BufferedReader`, `StringTokenizer`, `StringBuilder`로 입출력 시간을 줄이는 방법이다.',
        why: '입력이 수십만 줄이면 알고리즘이 맞아도 입출력만으로 시간 초과가 난다. `Scanner`는 정규식으로 토큰을 나눠 느리고, `println`을 반복하면 매번 출력 스트림을 비워 느리다.',
        how: [
          '- BufferedReader: 큰 버퍼에 한꺼번에 읽어 두고 `readLine()`으로 한 줄씩 꺼낸다. Scanner보다 수 배 빠르다.',
          '- StringTokenizer: 한 줄을 공백 기준으로 나눈다. `split(" ")`보다 빠르고 배열을 만들지 않는다.',
          '- StringBuilder: 출력할 내용을 모아 두었다가 마지막에 한 번만 출력한다.',
          '- BufferedWriter: 출력이 매우 많으면 `write` 후 마지막에 `flush`한다.',
          '- 숫자 변환: `Integer.parseInt`, `Long.parseLong`. 입력 값 범위가 int를 넘는지 먼저 확인한다.',
          '입력 크기가 10만 줄을 넘으면 처음부터 이 템플릿을 쓴다.'
        ],
        code: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int q = Integer.parseInt(st.nextToken());

        long[] arr = new long[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) arr[i] = Long.parseLong(st.nextToken());

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < q; i++) {
            // ... 질의 처리
            sb.append(answer).append('\\n');
        }
        System.out.print(sb);   // 한 번만 출력한다
    }
}`,
        warn: [
          '한 줄에 숫자가 몇 개인지 정해지지 않았거나 여러 줄에 걸쳐 오면 `st.hasMoreTokens()`가 false일 때 다음 줄을 읽는다.',
          '`System.out.println`을 반복문 안에서 수십만 번 부르면 출력만으로 시간 초과가 날 수 있다.',
          '프로그래머스처럼 함수만 구현하는 환경에서는 입출력 최적화가 필요 없다.'
        ],
        qa: ['Scanner 대신 BufferedReader를 쓰는 이유는?',
          'Scanner는 입력을 읽을 때마다 정규식으로 토큰을 해석하고 버퍼도 작아 대량 입력에서 느립니다. BufferedReader는 큰 버퍼로 한꺼번에 읽고 줄 단위로 문자열을 돌려주며, StringTokenizer로 공백을 나누면 훨씬 빠릅니다. 출력도 StringBuilder에 모아 한 번에 내보내면 입출력 때문에 시간 초과가 나는 일을 막을 수 있습니다.'],
        rel: ['시간 초과 디버깅', '자바 연산 속도 감각'] },
      { t: 'PriorityQueue 활용', deep: false,
        d: '자바의 힙 기반 우선순위 큐로, 넣은 순서와 상관없이 우선순위가 가장 높은 원소를 O(log N)에 꺼낸다.',
        how: [
          '- 기본은 최소 힙이다. `poll()`이 가장 작은 값을 꺼낸다.',
          '- 최대 힙: `new PriorityQueue<>(Collections.reverseOrder())`.',
          '- 객체·배열: Comparator로 기준을 정한다. `(a, b) -> Integer.compare(a[1], b[1])`.',
          '- 연산 비용: `offer`, `poll` O(log N), `peek` O(1). `remove(Object)`와 `contains`는 O(N)이다.',
          '- 쓰임: 다익스트라, K번째로 작은 값, 회의실 배정, 작업 스케줄링, 두 힙으로 중앙값 유지.',
          '- 갱신이 필요하면 값을 바꾸지 말고 새 원소를 넣는다. 꺼낼 때 이미 처리했거나 오래된 값이면 건너뛴다(lazy deletion).'
        ],
        code: `// [정점, 거리]를 거리 오름차순으로
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[1], b[1]));
pq.offer(new int[]{start, 0});
while (!pq.isEmpty()) {
    int[] cur = pq.poll();
    if (cur[1] > dist[cur[0]]) continue;   // 오래된 항목은 건너뛴다
    // ...
}

// 잘못된 비교: 값이 크면 빼기에서 오버플로가 나 순서가 뒤집힌다
// (a, b) -> a[1] - b[1]`,
        warn: [
          '`a - b` 비교자는 값이 음수와 큰 양수로 섞이면 int 오버플로로 부호가 뒤집힌다. `Integer.compare`나 `Long.compare`를 쓴다.',
          '큐에 넣은 객체의 비교 필드를 나중에 바꾸면 힙 순서가 깨진다. 바꿀 값이면 새 객체를 넣는다.',
          'for-each로 순회하면 정렬 순서가 아니다. 순서대로 보려면 `poll`로 꺼내야 한다.'
        ],
        rel: ['다익스트라', 'Comparator 정렬', '정수 오버플로', '그리디 알고리즘'] },
      { t: 'ArrayDeque 활용', deep: false,
        d: '배열 기반 원형 버퍼로 구현된 덱으로, 자바에서 스택과 큐를 모두 대신하는 기본 자료구조다.',
        how: [
          '- 큐로 쓰기: `offer`(뒤에 넣기), `poll`(앞에서 꺼내기). BFS의 기본 큐다.',
          '- 스택으로 쓰기: `push`, `pop`, `peek`. 모두 앞쪽에서 동작한다.',
          '- 덱으로 쓰기: `offerFirst`, `offerLast`, `pollFirst`, `pollLast`. 0-1 BFS, 슬라이딩 윈도우 최댓값에 쓴다.',
          '- Stack보다 빠르다: `Stack`은 `Vector`를 상속해 모든 메서드가 synchronized다.',
          '- LinkedList보다 빠르다: 노드 객체를 만들지 않아 메모리 할당과 캐시 미스가 적다.',
          '- null을 넣을 수 없다. 빈 덱에서 `poll`은 null, `pop`·`remove`는 예외를 던진다.'
        ],
        code: `// BFS 큐
ArrayDeque<int[]> q = new ArrayDeque<>();
q.offer(new int[]{sx, sy});

// 스택: 괄호 검사
ArrayDeque<Character> stack = new ArrayDeque<>();
for (char c : s.toCharArray()) {
    if (c == '(') stack.push(c);
    else if (stack.isEmpty()) return false;
    else stack.pop();
}
return stack.isEmpty();

// 0-1 BFS: 비용 0이면 앞에, 1이면 뒤에
if (w == 0) dq.offerFirst(next); else dq.offerLast(next);`,
        warn: [
          '`push`는 앞에 넣고 `offer`는 뒤에 넣는다. 한 덱에서 섞어 쓰면 순서가 꼬인다.',
          '빈 덱에서 `pop()`은 `NoSuchElementException`을 던진다. 꺼내기 전에 `isEmpty()`를 확인한다.'
        ],
        rel: ['BFS', '0-1 BFS', '모노토닉 스택', '슬라이딩 윈도우'] },
      { t: 'TreeMap · TreeSet 활용', deep: false,
        d: '레드블랙 트리로 키를 정렬된 상태로 유지하는 맵과 셋으로, 삽입·삭제·검색과 함께 "가장 가까운 키" 조회를 O(log N)에 한다.',
        how: [
          'HashMap은 순서가 없지만 TreeMap은 키가 항상 정렬되어 있어, 값이 계속 추가·삭제되는 상황에서 이웃 값을 찾을 때 쓴다.',
          '- `floorKey(x)`: x 이하 중 가장 큰 키. 없으면 null.',
          '- `ceilingKey(x)`: x 이상 중 가장 작은 키.',
          '- `lowerKey(x)`, `higherKey(x)`: x 미만·초과.',
          '- `firstKey()`, `lastKey()`, `pollFirstEntry()`: 최솟값·최댓값 조회와 제거.',
          '- `headMap`, `tailMap`, `subMap`: 범위 조회.',
          '- 중복 값을 다루려면 TreeMap<값, 개수>로 멀티셋을 만든다.',
          '정렬된 배열 + 이분 탐색은 값이 바뀌지 않을 때, TreeMap은 값이 계속 바뀔 때 쓴다.'
        ],
        code: `// 멀티셋: 최솟값·최댓값을 넣고 빼는 이중 우선순위 큐
TreeMap<Integer, Integer> ms = new TreeMap<>();
void add(int x) { ms.merge(x, 1, Integer::sum); }
void remove(int x) {
    if (ms.merge(x, -1, Integer::sum) == 0) ms.remove(x);
}
int min = ms.firstKey(), max = ms.lastKey();

// 가장 가까운 값
Integer lo = ms.floorKey(target);     // target 이하 최대 (없으면 null)
Integer hi = ms.ceilingKey(target);   // target 이상 최소`,
        warn: [
          '`floorKey` 결과를 바로 `int`에 넣으면 null일 때 NullPointerException이 난다. `Integer`로 받고 null을 확인한다.',
          'HashMap보다 상수 배가 크다. 순서가 필요 없으면 HashMap을 쓴다.'
        ],
        rel: ['lower bound · upper bound', 'PriorityQueue 활용', '해시로 빈도 세기'] },
      { t: 'Comparator 정렬', deep: false,
        d: '`Arrays.sort`와 `Collections.sort`에 비교 규칙을 넘겨 여러 기준으로 정렬하는 방법이다.',
        how: [
          '- 여러 기준: `Comparator.comparingInt(...).thenComparing(...)`으로 1차, 2차 기준을 이어 붙인다.',
          '- 내림차순: `.reversed()` 또는 비교 순서를 바꾼 `Integer.compare(b, a)`.',
          '- 기본형 배열(`int[]`): `Arrays.sort`는 듀얼 피벗 퀵 정렬이라 Comparator를 받지 않는다. 내림차순이 필요하면 오름차순 정렬 후 뒤집거나 `Integer[]`로 바꾼다.',
          '- 객체 배열·리스트: TimSort라 안정 정렬이다. 같은 키끼리는 입력 순서가 유지된다.',
          '- 2차원 배열: `Arrays.sort(arr, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]))`.',
          '- 문자열: 기본은 사전순. 길이 우선이면 `comparingInt(String::length).thenComparing(Comparator.naturalOrder())`.'
        ],
        code: `// 점수 내림차순, 같으면 이름 오름차순
list.sort(Comparator.comparingInt(Student::score).reversed()
        .thenComparing(Student::name));

// 회의실 배정: 끝나는 시간, 같으면 시작 시간 오름차순
Arrays.sort(meetings, (a, b) -> a[1] != b[1]
        ? Integer.compare(a[1], b[1])
        : Integer.compare(a[0], b[0]));`,
        warn: [
          '`(a, b) -> a - b`는 오버플로로 순서가 틀릴 수 있다. `Integer.compare`를 쓴다.',
          '람다에서 `comparingInt(...).reversed()`를 쓰면 타입 추론이 실패하는 경우가 있다. `Comparator.<Student>comparingInt(...)`처럼 타입을 적는다.',
          '기본형 int[] 정렬은 최악 O(N^2)를 유도하는 테스트(안티 퀵소트)가 이론상 가능하다. 걱정되면 섞은 뒤 정렬하거나 Integer[]를 쓴다.'
        ],
        rel: ['자바의 정렬 (TimSort)', '안정 정렬', '그리디 알고리즘', 'PriorityQueue 활용'] }
    ]},
    { name: '실수 방지', items: [
      { t: '정수 오버플로', deep: true,
        d: '계산 결과가 자료형이 담을 수 있는 범위를 넘어 엉뚱한 값(주로 음수)으로 바뀌는 현상이다.',
        why: '자바는 정수 오버플로가 나도 예외를 던지지 않고 조용히 값이 돌아간다. 로직이 맞아도 일부 테스트만 틀리는 "맞왜틀"의 가장 흔한 원인이다.',
        how: [
          '- int 범위: 약 ±21억(2^31 - 1 = 2,147,483,647).',
          '- long 범위: 약 ±9.2 × 10^18.',
          '- 위험 신호: 값이 10^9이고 두 개를 더하거나, 10^5개를 모두 더하거나, 두 값을 곱하는 경우. 10^5 × 10^5 = 10^10이라 int를 넘는다.',
          '- 곱셈 순서: `long x = a * b;`는 int끼리 먼저 곱해 이미 넘친 값을 long에 넣는다. `(long) a * b`로 한쪽을 먼저 long으로 바꾼다.',
          '- 이분 탐색 중간값: `(lo + hi) / 2`는 lo와 hi가 크면 넘친다. `lo + (hi - lo) / 2`나 long을 쓴다.',
          '- 나머지 연산: "1,000,000,007로 나눈 나머지"는 덧셈·곱셈마다 나머지를 취한다. 곱셈은 long으로 한 뒤 나머지를 구한다.',
          '- 무한대 초깃값: `Integer.MAX_VALUE`에 1을 더하면 음수가 된다. 거리 배열 초깃값은 `1e9`나 `Long.MAX_VALUE / 2`처럼 여유를 둔다.',
          '- 래퍼 비교: `Integer`끼리 `==`는 -128~127만 캐시되어 같은 객체다. 그 밖의 값은 같은 숫자여도 false가 나므로 `equals`나 `intValue()`로 비교한다.'
        ],
        code: `int a = 100_000, b = 100_000;
long wrong = a * b;          // 1410065408 (int에서 이미 넘침)
long right = (long) a * b;   // 10000000000

final int MOD = 1_000_000_007;
long ans = 1;
for (int x : arr) ans = ans * x % MOD;   // ans가 long이라 곱셈이 안전하다

int INF = 1_000_000_000;     // 더해도 넘치지 않는 무한대
if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;

Integer p = 1000, q = 1000;
System.out.println(p == q);       // false (캐시 범위 밖)
System.out.println(p.equals(q));  // true`,
        warn: [
          '`Math.abs(Integer.MIN_VALUE)`는 여전히 음수다.',
          'Map<Integer, Integer>의 값을 꺼내 `==`로 비교하는 코드는 작은 예제에서는 맞고 큰 값에서만 틀린다.',
          '`Math.addExact`, `Math.multiplyExact`를 쓰면 오버플로 시 예외가 나서 디버깅에 도움이 된다.'
        ],
        qa: ['정답 로직인데 일부 케이스만 틀리면 무엇부터 확인하나요?',
          '가장 먼저 정수 오버플로를 의심합니다. 합이나 곱이 21억을 넘을 수 있으면 long을 쓰고, int끼리 곱한 결과를 long에 담는 코드는 한쪽을 먼저 long으로 바꿉니다. 그다음 Integer 객체를 ==로 비교한 곳, 무한대 초깃값에 더하기를 한 곳, 빈 입력이나 N이 1인 경계 케이스를 차례로 확인합니다.'],
        rel: ['경계값 · 예외 케이스', 'PriorityQueue 활용', '이분 탐색', '다익스트라'] },
      { t: '경계값 · 예외 케이스', deep: false,
        d: '입력의 최솟값·최댓값, 빈 입력, 모두 같은 값처럼 일반적인 예제에서 드러나지 않는 극단적인 입력이다.',
        how: [
          '예제 입력만 통과하고 제출하면 숨은 테스트에서 틀리는 경우가 많다. 제출 전에 다음 목록을 확인한다.',
          '- 크기: N = 0, N = 1, N이 최대일 때.',
          '- 값: 0, 음수, 최댓값(10^9), 모두 같은 값, 이미 정렬된 입력과 역순 입력.',
          '- 그래프: 정점 1개, 간선 0개, 연결되지 않은 그래프, 자기 자신으로 가는 간선, 같은 두 정점 사이의 중복 간선.',
          '- 격자: 1 × 1, 1 × M처럼 한 줄인 격자, 시작과 도착이 같은 경우.',
          '- 답이 없는 경우: 도달 불가면 -1을 출력하라는 조건을 놓치기 쉽다.',
          '- 문자열: 빈 문자열, 길이 1, 모두 같은 문자.',
          '- 인덱스: 배열 끝 처리, 반복문 `<`와 `<=`, 1-indexed 입력을 0-indexed 배열에 넣을 때.'
        ],
        code: `// 도달 불가 처리와 시작 = 도착
if (sx == ex && sy == ey) { System.out.println(0); return; }
int ans = bfs();
System.out.println(ans == INF ? -1 : ans);

// 1-indexed 입력: 크기를 n + 1로 잡으면 변환 실수가 줄어든다
List<Integer>[] graph = new ArrayList[n + 1];
for (int i = 1; i <= n; i++) graph[i] = new ArrayList<>();`,
        warn: [
          '최대 입력에서 재귀 깊이가 10만을 넘으면 StackOverflowError가 난다. 반복문이나 명시적 스택으로 바꾼다.',
          '다중 테스트 케이스 문제에서 전역 배열·컬렉션을 초기화하지 않으면 두 번째 케이스부터 틀린다.'
        ],
        rel: ['정수 오버플로', '시뮬레이션 · 구현', '재귀와 호출 스택'] },
      { t: '시간 초과 디버깅', deep: false,
        d: '제출 결과가 시간 초과일 때 원인이 복잡도인지, 입출력이나 자바 구현의 상수 배인지 좁혀 고치는 과정이다.',
        how: [
          '1) 복잡도 재계산: 최대 N을 넣어 연산 횟수를 다시 센다. 1억을 크게 넘으면 알고리즘 자체를 바꿔야 한다.',
          '2) 입출력 확인: Scanner, 반복 println, 문자열 `+=` 이어 붙이기를 BufferedReader와 StringBuilder로 바꾼다.',
          '3) 숨은 O(N) 연산 찾기: 반복문 안의 `list.contains`, `list.remove(0)`, `ArrayList.indexOf`, `String.substring` 반복, `pq.remove(obj)`.',
          '4) 무한 루프 확인: BFS에서 방문 표시를 큐에 넣을 때가 아니라 꺼낼 때 하면 같은 정점이 여러 번 들어가 폭발한다.',
          '5) 박싱 줄이기: `List<Integer>`, `HashMap<Integer, Integer>`를 수백만 번 다루면 느리다. 가능하면 기본형 배열을 쓴다.',
          '6) 최대 입력 직접 만들기: 랜덤으로 최대 크기 입력을 생성해 로컬에서 시간을 재 본다.'
        ],
        code: `// 숨은 O(N): 리스트 앞에서 빼기 → 전체 O(N^2)
List<Integer> list = new ArrayList<>();
while (!list.isEmpty()) list.remove(0);      // 매번 원소를 당긴다

// O(1)로 바꾸기
ArrayDeque<Integer> dq = new ArrayDeque<>();
while (!dq.isEmpty()) dq.pollFirst();

// BFS 방문 표시는 넣을 때 한다
if (!visited[next]) { visited[next] = true; q.offer(next); }

// 최대 입력 만들어 시간 재기
long t0 = System.nanoTime();
solve();
System.err.println((System.nanoTime() - t0) / 1_000_000 + "ms");`,
        warn: [
          '자바는 처음 몇백 ms가 JVM 기동과 JIT 워밍업에 쓰인다. 시간 제한이 빡빡하면 상수 최적화도 효과가 크다.',
          '`String s += x`를 반복하면 매번 새 문자열을 만들어 O(N^2)이 된다.'
        ],
        rel: ['빠른 입출력', '자바 연산 속도 감각', 'Big-O 표기법', 'ArrayDeque 활용'] }
    ]}
  ],
  must: [
    '입력 크기로 허용 복잡도를 먼저 정한다. N ≤ 20이면 2^N, N ≤ 10만이면 O(N log N) 이하다.',
    '입력이 많으면 BufferedReader + StringTokenizer, 출력은 StringBuilder에 모아 한 번에 낸다.',
    '합·곱이 21억을 넘을 수 있으면 long을 쓰고, 비교자는 빼기 대신 `Integer.compare`를 쓴다.',
    '스택과 큐는 ArrayDeque, 정렬된 상태의 이웃 값 조회는 TreeMap, 최솟값 반복 추출은 PriorityQueue다.'
  ]
};
